import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import {
  categoryName,
  productDescription,
  productImages,
  productOptionTypes,
  productSpecs,
  productTitle,
  variantLabel,
  variantOptions,
} from "@/lib/catalog";
import { discountPercent, formatEGP } from "@/lib/money";
import { Link } from "@/i18n/navigation";
import RatingStars from "@/components/product/RatingStars";
import ProductRow from "@/components/home/ProductRow";
import Gallery from "@/components/pdp/Gallery";
import BuyBox from "@/components/pdp/BuyBox";
import CompareTable from "@/components/pdp/CompareTable";

// ISR — الستوك المعروض ممكن يتأخر دقيقتين، التحقق الحقيقي بيحصل في الـ checkout
export const revalidate = 120;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};
  return {
    title: productTitle(product, locale),
    description: productDescription(product, locale).slice(0, 160),
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pdp");

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, variants: true },
  });
  if (!product) notFound();

  // تجهيز خيارات الفاريانتس (مقاسات/ألوان…) — محاذاة EN/AR بالترتيب
  const optionTypesEn = productOptionTypes(product, "en");
  const optionTypesLoc = productOptionTypes(product, locale);
  const buyBoxOptions = optionTypesEn.map((o, i) => ({
    nameEn: o.name,
    nameLocalized: optionTypesLoc[i]?.name ?? o.name,
    values: o.values.map((v, j) => ({ en: v, localized: optionTypesLoc[i]?.values[j] ?? v })),
  }));
  const buyBoxVariants = product.variants.map((v) => ({
    id: v.id,
    optionsEn: variantOptions(v, "en"),
    labelEn: variantLabel(v, "en"),
    labelAr: variantLabel(v, "ar"),
    price: v.price,
    stock: v.stock,
    image: v.image,
  }));

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 8,
  });

  const title = productTitle(product, locale);
  const description = productDescription(product, locale);
  const specs = productSpecs(product, locale);
  const images = productImages(product);
  const discount = discountPercent(product.price, product.listPrice);

  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-600">
        <Link href="/" className="hover:text-orion-link hover:underline">
          {t("breadcrumbHome")}
        </Link>
        <span className="mx-1">/</span>
        <Link
          href={`/category/${product.category.slug}`}
          className="hover:text-orion-link hover:underline"
        >
          {categoryName(product.category, locale)}
        </Link>
        <span className="mx-1">/</span>
        <span className="text-gray-900">{title}</span>
      </nav>

      {/* القسم الرئيسي — جاليري / معلومات / صندوق شراء */}
      <div className="grid gap-6 rounded-lg border border-gray-200 bg-white p-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Gallery images={images} title={title} />
        </div>

        <div className="lg:col-span-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {product.brand ? (
            <p className="mt-1 text-sm text-orion-link">{t("brand", { brand: product.brand })}</p>
          ) : null}
          <div className="mt-2 flex items-center gap-2">
            <RatingStars rating={product.rating} />
            <span className="text-sm font-medium text-gray-700">{product.rating}</span>
            <span className="text-sm text-orion-link">
              {t("ratings", { count: product.reviewCount })}
            </span>
          </div>

          <hr className="my-3 border-gray-200" />

          <div className="flex flex-wrap items-baseline gap-2">
            {discount ? <span className="text-2xl font-light text-red-700">-{discount}%</span> : null}
            <span className="text-3xl font-bold text-gray-900">
              {formatEGP(product.price, locale)}
            </span>
          </div>
          {product.listPrice && discount ? (
            <p className="mt-1 text-xs text-gray-500">
              {t("listPrice")}:{" "}
              <span className="line-through">{formatEGP(product.listPrice, locale)}</span>
            </p>
          ) : null}

          <hr className="my-3 border-gray-200" />

          <h2 className="font-bold text-gray-900">{t("aboutItem")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-700">{description}</p>

          {Object.keys(specs).length > 0 ? (
            <table className="mt-4 w-full text-sm">
              <tbody>
                {Object.entries(specs).map(([key, value]) => (
                  <tr key={key} className="odd:bg-gray-50">
                    <th className="w-1/3 p-2 text-start font-semibold text-gray-700">{key}</th>
                    <td className="p-2 text-gray-900">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>

        <div className="lg:col-span-3">
          <BuyBox
            product={{
              id: product.id,
              slug: product.slug,
              titleEn: product.titleEn,
              titleAr: product.titleAr,
              price: product.price,
              image: images[0],
              stock: product.stock,
              hasVariants: product.hasVariants,
            }}
            options={product.hasVariants ? buyBoxOptions : []}
            variants={product.hasVariants ? buyBoxVariants : []}
          />
        </div>
      </div>

      {related.length > 0 ? (
        <>
          <ProductRow
            title={t("related")}
            products={related}
            viewAllHref={`/category/${product.category.slug}`}
          />
          <CompareTable products={[product, ...related.slice(0, 3)]} currentId={product.id} />
        </>
      ) : null}
    </div>
  );
}
