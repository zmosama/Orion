"use client";

import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/cart/CartProvider";

export default function CartButton() {
  const { count, ready } = useCart();
  const t = useTranslations("header");

  return (
    <Link
      href="/cart"
      className="relative flex items-end gap-1 rounded border border-transparent px-2 py-1 hover:border-white"
      aria-label={t("cart")}
    >
      <span className="relative">
        <ShoppingCart className="h-7 w-7" />
        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-sm font-bold text-orion-accent">
          {ready ? count : 0}
        </span>
      </span>
      <span className="hidden pb-0.5 text-sm font-bold md:block">{t("cart")}</span>
    </Link>
  );
}
