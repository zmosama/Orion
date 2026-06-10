import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { cancelOrder, createOrderWithReservation, OutOfStockError } from "@/lib/stock";
import { initiatePayment } from "@/lib/payments";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { GOVERNORATES, MAX_QTY_PER_ITEM, PaymentMethod } from "@/lib/constants";

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.number().int().min(1).max(MAX_QTY_PER_ITEM),
      }),
    )
    .min(1)
    .max(50),
  shipping: z.object({
    name: z.string().min(2).max(100),
    phone: z.string().min(6).max(20),
    governorate: z.string().refine((v) => GOVERNORATES.some((g) => g.value === v)),
    city: z.string().min(2).max(100),
    line: z.string().min(5).max(300),
  }),
  paymentMethod: z.enum([PaymentMethod.COD, PaymentMethod.CARD]),
  locale: z.string().optional().default("en"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const userId = session.user.id;

  if (!rateLimit(`checkout:${clientIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }
  const { items, shipping, paymentMethod, locale } = parsed.data;

  try {
    // الحجز الذرّي — هنا بيتضمن إن آخر قطعة تروح لطلب واحد بس
    const order = await createOrderWithReservation({ userId, items, shipping, paymentMethod });

    const pay = await initiatePayment(order);
    if (!pay.ok) {
      // فشل تهيئة الدفع ⇒ إلغاء فوري وإرجاع الستوك المحجوز
      await cancelOrder(order.id, userId);
      return NextResponse.json({ error: pay.error ?? "PAYMENT_INIT_FAILED" }, { status: 400 });
    }

    return NextResponse.json({ orderId: order.id, redirectUrl: pay.redirectUrl });
  } catch (e) {
    if (e instanceof OutOfStockError) {
      return NextResponse.json(
        { error: e.localizedMessage(locale), code: "OUT_OF_STOCK" },
        { status: 409 },
      );
    }
    console.error("checkout error:", e);
    return NextResponse.json({ error: "INTERNAL" }, { status: 500 });
  }
}
