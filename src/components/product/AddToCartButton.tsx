"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/components/cart/CartProvider";

export interface CartProduct {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  price: number;
  image: string;
  stock: number;
}

export interface CartVariant {
  id: string;
  labelEn: string;
  labelAr: string;
  price: number | null;
  stock: number;
  image?: string | null;
}

export default function AddToCartButton({
  product,
  variant,
  qty = 1,
  size = "sm",
  className = "",
}: {
  product: CartProduct;
  /** التركيبة المختارة لو المنتج ليه variants */
  variant?: CartVariant | null;
  qty?: number;
  size?: "sm" | "lg";
  className?: string;
}) {
  const { addItem } = useCart();
  const t = useTranslations("common");
  const [added, setAdded] = useState(false);

  const stock = variant ? variant.stock : product.stock;
  const price = variant?.price ?? product.price;

  const sizeClasses = size === "lg" ? "px-6 py-2.5 text-base" : "px-3 py-1.5 text-sm";
  const base = `flex w-full items-center justify-center gap-2 rounded-full font-semibold transition-colors ${sizeClasses} ${className}`;

  if (stock === 0) {
    return (
      <button disabled className={`${base} cursor-not-allowed bg-gray-200 text-gray-500`}>
        {t("outOfStock")}
      </button>
    );
  }

  function onClick() {
    addItem(
      {
        productId: product.id,
        variantId: variant?.id,
        slug: product.slug,
        titleEn: product.titleEn,
        titleAr: product.titleAr,
        variantLabelEn: variant?.labelEn,
        variantLabelAr: variant?.labelAr,
        price,
        image: variant?.image || product.image,
        stock,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={onClick}
      className={`${base} ${
        added
          ? "bg-green-600 text-white"
          : "bg-orion-accent text-orion-dark hover:bg-orion-accent-dark"
      }`}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" />
          {t("addedToCart")}
        </>
      ) : (
        <>
          {size === "lg" && <ShoppingCart className="h-5 w-5" />}
          {t("addToCart")}
        </>
      )}
    </button>
  );
}
