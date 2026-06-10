import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!(await getAdminSession())) return null;
  const t = await getTranslations("admin.categories");

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { nameEn: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
      <CategoryManager
        categories={categories.map((c) => ({
          id: c.id,
          slug: c.slug,
          nameEn: c.nameEn,
          nameAr: c.nameAr,
          image: c.image,
          parentId: c.parentId,
          productCount: c._count.products,
        }))}
      />
    </div>
  );
}
