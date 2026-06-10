import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { categoryName } from "@/lib/catalog";
import ProductCard from "@/components/product/ProductCard";
import SortSelect from "@/components/home/SortSelect";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ sort?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return {};
  return { title: categoryName(category, locale) };
}

const SORT_ORDERS: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
  rating: { rating: "desc" },
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const { sort } = await searchParams;
  const t = await getTranslations("category");

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const sortKey = sort && sort in SORT_ORDERS ? sort : "newest";
  const products = await prisma.product.findMany({
    where: { categoryId: category.id },
    orderBy: SORT_ORDERS[sortKey],
  });

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{categoryName(category, locale)}</h1>
          <p className="text-sm text-gray-600">{t("count", { count: products.length })}</p>
        </div>
        <SortSelect current={sortKey} />
      </div>

      {products.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-600">
          {t("empty")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
