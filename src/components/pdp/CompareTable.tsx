import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Product } from "@prisma/client";
import { Link } from "@/i18n/navigation";
import { productImages, productSpecs, productTitle } from "@/lib/catalog";
import { formatEGP } from "@/lib/money";
import RatingStars from "@/components/product/RatingStars";

/** جدول "قارن مع منتجات مشابهة" — المنتج الحالي + 3 من نفس الفئة */
export default function CompareTable({
  products,
  currentId,
}: {
  products: Product[];
  currentId: string;
}) {
  const locale = useLocale();
  const t = useTranslations("pdp");
  const tc = useTranslations("common");

  // اتحاد مفاتيح المواصفات — مفاتيح المنتج الحالي الأول
  const specKeys: string[] = [];
  for (const p of products) {
    for (const key of Object.keys(productSpecs(p, locale))) {
      if (!specKeys.includes(key)) specKeys.push(key);
    }
  }

  const highlight = (id: string) => (id === currentId ? "bg-amber-50" : "");

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">{t("compareTitle")}</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-160 border-collapse text-sm">
          <tbody>
            <tr>
              <th className="w-32 p-2" />
              {products.map((p) => (
                <td key={p.id} className={`p-3 align-bottom ${highlight(p.id)}`}>
                  {p.id === currentId ? (
                    <span className="mb-2 inline-block rounded bg-orion-accent px-1.5 py-0.5 text-xs font-bold text-orion-dark">
                      {t("thisItem")}
                    </span>
                  ) : null}
                  <Link href={`/products/${p.slug}`} className="block">
                    <span className="relative block h-28 w-28">
                      <Image
                        src={productImages(p)[0]}
                        alt={productTitle(p, locale)}
                        fill
                        sizes="112px"
                        className="object-contain"
                      />
                    </span>
                    <span className="mt-2 line-clamp-2 block font-medium text-orion-link hover:underline">
                      {productTitle(p, locale)}
                    </span>
                  </Link>
                </td>
              ))}
            </tr>

            <tr className="border-t border-gray-200">
              <th className="p-2 text-start font-semibold text-gray-700">{t("price")}</th>
              {products.map((p) => (
                <td key={p.id} className={`p-3 font-bold text-gray-900 ${highlight(p.id)}`}>
                  {formatEGP(p.price, locale)}
                </td>
              ))}
            </tr>

            <tr className="border-t border-gray-200">
              <th className="p-2 text-start font-semibold text-gray-700">{t("rating")}</th>
              {products.map((p) => (
                <td key={p.id} className={`p-3 ${highlight(p.id)}`}>
                  <RatingStars rating={p.rating} />
                  <span className="ms-1 text-xs text-gray-600">{p.rating}</span>
                </td>
              ))}
            </tr>

            <tr className="border-t border-gray-200">
              <th className="p-2 text-start font-semibold text-gray-700">{t("availability")}</th>
              {products.map((p) => (
                <td key={p.id} className={`p-3 text-xs font-semibold ${highlight(p.id)}`}>
                  <span className={p.stock === 0 ? "text-gray-500" : p.stock <= 5 ? "text-red-700" : "text-green-700"}>
                    {p.stock === 0
                      ? tc("outOfStock")
                      : p.stock <= 5
                        ? tc("onlyLeft", { count: p.stock })
                        : tc("inStock")}
                  </span>
                </td>
              ))}
            </tr>

            {specKeys.map((key) => (
              <tr key={key} className="border-t border-gray-200 odd:bg-gray-50/60">
                <th className="p-2 text-start font-semibold text-gray-700">{key}</th>
                {products.map((p) => (
                  <td key={p.id} className={`p-3 text-gray-900 ${highlight(p.id)}`}>
                    {productSpecs(p, locale)[key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
