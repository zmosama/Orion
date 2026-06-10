"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export interface ProductFormCategory {
  id: string;
  nameEn: string;
  nameAr: string;
}

export interface ProductFormValues {
  id?: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  brand: string;
  descriptionEn: string;
  descriptionAr: string;
  price: string;
  listPrice: string;
  stock: string;
  categoryId: string;
  imagesText: string;
  specsEnText: string;
  specsArText: string;
  featured: boolean;
}

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orion-accent focus:ring-2 focus:ring-orion-accent/40";

/** "مفتاح: قيمة" في كل سطر ⇒ object */
function parseSpecs(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      if (key && value) out[key] = value;
    }
  }
  return out;
}

export default function ProductForm({
  categories,
  initial,
}: {
  categories: ProductFormCategory[];
  initial?: ProductFormValues;
}) {
  const locale = useLocale();
  const t = useTranslations("admin.products");
  const tc = useTranslations("common");
  const router = useRouter();

  const [form, setForm] = useState<ProductFormValues>(
    initial ?? {
      slug: "",
      titleEn: "",
      titleAr: "",
      brand: "",
      descriptionEn: "",
      descriptionAr: "",
      price: "",
      listPrice: "",
      stock: "0",
      categoryId: categories[0]?.id ?? "",
      imagesText: "",
      specsEnText: "",
      specsArText: "",
      featured: false,
    },
  );
  const [state, setState] = useState<"idle" | "saving" | "deleting">("idle");
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof ProductFormValues) => (value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isEdit = Boolean(initial?.id);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    setError(null);

    const payload = {
      slug: form.slug.trim(),
      titleEn: form.titleEn.trim(),
      titleAr: form.titleAr.trim(),
      brand: form.brand.trim(),
      descriptionEn: form.descriptionEn.trim(),
      descriptionAr: form.descriptionAr.trim(),
      price: Number(form.price),
      listPrice: form.listPrice.trim() === "" ? null : Number(form.listPrice),
      stock: Number(form.stock),
      categoryId: form.categoryId,
      images: form.imagesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      specsEn: parseSpecs(form.specsEnText),
      specsAr: parseSpecs(form.specsArText),
      featured: form.featured,
    };

    const res = await fetch(isEdit ? `/api/admin/products/${initial!.id}` : "/api/admin/products", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
      return;
    }
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setError(data?.error === "SLUG_EXISTS" ? `${t("slug")}: ${form.slug} ✗` : t("invalid"));
    setState("idle");
  }

  async function onDelete() {
    if (!isEdit || !confirm(t("deleteConfirm"))) return;
    setState("deleting");
    setError(null);
    const res = await fetch(`/api/admin/products/${initial!.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
      return;
    }
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setError(data?.error === "HAS_ORDERS" ? t("deleteBlocked") : tc("error"));
    setState("idle");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      {error ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-gray-700">{t("slug")}</span>
          <input
            required
            pattern="[a-z0-9-]+"
            value={form.slug}
            onChange={(e) => set("slug")(e.target.value)}
            className={inputClass}
            dir="ltr"
            disabled={isEdit}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-gray-700">{t("brand")}</span>
          <input value={form.brand} onChange={(e) => set("brand")(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-gray-700">{t("titleEn")}</span>
          <input required value={form.titleEn} onChange={(e) => set("titleEn")(e.target.value)} className={inputClass} dir="ltr" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-gray-700">{t("titleAr")}</span>
          <input required value={form.titleAr} onChange={(e) => set("titleAr")(e.target.value)} className={inputClass} dir="rtl" />
        </label>
        <label className="block text-sm sm:col-span-1">
          <span className="mb-1 block font-semibold text-gray-700">{t("descEn")}</span>
          <textarea required rows={3} value={form.descriptionEn} onChange={(e) => set("descriptionEn")(e.target.value)} className={inputClass} dir="ltr" />
        </label>
        <label className="block text-sm sm:col-span-1">
          <span className="mb-1 block font-semibold text-gray-700">{t("descAr")}</span>
          <textarea required rows={3} value={form.descriptionAr} onChange={(e) => set("descriptionAr")(e.target.value)} className={inputClass} dir="rtl" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-gray-700">{t("priceField")}</span>
          <input type="number" required min={1} value={form.price} onChange={(e) => set("price")(e.target.value)} className={inputClass} dir="ltr" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-gray-700">{t("listPrice")}</span>
          <input type="number" min={1} value={form.listPrice} onChange={(e) => set("listPrice")(e.target.value)} className={inputClass} dir="ltr" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-gray-700">{t("stockField")}</span>
          <input type="number" required min={0} value={form.stock} onChange={(e) => set("stock")(e.target.value)} className={inputClass} dir="ltr" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-gray-700">{t("categoryField")}</span>
          <select value={form.categoryId} onChange={(e) => set("categoryId")(e.target.value)} className={inputClass}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {locale === "ar" ? c.nameAr : c.nameEn}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-gray-700">{t("images")}</span>
        <textarea required rows={3} value={form.imagesText} onChange={(e) => set("imagesText")(e.target.value)} className={inputClass} dir="ltr" placeholder="https://..." />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-gray-700">{t("specsEn")}</span>
          <textarea rows={4} value={form.specsEnText} onChange={(e) => set("specsEnText")(e.target.value)} className={inputClass} dir="ltr" placeholder="Battery: 30 hours" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-gray-700">{t("specsAr")}</span>
          <textarea rows={4} value={form.specsArText} onChange={(e) => set("specsArText")(e.target.value)} className={inputClass} dir="rtl" placeholder="البطارية: ٣٠ ساعة" />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => set("featured")(e.target.checked)}
          className="h-4 w-4 accent-orion-accent"
        />
        {t("featuredField")}
      </label>

      <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
        <button
          type="submit"
          disabled={state !== "idle"}
          className="rounded-full bg-orion-accent px-6 py-2 text-sm font-bold text-orion-dark transition-colors hover:bg-orion-accent-dark disabled:opacity-60"
        >
          {state === "saving" ? "…" : t("save")}
        </button>
        {isEdit ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={state !== "idle"}
            className="rounded-full border border-red-300 px-5 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
          >
            {t("deleteProduct")}
          </button>
        ) : null}
      </div>
    </form>
  );
}
