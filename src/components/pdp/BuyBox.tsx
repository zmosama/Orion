"use client";

import { useState } from "react";
import { Banknote, ShieldCheck, Truck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCart } from "@/components/cart/CartProvider";
import AddToCartButton from "@/components/product/AddToCartButton";
import { formatEGP } from "@/lib/money";
import { FREE_SHIPPING_THRESHOLD, MAX_QTY_PER_ITEM } from "@/lib/constants";

export interface BuyBoxProduct {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  price: number;
  image: string;
  stock: number;
}

/** صندوق الشراء — السعر والتوفر والكمية وأزرار الشراء (يمين الصفحة زي أمازون) */
export default function BuyBox({ product }: { product: BuyBoxProduct }) {
  const locale = useLocale();
  const t = useTranslations("pdp");
  const tc = useTranslations("common");
  const router = useRouter();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  const max = Math.min(MAX_QTY_PER_ITEM, product.stock);

  function buyNow() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        titleEn: product.titleEn,
        titleAr: product.titleAr,
        price: product.price,
        image: product.image,
        stock: product.stock,
      },
      qty,
    );
    router.push("/checkout");
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-2xl font-bold text-gray-900">{formatEGP(product.price, locale)}</p>

      <p className="mt-1 text-xs text-gray-600">
        {t("freeShippingNote", { amount: formatEGP(FREE_SHIPPING_THRESHOLD, locale) })}
      </p>

      <p
        className={`mt-3 text-sm font-semibold ${
          product.stock === 0
            ? "text-gray-500"
            : product.stock <= 5
              ? "text-red-700"
              : "text-green-700"
        }`}
      >
        {product.stock === 0
          ? tc("outOfStock")
          : product.stock <= 5
            ? tc("onlyLeft", { count: product.stock })
            : tc("inStock")}
      </p>

      {product.stock > 0 ? (
        <>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-gray-700">{t("qty")}</span>
            <select
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm outline-none focus:border-orion-accent"
            >
              {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-4 space-y-2">
            <AddToCartButton product={product} qty={qty} size="lg" />
            <button
              type="button"
              onClick={buyNow}
              className="flex w-full items-center justify-center rounded-full bg-orion-accent-dark px-6 py-2.5 font-semibold text-white transition-colors hover:bg-amber-700"
            >
              {tc("buyNow")}
            </button>
          </div>
        </>
      ) : null}

      <ul className="mt-4 space-y-2 border-t border-gray-100 pt-3 text-xs text-gray-600">
        <li className="flex items-center gap-2">
          <Truck className="h-4 w-4 shrink-0 text-orion-link" />
          {t("trustShipping")}
        </li>
        <li className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-orion-link" />
          {t("trustSecure")}
        </li>
        <li className="flex items-center gap-2">
          <Banknote className="h-4 w-4 shrink-0 text-orion-link" />
          {t("trustCOD")}
        </li>
      </ul>
    </div>
  );
}
