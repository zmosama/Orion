/**
 * تنسيق المبالغ بالجنيه المصري حسب اللغة.
 * en ⇒ "EGP 1,250" — ar ⇒ "١٬٢٥٠ ج.م."
 */
export function formatEGP(amount: number, locale: string = "en"): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** نسبة الخصم من السعر القديم */
export function discountPercent(price: number, listPrice?: number | null): number | null {
  if (!listPrice || listPrice <= price) return null;
  return Math.round(((listPrice - price) / listPrice) * 100);
}
