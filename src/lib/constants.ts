export const OrderStatus = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  CONFIRMED: "CONFIRMED",
  PAID: "PAID",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
} as const;

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

/** الحالات اللي مسموح فيها بالإلغاء (PAID هيحتاج refund يدوي — موثّق) */
export const CANCELLABLE_STATUSES: OrderStatusType[] = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.CONFIRMED,
  OrderStatus.PAID,
];

export const PaymentMethod = {
  COD: "COD",
  CARD: "CARD",
} as const;

export type PaymentMethodType = (typeof PaymentMethod)[keyof typeof PaymentMethod];

// التسميات المعروضة للحالات وطرق الدفع موجودة في messages/{en,ar}/common.json
// تحت orderStatus.* و payment.* — استخدم useTranslations/getTranslations

/** مهلة حجز الستوك للطلبات الأونلاين بالدقائق */
export const RESERVATION_MINUTES = 30;

/** أقصى كمية للمنتج الواحد في الطلب */
export const MAX_QTY_PER_ITEM = 10;

export const SHIPPING_FEE = 50; // جنيه
export const FREE_SHIPPING_THRESHOLD = 1000; // شحن مجاني فوق كده

/** المحافظات — القيمة المخزنة هي value (إنجليزي canonical)، والعرض حسب اللغة */
export const GOVERNORATES: { value: string; en: string; ar: string }[] = [
  { value: "Cairo", en: "Cairo", ar: "القاهرة" },
  { value: "Giza", en: "Giza", ar: "الجيزة" },
  { value: "Alexandria", en: "Alexandria", ar: "الإسكندرية" },
  { value: "Qalyubia", en: "Qalyubia", ar: "القليوبية" },
  { value: "Sharqia", en: "Sharqia", ar: "الشرقية" },
  { value: "Dakahlia", en: "Dakahlia", ar: "الدقهلية" },
  { value: "Beheira", en: "Beheira", ar: "البحيرة" },
  { value: "Monufia", en: "Monufia", ar: "المنوفية" },
  { value: "Gharbia", en: "Gharbia", ar: "الغربية" },
  { value: "Kafr El Sheikh", en: "Kafr El Sheikh", ar: "كفر الشيخ" },
  { value: "Damietta", en: "Damietta", ar: "دمياط" },
  { value: "Port Said", en: "Port Said", ar: "بورسعيد" },
  { value: "Ismailia", en: "Ismailia", ar: "الإسماعيلية" },
  { value: "Suez", en: "Suez", ar: "السويس" },
  { value: "North Sinai", en: "North Sinai", ar: "شمال سيناء" },
  { value: "South Sinai", en: "South Sinai", ar: "جنوب سيناء" },
  { value: "Fayoum", en: "Fayoum", ar: "الفيوم" },
  { value: "Beni Suef", en: "Beni Suef", ar: "بني سويف" },
  { value: "Minya", en: "Minya", ar: "المنيا" },
  { value: "Assiut", en: "Assiut", ar: "أسيوط" },
  { value: "Sohag", en: "Sohag", ar: "سوهاج" },
  { value: "Qena", en: "Qena", ar: "قنا" },
  { value: "Luxor", en: "Luxor", ar: "الأقصر" },
  { value: "Aswan", en: "Aswan", ar: "أسوان" },
  { value: "Red Sea", en: "Red Sea", ar: "البحر الأحمر" },
  { value: "New Valley", en: "New Valley", ar: "الوادي الجديد" },
  { value: "Matrouh", en: "Matrouh", ar: "مطروح" },
];
