"use client";

import { useState } from "react";
import { Banknote, ShieldCheck, Truck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCart } from "@/components/cart/CartProvider";
import AddToCartButton, { type CartVariant } from "@/components/product/AddToCartButton";
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
  hasVariants: boolean;
}

export interface BuyBoxOption {
  nameEn: string;
  nameLocalized: string;
  values: { en: string; localized: string }[];
}

export interface BuyBoxVariant {
  id: string;
  optionsEn: Record<string, string>;
  labelEn: string;
  labelAr: string;
  price: number | null;
  stock: number;
  image?: string | null;
}

/** صندوق الشراء — السعر والتوفر والكمية وأزرار الشراء + اختيار المقاس/اللون */
export default function BuyBox({
  product,
  options = [],
  variants = [],
}: {
  product: BuyBoxProduct;
  options?: BuyBoxOption[];
  variants?: BuyBoxVariant[];
}) {
  const locale = useLocale();
  const t = useTranslations("pdp");
  const tc = useTranslations("common");
  const router = useRouter();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  // الاختيار المبدئي: أول تركيبة متاحة
  const initial = variants.find((v) => v.stock > 0) ?? variants[0];
  const [selected, setSelected] = useState<Record<string, string>>(initial?.optionsEn ?? {});

  const current = product.hasVariants
    ? (variants.find((v) => options.every((o) => v.optionsEn[o.nameEn] === selected[o.nameEn])) ??
      null)
    : null;

  const cartVariant: CartVariant | null = current
    ? {
        id: current.id,
        labelEn: current.labelEn,
        labelAr: current.labelAr,
        price: current.price,
        stock: current.stock,
        image: current.image,
      }
    : null;

  const stock = product.hasVariants ? (current?.stock ?? 0) : product.stock;
  const price = current?.price ?? product.price;
  const max = Math.min(MAX_QTY_PER_ITEM, Math.max(stock, 1));
  const comboMissing = product.hasVariants && !current;

  function buyNow() {
    addItem(
      {
        productId: product.id,
        variantId: cartVariant?.id,
        slug: product.slug,
        titleEn: product.titleEn,
        titleAr: product.titleAr,
        variantLabelEn: cartVariant?.labelEn,
        variantLabelAr: cartVariant?.labelAr,
        price,
        image: cartVariant?.image || product.image,
        stock,
      },
      qty,
    );
    router.push("/checkout");
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-2xl font-bold text-gray-900">{formatEGP(price, locale)}</p>

      <p className="mt-1 text-xs text-gray-600">
        {t("freeShippingNote", { amount: formatEGP(FREE_SHIPPING_THRESHOLD, locale) })}
      </p>

      {/* اختيار المقاس/اللون/الوزن */}
      {options.map((option) => (
        <div key={option.nameEn} className="mt-3">
          <p className="text-sm font-semibold text-gray-800">
            {option.nameLocalized}:{" "}
            <span className="font-normal text-gray-600">
              {option.values.find((v) => v.en === selected[option.nameEn])?.localized ?? "—"}
            </span>
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {option.values.map((value) => {
              const isSelected = selected[option.nameEn] === value.en;
              return (
                <button
                  key={value.en}
                  type="button"
                  onClick={() => setSelected((s) => ({ ...s, [option.nameEn]: value.en }))}
                  className={`rounded-md border px-2.5 py-1 text-sm transition-colors ${
                    isSelected
                      ? "border-orion-accent bg-amber-50 font-semibold text-gray-900 ring-1 ring-orion-accent"
                      : "border-gray-300 text-gray-700 hover:border-gray-500"
                  }`}
                >
                  {value.localized}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p
        className={`mt-3 text-sm font-semibold ${
          comboMissing || stock === 0
            ? "text-gray-500"
            : stock <= 5
              ? "text-red-700"
              : "text-green-700"
        }`}
      >
        {comboMissing
          ? t("comboUnavailable")
          : stock === 0
            ? tc("outOfStock")
            : stock <= 5
              ? tc("onlyLeft", { count: stock })
              : tc("inStock")}
      </p>

      {stock > 0 && !comboMissing ? (
        <>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-gray-700">{t("qty")}</span>
            <select
              value={Math.min(qty, max)}
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
            <AddToCartButton
              product={{
                id: product.id,
                slug: product.slug,
                titleEn: product.titleEn,
                titleAr: product.titleAr,
                price: product.price,
                image: product.image,
                stock: product.stock,
              }}
              variant={cartVariant}
              qty={qty}
              size="lg"
            />
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
