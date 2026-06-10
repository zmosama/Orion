import { z } from "zod";
import type { Prisma } from "@prisma/client";

/** Validation وtransform مشتركين بين POST و PATCH بتوع منتجات الأدمن */

const optionTypeSchema = z.object({
  name: z.string().min(1).max(50),
  values: z.array(z.string().min(1).max(50)).min(1).max(20),
});

const variantSchema = z.object({
  id: z.string().optional(),
  optionsEn: z.record(z.string(), z.string()),
  optionsAr: z.record(z.string(), z.string()),
  price: z.number().int().min(1).max(10_000_000).nullable().optional(),
  stock: z.number().int().min(0).max(1_000_000),
});

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
  // الفاريانتس (مقاسات/ألوان/أوزان)
  optionsEn: z.array(optionTypeSchema).max(3).optional(),
  optionsAr: z.array(optionTypeSchema).max(3).optional(),
  variants: z.array(variantSchema).max(100).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

export function toProductData(data: ProductInput) {
  const variants = data.variants ?? [];
  const hasVariants = variants.length > 0;
  return {
    slug: data.slug,
    titleEn: data.titleEn,
    titleAr: data.titleAr,
    brand: data.brand || null,
    descriptionEn: data.descriptionEn,
    descriptionAr: data.descriptionAr,
    price: data.price,
    listPrice: data.listPrice ?? null,
    // مع الفاريانتس: ستوك المنتج = مجموع ستوك التركيبات (للعرض في الكروت)
    stock: hasVariants ? variants.reduce((sum, v) => sum + v.stock, 0) : data.stock,
    categoryId: data.categoryId,
    images: JSON.stringify(data.images),
    specsEn:
      data.specsEn && Object.keys(data.specsEn).length > 0 ? JSON.stringify(data.specsEn) : null,
    specsAr:
      data.specsAr && Object.keys(data.specsAr).length > 0 ? JSON.stringify(data.specsAr) : null,
    featured: data.featured ?? false,
    hasVariants,
    optionsEn: hasVariants && data.optionsEn?.length ? JSON.stringify(data.optionsEn) : null,
    optionsAr: hasVariants && data.optionsAr?.length ? JSON.stringify(data.optionsAr) : null,
  };
}

/** ترتيب الفئات كشجرة (DFS) مع العمق — لقوائم الاختيار في الأدمن */
export function categoryTreeOptions(
  cats: { id: string; nameEn: string; nameAr: string; parentId: string | null }[],
): { id: string; nameEn: string; nameAr: string; depth: number }[] {
  const out: { id: string; nameEn: string; nameAr: string; depth: number }[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const c of cats.filter((c) => c.parentId === parentId)) {
      out.push({ id: c.id, nameEn: c.nameEn, nameAr: c.nameAr, depth });
      walk(c.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

/** مزامنة الفاريانتس: حذف اللي اتشال، تحديث الموجود، إنشاء الجديد */
export async function syncVariants(
  tx: Prisma.TransactionClient,
  productId: string,
  variants: ProductInput["variants"],
) {
  const incoming = variants ?? [];
  const existing = await tx.productVariant.findMany({
    where: { productId },
    select: { id: true },
  });
  const keepIds = incoming.filter((v) => v.id).map((v) => v.id!);
  const toDelete = existing.filter((e) => !keepIds.includes(e.id)).map((e) => e.id);
  if (toDelete.length > 0) {
    // OrderItem.variantId بـ SetNull — الحذف ميكسرش تاريخ الطلبات
    await tx.productVariant.deleteMany({ where: { id: { in: toDelete }, productId } });
  }

  for (const v of incoming) {
    const data = {
      optionsEn: JSON.stringify(v.optionsEn),
      optionsAr: JSON.stringify(v.optionsAr),
      price: v.price ?? null,
      stock: v.stock,
    };
    if (v.id) {
      await tx.productVariant.updateMany({ where: { id: v.id, productId }, data });
    } else {
      await tx.productVariant.create({ data: { ...data, productId } });
    }
  }
}
