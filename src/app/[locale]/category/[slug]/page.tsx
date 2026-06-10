import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { categoryName } from "@/lib/catalog";
import { Link } from "@/i18n/navigation";
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

  const [category, allCategories] = await Promise.all([
    prisma.category.findUnique({ where: { slug } }),
    prisma.category.findMany({
      select: { id: true, slug: true, nameEn: true, nameAr: true, parentId: true },
    }),
  ]);
  if (!category) notFound();

  // الفئات الفرعية المباشرة + كل الأحفاد (منتجات الفئة بتشمل اللي تحتها في الشجرة)
  const children = allCategories.filter((c) => c.parentId === category.id);
  const descendantIds = [category.id];
  let frontier = [category.id];
  while (frontier.length > 0) {
    const next = allCategories
      .filter((c) => c.parentId && frontier.includes(c.parentId))
      .map((c) => c.id)
      .filter((id) => !descendantIds.includes(id));
    descendantIds.push(...next);
    frontier = next;
  }

  const sortKey = sort && sort in SORT_ORDERS ? sort : "newest";
  const products = await prisma.product.findMany({
    where: { categoryId: { in: descendantIds } },
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

      {children.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {children.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-800 transition-colors hover:border-orion-accent hover:text-orion-accent-dark"
            >
              {categoryName(c, locale)}
            </Link>
          ))}
        </div>
      ) : null}

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
