import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";
import {
  productImages,
  productOptionTypes,
  productSpecs,
  variantLabel,
  variantOptions,
} from "@/lib/catalog";
import { categoryTreeOptions } from "@/lib/admin-products";
import ProductForm from "@/components/admin/ProductForm";

function specsToLines(specs: Record<string, string>): string {
  return Object.entries(specs)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  if (!(await getAdminSession())) return null;
  const t = await getTranslations("admin.products");

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { variants: true } }),
    prisma.category.findMany({
      select: { id: true, nameEn: true, nameAr: true, parentId: true },
      orderBy: { nameEn: "asc" },
    }),
  ]);
  if (!product) notFound();

  // محاذاة أنواع الخيارات EN/AR بالترتيب لمحرر الفاريانتس
  const typesEn = productOptionTypes(product, "en");
  const typesAr = productOptionTypes(product, "ar");
  const optionTypes = typesEn.map((o, i) => ({
    nameEn: o.name,
    nameAr: typesAr[i]?.name ?? "",
    values: o.values.map((v, j) => ({ en: v, ar: typesAr[i]?.values[j] ?? "" })),
  }));

  const variantRows = product.variants.map((v) => ({
    id: v.id,
    comboEn: variantOptions(v, "en"),
    comboAr: variantOptions(v, "ar"),
    labelEn: variantLabel(v, "en"),
    price: v.price !== null ? String(v.price) : "",
    stock: String(v.stock),
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{t("editTitle")}</h1>
      <ProductForm
        categories={categoryTreeOptions(categories)}
        initial={{
          id: product.id,
          slug: product.slug,
          titleEn: product.titleEn,
          titleAr: product.titleAr,
          brand: product.brand ?? "",
          descriptionEn: product.descriptionEn,
          descriptionAr: product.descriptionAr,
          price: String(product.price),
          listPrice: product.listPrice ? String(product.listPrice) : "",
          stock: String(product.stock),
          categoryId: product.categoryId,
          imagesText: productImages(product).join("\n"),
          specsEnText: specsToLines(productSpecs(product, "en")),
          specsArText: specsToLines(productSpecs(product, "ar")),
          featured: product.featured,
          optionTypes,
          variantRows,
        }}
      />
    </div>
  );
}
