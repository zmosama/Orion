import { z } from "zod";

/** Validation وtransform مشتركين بين POST و PATCH بتوع منتجات الأدمن */

export const productSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  titleEn: z.string().min(2).max(200),
  titleAr: z.string().min(2).max(200),
  brand: z.string().max(100).optional().or(z.literal("")),
  descriptionEn: z.string().min(2).max(5000),
  descriptionAr: z.string().min(2).max(5000),
  price: z.number().int().min(1).max(10_000_000),
  listPrice: z.number().int().min(1).max(10_000_000).nullable().optional(),
  stock: z.number().int().min(0).max(1_000_000),
  categoryId: z.string().min(1),
  images: z.array(z.url()).min(1).max(10),
  specsEn: z.record(z.string(), z.string()).optional(),
  specsAr: z.record(z.string(), z.string()).optional(),
  featured: z.boolean().optional(),
});

export function toProductData(data: z.infer<typeof productSchema>) {
  return {
    slug: data.slug,
    titleEn: data.titleEn,
    titleAr: data.titleAr,
    brand: data.brand || null,
    descriptionEn: data.descriptionEn,
    descriptionAr: data.descriptionAr,
    price: data.price,
    listPrice: data.listPrice ?? null,
    stock: data.stock,
    categoryId: data.categoryId,
    images: JSON.stringify(data.images),
    specsEn:
      data.specsEn && Object.keys(data.specsEn).length > 0 ? JSON.stringify(data.specsEn) : null,
    specsAr:
      data.specsAr && Object.keys(data.specsAr).length > 0 ? JSON.stringify(data.specsAr) : null,
    featured: data.featured ?? false,
  };
}
