"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { formatEGP } from "@/lib/money";
import {
  FREE_SHIPPING_THRESHOLD,
  GOVERNORATES,
  SHIPPING_FEE,
} from "@/lib/constants";

export interface CheckoutAddress {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  line: string;
  isDefault: boolean;
}

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orion-accent focus:ring-2 focus:ring-orion-accent/40";

export default function CheckoutForm({ addresses }: { addresses: CheckoutAddress[] }) {
  const locale = useLocale();
  const t = useTranslations("checkout");
  const tc = useTranslations("common");
  const tp = useTranslations("paymentMethod");
  const router = useRouter();
  const { items, ready, subtotal, clearCart } = useCart();

  const def = addresses[0];
  const [selectedId, setSelectedId] = useState<string | null>(def?.id ?? null);
  const [form, setForm] = useState({
    name: def?.fullName ?? "",
    phone: def?.phone ?? "",
    governorate: def?.governorate ?? GOVERNORATES[0].value,
    city: def?.city ?? "",
    line: def?.line ?? "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "CARD">("COD");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  function pickAddress(a: CheckoutAddress) {
    setSelectedId(a.id);
    setForm({ name: a.fullName, phone: a.phone, governorate: a.governorate, city: a.city, line: a.line });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId ?? null,
          qty: i.qty,
        })),
        shipping: form,
        paymentMethod,
        locale,
      }),
    });
    const data = (await res.json().catch(() => null)) as
      | { orderId?: string; redirectUrl?: string; error?: string }
      | null;

    if (res.ok && data?.redirectUrl) {
      setPlaced(true);
      clearCart();
      if (data.redirectUrl.startsWith("http")) {
        window.location.assign(data.redirectUrl);
      } else {
        router.push(data.redirectUrl);
      }
      return;
    }

    setError(typeof data?.error === "string" && data.error.length > 0 ? data.error : tc("error"));
    setSubmitting(false);
  }

  if (!ready) {
    return <p className="p-16 text-center text-gray-500">{tc("loading")}</p>;
  }

  if (items.length === 0 && !placed) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-16 text-center">
        <p className="font-semibold text-gray-900">{t("emptyCart")}</p>
        <Link href="/" className="mt-3 inline-block text-sm text-orion-link hover:underline">
          {t("backToShopping")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        {/* 1 — عنوان الشحن */}
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{t("shippingTitle")}</h2>

          {addresses.length > 0 ? (
            <div className="mb-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700">{t("savedAddresses")}</p>
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm transition-colors ${
                    selectedId === a.id ? "border-orion-accent bg-amber-50" : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="savedAddress"
                    checked={selectedId === a.id}
                    onChange={() => pickAddress(a)}
                    className="mt-1 accent-orion-accent"
                  />
                  <span>
                    <span className="font-semibold">{a.fullName}</span>
                    {a.label ? <span className="ms-1 text-gray-500">({a.label})</span> : null}
                    <span className="block text-gray-600">
                      {a.line}، {a.city}
                    </span>
                  </span>
                </label>
              ))}
              <p className="pt-1 text-sm font-semibold text-gray-700">{t("newAddress")}</p>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-gray-700">{t("fullName")}</span>
              <input
                required
                minLength={2}
                value={form.name}
                onChange={(e) => {
                  setSelectedId(null);
                  setForm((f) => ({ ...f, name: e.target.value }));
                }}
                className={inputClass}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-gray-700">{t("phone")}</span>
              <input
                type="tel"
                required
                minLength={6}
                value={form.phone}
                onChange={(e) => {
                  setSelectedId(null);
                  setForm((f) => ({ ...f, phone: e.target.value }));
                }}
                className={inputClass}
                dir="ltr"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-gray-700">{t("governorate")}</span>
              <select
                value={form.governorate}
                onChange={(e) => {
                  setSelectedId(null);
                  setForm((f) => ({ ...f, governorate: e.target.value }));
                }}
                className={inputClass}
              >
                {GOVERNORATES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {locale === "ar" ? g.ar : g.en}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-gray-700">{t("city")}</span>
              <input
                required
                minLength={2}
                value={form.city}
                onChange={(e) => {
                  setSelectedId(null);
                  setForm((f) => ({ ...f, city: e.target.value }));
                }}
                className={inputClass}
              />
            </label>
          </div>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block font-semibold text-gray-700">{t("line")}</span>
            <input
              required
              minLength={5}
              value={form.line}
              onChange={(e) => {
                setSelectedId(null);
                setForm((f) => ({ ...f, line: e.target.value }));
              }}
              className={inputClass}
            />
          </label>
        </section>

        {/* 2 — طريقة الدفع */}
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{t("paymentTitle")}</h2>
          <div className="space-y-2">
            <label
              className={`flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm ${
                paymentMethod === "COD" ? "border-orion-accent bg-amber-50" : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
                className="mt-1 accent-orion-accent"
              />
              <span>
                <span className="font-semibold">{tp("COD")}</span>
                <span className="block text-gray-600">{t("codNote")}</span>
              </span>
            </label>
            <label
              className={`flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm ${
                paymentMethod === "CARD" ? "border-orion-accent bg-amber-50" : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "CARD"}
                onChange={() => setPaymentMethod("CARD")}
                className="mt-1 accent-orion-accent"
              />
              <span>
                <span className="font-semibold">{tp("CARD")}</span>
                <span className="block text-gray-600">{t("paymobNote")}</span>
              </span>
            </label>
          </div>
        </section>

        {/* 3 — مراجعة المنتجات */}
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{t("reviewTitle")}</h2>
          <ul className="divide-y divide-gray-100">
            {items.map((item) => {
              const title = locale === "ar" ? item.titleAr : item.titleEn;
              const variantLabel = locale === "ar" ? item.variantLabelAr : item.variantLabelEn;
              return (
                <li key={item.key} className="flex items-center gap-3 py-2 text-sm">
                  <span className="relative h-12 w-12 shrink-0">
                    <Image src={item.image} alt={title} fill sizes="48px" className="object-contain" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 block text-gray-800">{title}</span>
                    {variantLabel ? (
                      <span className="block text-xs text-gray-500">{variantLabel}</span>
                    ) : null}
                  </span>
                  <span className="text-gray-600">×{item.qty}</span>
                  <span className="font-semibold text-gray-900">
                    {formatEGP(item.price * item.qty, locale)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* ملخص الطلب */}
      <aside className="rounded-lg border border-gray-200 bg-white p-4 lg:sticky lg:top-32">
        {error ? (
          <p role="alert" className="mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <dl className="space-y-1 text-sm text-gray-700">
          <div className="flex justify-between">
            <dt>{t("itemsSubtotal")}</dt>
            <dd>{formatEGP(subtotal, locale)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{t("shipping")}</dt>
            <dd className={shippingFee === 0 ? "font-medium text-green-700" : ""}>
              {shippingFee === 0 ? t("free") : formatEGP(shippingFee, locale)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-red-800">
            <dt>{t("orderTotal")}</dt>
            <dd>{formatEGP(total, locale)}</dd>
          </div>
        </dl>

        <button
          type="submit"
          disabled={submitting || items.length === 0}
          className="mt-4 w-full rounded-full bg-orion-accent py-2 text-sm font-bold text-orion-dark transition-colors hover:bg-orion-accent-dark disabled:opacity-60"
        >
          {submitting ? t("placing") : t("placeOrder")}
        </button>
      </aside>
    </form>
  );
}
