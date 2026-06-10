import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import {
  applyFilters,
  buildFacets,
  parseFilters,
  SORT_ORDERS,
  sortKeyOf,
  type SearchParamsRecord,
} from "@/lib/filters";
import ProductCard from "@/components/product/ProductCard";
import SortSelect from "@/components/home/SortSelect";
import FilterSidebar from "@/components/browse/FilterSidebar";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParamsRecord>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: typeof q === "string" && q ? `"${q}"` : "Search" };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("search");
  const query = (typeof sp.q === "string" ? sp.q : "").trim();

  const sortKey = sortKeyOf(typeof sp.sort === "string" ? sp.sort : undefined);

  // ملحوظة: SQLite مفيهوش mode insensitive في Prisma — مقبول للتطوير،
  // الإنتاج على PostgreSQL يضيف mode: "insensitive"
  const allProducts = query
    ? await prisma.product.findMany({
        where: {
          OR: [
            { titleEn: { contains: query } },
            { titleAr: { contains: query } },
            { descriptionEn: { contains: query } },
            { brand: { contains: query } },
          ],
        },
        orderBy: SORT_ORDERS[sortKey],
        include: { variants: { select: { optionsEn: true, stock: true } } },
        take: 60,
      })
    : [];

  const filters = parseFilters(sp);
  const facets = buildFacets(allProducts, locale);
  const products = applyFilters(allProducts, filters);

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-6">
      {query === "" ? (
        <p className="rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-600">
          {t("prompt")}
        </p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-bold text-gray-900">
              {t("results", { count: products.length, query })}
            </h1>
            <SortSelect current={sortKey} />
          </div>

          <div className="grid items-start gap-4 lg:grid-cols-[250px_1fr]">
            <FilterSidebar facets={facets} applied={filters} />

            {products.length === 0 ? (
              <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-12 text-center">
                <SearchX className="h-10 w-10 text-gray-400" />
                <p className="mt-3 font-semibold text-gray-900">{t("empty", { query })}</p>
                <p className="mt-1 text-sm text-gray-600">{t("emptyHint")}</p>
                <Link href="/" className="mt-4 text-sm text-orion-link hover:underline">
                  {t("browseHome")}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
