import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!(await getAdminSession())) return null;
  const t = await getTranslations("admin.products");

  const categories = await prisma.category.findMany({
    select: { id: true, nameEn: true, nameAr: true },
    orderBy: { nameEn: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{t("newTitle")}</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
