import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product/ProductCard";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `"${q}"` : "Search" };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { q } = await searchParams;
  const t = await getTranslations("search");
  const query = q?.trim() ?? "";

  // ملحوظة: SQLite مفيهوش mode insensitive في Prisma — مقبول للتطوير،
  // الإنتاج على PostgreSQL يضيف mode: "insensitive"
  const products = query
    ? await prisma.product.findMany({
        where: {
          OR: [
            { titleEn: { contains: query } },
            { titleAr: { contains: query } },
            { descriptionEn: { contains: query } },
            { brand: { contains: query } },
          ],
        },
        take: 24,
      })
    : [];

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-6">
      {query === "" ? (
        <p className="rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-600">
          {t("prompt")}
        </p>
      ) : (
        <>
          <h1 className="mb-4 text-xl font-bold text-gray-900">
            {t("results", { count: products.length, query })}
          </h1>
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
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
