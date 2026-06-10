"use client";

import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { formatEGP } from "@/lib/money";
import { FREE_SHIPPING_THRESHOLD, MAX_QTY_PER_ITEM, SHIPPING_FEE } from "@/lib/constants";

export default function CartView() {
  const { items, ready, count, subtotal, setQty, removeItem } = useCart();
  const locale = useLocale();
  const t = useTranslations("cartPage");
  const tc = useTranslations("common");

  if (!ready) {
    return <p className="p-16 text-center text-gray-500">{tc("loading")}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-16 text-center">
        <ShoppingCart className="h-12 w-12 text-gray-400" />
        <h1 className="mt-4 text-xl font-bold text-gray-900">{t("empty")}</h1>
        <p className="mt-1 text-sm text-gray-600">{t("emptyHint")}</p>
        <Link
          href="/"
          className="mt-5 rounded-full bg-orion-accent px-6 py-2 text-sm font-bold text-orion-dark transition-colors hover:bg-orion-accent-dark"
        >
          {t("browse")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_300px]">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h1 className="border-b border-gray-200 pb-3 text-2xl font-bold text-gray-900">
          {t("title")}
        </h1>
        <ul className="divide-y divide-gray-200">
          {items.map((item) => {
            const title = locale === "ar" ? item.titleAr : item.titleEn;
            const max = Math.min(MAX_QTY_PER_ITEM, Math.max(item.stock, 1));
            return (
              <li key={item.productId} className="flex gap-4 py-4">
                <Link href={`/products/${item.slug}`} className="relative h-24 w-24 shrink-0">
                  <Image src={item.image} alt={title} fill sizes="96px" className="object-contain" />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.slug}`}
                    className="line-clamp-2 font-medium text-gray-900 hover:text-orion-link"
                  >
                    {title}
                  </Link>
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {formatEGP(item.price, locale)}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <label className="flex items-center gap-1">
                      <span className="text-gray-600">{t("qty")}</span>
                      <select
                        value={item.qty}
                        onChange={(e) => setQty(item.productId, Number(e.target.value))}
                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm outline-none focus:border-orion-accent"
                      >
                        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-orion-link hover:underline"
                    >
                      {tc("delete")}
                    </button>
                  </div>
                </div>

                <p className="shrink-0 font-bold text-gray-900">
                  {formatEGP(item.price * item.qty, locale)}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="rounded-lg border border-gray-200 bg-white p-4 lg:sticky lg:top-32">
        {subtotal >= FREE_SHIPPING_THRESHOLD ? (
          <p className="text-sm font-medium text-green-700">{t("freeShippingUnlocked")}</p>
        ) : (
          <p className="text-sm text-gray-600">
            {t("addMoreForFree", {
              amount: formatEGP(FREE_SHIPPING_THRESHOLD - subtotal, locale),
              fee: formatEGP(SHIPPING_FEE, locale),
            })}
          </p>
        )}

        <p className="mt-3 text-lg text-gray-900">
          {t("subtotalLabel", { count })}{" "}
          <span className="font-bold">{formatEGP(subtotal, locale)}</span>
        </p>

        <Link
          href="/checkout"
          className="mt-4 block w-full rounded-full bg-orion-accent py-2 text-center text-sm font-bold text-orion-dark transition-colors hover:bg-orion-accent-dark"
        >
          {t("proceed")}
        </Link>
      </aside>
    </div>
  );
}
