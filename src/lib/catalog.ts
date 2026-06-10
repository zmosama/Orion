import type { Category, Product } from "@prisma/client";

/**
 * Helpers لعرض محتوى الكتالوج bilingual — استخدمها دايماً بدل الوصول المباشر
 * للأعمدة أو JSON.parse يدوي.
 */

export type AppLocale = "en" | "ar";

export function productTitle(p: Pick<Product, "titleEn" | "titleAr">, locale: string): string {
  return locale === "ar" ? p.titleAr : p.titleEn;
}

export function productDescription(
  p: Pick<Product, "descriptionEn" | "descriptionAr">,
  locale: string,
): string {
  return locale === "ar" ? p.descriptionAr : p.descriptionEn;
}

export function categoryName(c: Pick<Category, "nameEn" | "nameAr">, locale: string): string {
  return locale === "ar" ? c.nameAr : c.nameEn;
}

/** مواصفات المنتج كـ key/value حسب اللغة — لجدول المقارنة وقسم المواصفات */
export function productSpecs(
  p: Pick<Product, "specsEn" | "specsAr">,
  locale: string,
): Record<string, string> {
  const raw = locale === "ar" ? p.specsAr : p.specsEn;
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

/** روابط صور المنتج */
export function productImages(p: Pick<Product, "images">): string[] {
  try {
    const parsed = JSON.parse(p.images) as string[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ["/placeholder.svg"];
  } catch {
    return ["/placeholder.svg"];
  }
}
