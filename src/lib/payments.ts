import { PaymentMethod } from "./constants";
import type { Order } from "@prisma/client";

/**
 * طبقة تجريد بوابات الدفع.
 * - COD: شغّال فوراً (الطلب بيتأكد من غير دفع أونلاين).
 * - CARD: Paymob (Accept) — بيتفعّل بمفاتيح .env (شوف README).
 * بدائل مصرية موثّقة في README: Fawry / Kashier / PayTabs.
 */

export interface PaymentInit {
  ok: boolean;
  /** يتوجه له العميل لإتمام الدفع أو لصفحة الطلب */
  redirectUrl?: string;
  error?: string;
}

export async function initiatePayment(order: Order): Promise<PaymentInit> {
  switch (order.paymentMethod) {
    case PaymentMethod.COD:
      return { ok: true, redirectUrl: `/orders/${order.id}?placed=1` };
    case PaymentMethod.CARD:
      return initiatePaymob(order);
    default:
      return { ok: false, error: "طريقة دفع غير معروفة" };
  }
}

const PAYMOB_API = "https://accept.paymob.com/api";

async function initiatePaymob(order: Order): Promise<PaymentInit> {
  const apiKey = process.env.PAYMOB_API_KEY;
  const integrationId = process.env.PAYMOB_INTEGRATION_ID;
  const iframeId = process.env.PAYMOB_IFRAME_ID;

  if (!apiKey || !integrationId || !iframeId) {
    return {
      ok: false,
      error:
        "الدفع بالبطاقة غير مفعّل بعد. أضف مفاتيح Paymob في ملف .env — التعليمات في README، أو اختر الدفع عند الاستلام.",
    };
  }

  try {
    // 1) Auth token
    const authRes = await fetch(`${PAYMOB_API}/auth/tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey }),
    });
    const { token } = (await authRes.json()) as { token: string };

    // 2) تسجيل الطلب (المبلغ بالقروش)
    const orderRes = await fetch(`${PAYMOB_API}/ecommerce/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: order.total * 100,
        currency: "EGP",
        merchant_order_id: order.id,
        items: [],
      }),
    });
    const pmOrder = (await orderRes.json()) as { id: number };

    // 3) Payment key
    const [firstName, ...rest] = order.shippingName.split(" ");
    const keyRes = await fetch(`${PAYMOB_API}/acceptance/payment_keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: order.total * 100,
        currency: "EGP",
        order_id: pmOrder.id,
        integration_id: Number(integrationId),
        expiration: 1800,
        billing_data: {
          first_name: firstName || "عميل",
          last_name: rest.join(" ") || "أوريون",
          phone_number: order.shippingPhone,
          email: "customer@orion.eg",
          street: order.shippingLine,
          city: order.shippingCity,
          state: order.shippingGovernorate,
          country: "EG",
          apartment: "NA",
          floor: "NA",
          building: "NA",
          postal_code: "NA",
          shipping_method: "NA",
        },
      }),
    });
    const payKey = (await keyRes.json()) as { token: string };

    return {
      ok: true,
      redirectUrl: `${PAYMOB_API}/acceptance/iframes/${iframeId}?payment_token=${payKey.token}`,
    };
  } catch {
    return { ok: false, error: "تعذر الاتصال ببوابة الدفع — حاول تاني أو اختر الدفع عند الاستلام" };
  }
}
