import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { discountPercent } from "@/lib/money";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryCardGrid from "@/components/home/CategoryCardGrid";
import ProductRow from "@/components/home/ProductRow";

// ISR — الصفحة بتتكاش وبتتجدد كل دقيقة (جاهزة للترافيك العالي خلف Cloudflare)
export const revalidate = 60;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const [categories, featured, dealsRaw, newArrivals] = await Promise.all([
    prisma.category.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.product.findMany({ where: { featured: true }, take: 8 }),
    prisma.product.findMany({ where: { listPrice: { not: null } }, take: 12 }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  // أعلى خصومات — الترتيب بنسبة الخصم بيتم هنا لأن SQLite معندوش computed order
  const deals = dealsRaw
    .map((p) => ({ p, d: discountPercent(p.price, p.listPrice) ?? 0 }))
    .sort((a, b) => b.d - a.d)
    .slice(0, 8)
    .map(({ p }) => p);

  return (
    <div className="pb-10">
      <HeroBanner />
      <div className="mx-auto max-w-screen-2xl space-y-6 px-4">
        <CategoryCardGrid categories={categories} />
        <ProductRow title={t("bestSellers")} products={featured} />
        <ProductRow title={t("todaysDeals")} products={deals} />
        <ProductRow title={t("newArrivals")} products={newArrivals} />
      </div>
    </div>
  );
}
