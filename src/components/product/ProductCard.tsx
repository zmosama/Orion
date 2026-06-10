import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Product } from "@prisma/client";
import { Link } from "@/i18n/navigation";
import { productImages, productTitle } from "@/lib/catalog";
import { discountPercent, formatEGP } from "@/lib/money";
import AddToCartButton from "./AddToCartButton";
import RatingStars from "./RatingStars";

/** كارت المنتج الموحد — يستخدم في الشبكات والصفوف في كل الموقع */
export default function ProductCard({ product }: { product: Product }) {
  const locale = useLocale();
  const t = useTranslations("common");

  const title = productTitle(product, locale);
  const image = productImages(product)[0];
  const discount = discountPercent(product.price, product.listPrice);

  return (
    <div className="flex w-full flex-col rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="relative block h-44 w-full">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, 240px"
          className="object-contain"
        />
      </Link>

      <Link
        href={`/products/${product.slug}`}
        className="mt-3 line-clamp-2 min-h-10 text-sm font-medium text-gray-900 hover:text-orion-link"
      >
        {title}
      </Link>

      <div className="mt-1 flex items-center gap-1">
        <RatingStars rating={product.rating} />
        <span className="text-xs text-orion-link">
          {product.reviewCount.toLocaleString(locale === "ar" ? "ar-EG" : "en-US")}
        </span>
      </div>

      <div className="mt-1 flex flex-wrap items-baseline gap-2">
        <span className="text-xl font-bold text-gray-900">{formatEGP(product.price, locale)}</span>
        {product.listPrice && discount ? (
          <>
            <span className="text-xs text-gray-500 line-through">
              {formatEGP(product.listPrice, locale)}
            </span>
            <span className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">
              -{discount}%
            </span>
          </>
        ) : null}
      </div>

      {product.stock === 0 ? (
        <p className="mt-1 text-xs font-semibold text-red-700">{t("outOfStock")}</p>
      ) : product.stock <= 5 ? (
        <p className="mt-1 text-xs font-semibold text-red-700">
          {t("onlyLeft", { count: product.stock })}
        </p>
      ) : null}

      <div className="mt-auto pt-3">
        {product.hasVariants ? (
          // منتج بمقاسات/ألوان — الاختيار من صفحة المنتج
          <Link
            href={`/products/${product.slug}`}
            className="flex w-full items-center justify-center rounded-full border border-orion-accent px-3 py-1.5 text-sm font-semibold text-orion-accent-dark transition-colors hover:bg-amber-50"
          >
            {t("seeOptions")}
          </Link>
        ) : (
          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              titleEn: product.titleEn,
              titleAr: product.titleAr,
              price: product.price,
              image,
              stock: product.stock,
            }}
          />
        )}
      </div>
    </div>
  );
}
