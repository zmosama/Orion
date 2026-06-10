import { prisma } from "./prisma";
import {
  OrderStatus,
  PaymentMethod,
  CANCELLABLE_STATUSES,
  RESERVATION_MINUTES,
  MAX_QTY_PER_ITEM,
  SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
  type PaymentMethodType,
  type OrderStatusType,
} from "./constants";
import type { Prisma } from "@prisma/client";

export class OutOfStockError extends Error {
  constructor(
    public titleEn: string,
    public titleAr: string,
    public available: number,
  ) {
    super(
      available > 0
        ? `Only ${available} left of "${titleEn}"`
        : `"${titleEn}" is out of stock`,
    );
    this.name = "OutOfStockError";
  }

  /** رسالة جاهزة حسب اللغة — للـ API responses */
  localizedMessage(locale: string): string {
    if (locale === "ar") {
      return this.available > 0
        ? `المتاح من "${this.titleAr}" هو ${this.available} فقط`
        : `للأسف "${this.titleAr}" نفد من المخزون`;
    }
    return this.message;
  }
}

export interface CheckoutItem {
  productId: string;
  qty: number;
}

export interface ShippingInfo {
  name: string;
  phone: string;
  governorate: string;
  city: string;
  line: string;
}

type Tx = Prisma.TransactionClient;

/**
 * إنشاء طلب مع حجز ذرّي للستوك — قلب عدالة التوزيع.
 *
 * الخصم بيتم بشرط `stock >= qty` داخل transaction واحدة، فلو اتنين طلبوا
 * آخر قطعة في نفس اللحظة: الأول ياخدها والتاني يترفض طلبه بالكامل (rollback).
 * - COD ⇒ الطلب CONFIRMED فوراً.
 * - دفع أونلاين ⇒ PENDING_PAYMENT بمهلة RESERVATION_MINUTES، بعدها الستوك يتحرر.
 */
export async function createOrderWithReservation(opts: {
  userId: string;
  items: CheckoutItem[];
  shipping: ShippingInfo;
  paymentMethod: PaymentMethodType;
}) {
  // فرصة لتحرير حجوزات قديمة قبل ما نحاول نحجز
  await releaseExpiredReservations();

  const { userId, items, shipping, paymentMethod } = opts;
  if (items.length === 0) throw new Error("السلة فارغة");

  return prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems: {
      productId: string;
      titleEn: string;
      titleAr: string;
      price: number;
      qty: number;
    }[] = [];

    for (const item of items) {
      const product = byId.get(item.productId);
      if (!product) throw new Error("منتج غير موجود في السلة");
      const qty = Math.max(1, Math.min(MAX_QTY_PER_ITEM, Math.floor(item.qty)));

      // الخصم الذرّي المشروط — هنا بتتحسم عدالة آخر قطعة
      const res = await tx.product.updateMany({
        where: { id: product.id, stock: { gte: qty } },
        data: { stock: { decrement: qty } },
      });
      if (res.count === 0) {
        const current = await tx.product.findUnique({
          where: { id: product.id },
          select: { stock: true },
        });
        throw new OutOfStockError(product.titleEn, product.titleAr, current?.stock ?? 0);
      }

      subtotal += product.price * qty;
      orderItems.push({
        productId: product.id,
        titleEn: product.titleEn,
        titleAr: product.titleAr,
        price: product.price,
        qty,
      });
    }

    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const isCOD = paymentMethod === PaymentMethod.COD;

    return tx.order.create({
      data: {
        userId,
        status: isCOD ? OrderStatus.CONFIRMED : OrderStatus.PENDING_PAYMENT,
        paymentMethod,
        subtotal,
        shippingFee,
        total: subtotal + shippingFee,
        shippingName: shipping.name,
        shippingPhone: shipping.phone,
        shippingGovernorate: shipping.governorate,
        shippingCity: shipping.city,
        shippingLine: shipping.line,
        reservedUntil: isCOD ? null : new Date(Date.now() + RESERVATION_MINUTES * 60_000),
        items: { create: orderItems },
      },
      include: { items: true },
    });
  });
}

async function restockOrderItems(tx: Tx, orderId: string) {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.qty } },
    });
  }
}

/**
 * إلغاء طلب وإرجاع منتجاته للستوك.
 * تحويل الحالة مشروط بالحالة الحالية (updateMany) ⇒ مستحيل restock مرتين
 * حتى لو اتبعت طلبين إلغاء متوازيين.
 */
export async function cancelOrder(orderId: string, userId: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const res = await tx.order.updateMany({
      where: { id: orderId, userId, status: { in: CANCELLABLE_STATUSES } },
      data: { status: OrderStatus.CANCELLED },
    });
    if (res.count === 0) return false;
    await restockOrderItems(tx, orderId);
    return true;
  });
}

/**
 * تحرير الطلبات اللي عدّت مهلة دفعها: status ⇒ EXPIRED + إرجاع الستوك.
 * بتتنادى مع كل checkout، ومن /api/cron/release-stock (Cloudflare Cron).
 */
export async function releaseExpiredReservations(): Promise<number> {
  const expired = await prisma.order.findMany({
    where: { status: OrderStatus.PENDING_PAYMENT, reservedUntil: { lt: new Date() } },
    select: { id: true },
  });

  let released = 0;
  for (const { id } of expired) {
    await prisma.$transaction(async (tx) => {
      const res = await tx.order.updateMany({
        where: { id, status: OrderStatus.PENDING_PAYMENT },
        data: { status: OrderStatus.EXPIRED },
      });
      if (res.count === 1) {
        await restockOrderItems(tx, id);
        released++;
      }
    });
  }
  return released;
}

/**
 * تغيير حالة الطلب من لوحة الأدمن.
 * - الإلغاء بيرجّع الستوك (بنفس حماية الإلغاء المزدوج).
 * - ممنوع الرجوع من CANCELLED/EXPIRED لأي حالة تانية (كان هيحتاج خصم ستوك تاني).
 */
export async function adminUpdateOrderStatus(
  orderId: string,
  status: OrderStatusType,
): Promise<boolean> {
  if (status === OrderStatus.CANCELLED) {
    return prisma.$transaction(async (tx) => {
      const res = await tx.order.updateMany({
        where: { id: orderId, status: { in: CANCELLABLE_STATUSES } },
        data: { status: OrderStatus.CANCELLED },
      });
      if (res.count === 0) return false;
      await restockOrderItems(tx, orderId);
      return true;
    });
  }

  const res = await prisma.order.updateMany({
    where: {
      id: orderId,
      status: { notIn: [OrderStatus.CANCELLED, OrderStatus.EXPIRED] },
    },
    data: { status, ...(status !== OrderStatus.PENDING_PAYMENT ? { reservedUntil: null } : {}) },
  });
  return res.count === 1;
}

/** تأكيد الدفع (يستخدم من webhook بوابة الدفع لاحقاً) */
export async function markOrderPaid(orderId: string): Promise<boolean> {
  const res = await prisma.order.updateMany({
    where: { id: orderId, status: OrderStatus.PENDING_PAYMENT },
    data: { status: OrderStatus.PAID, reservedUntil: null },
  });
  return res.count === 1;
}
