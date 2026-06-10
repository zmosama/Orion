"use client";

import { useState } from "react";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export interface ProductFormCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  depth: number;
}

export interface OptionValueRow {
  en: string;
  ar: string;
}

export interface OptionTypeRow {
  nameEn: string;
  nameAr: string;
  values: OptionValueRow[];
}

export interface VariantRow {
  id?: string;
  comboEn: Record<string, string>;
  comboAr: Record<string, string>;
  labelEn: string;
  price: string;
  stock: string;
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
  optionTypes: OptionTypeRow[];
  variantRows: VariantRow[];
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

/** كل تركيبات الخيارات (cartesian product) */
function buildCombos(types: OptionTypeRow[]): { comboEn: Record<string, string>; comboAr: Record<string, string> }[] {
  let acc: { comboEn: Record<string, string>; comboAr: Record<string, string> }[] = [
    { comboEn: {}, comboAr: {} },
  ];
  for (const type of types) {
    if (!type.nameEn.trim() || type.values.length === 0) continue;
    const next: typeof acc = [];
    for (const base of acc) {
      for (const value of type.values) {
        if (!value.en.trim()) continue;
        next.push({
          comboEn: { ...base.comboEn, [type.nameEn.trim()]: value.en.trim() },
          comboAr: {
            ...base.comboAr,
            [type.nameAr.trim() || type.nameEn.trim()]: value.ar.trim() || value.en.trim(),
          },
        });
      }
    }
    acc = next;
  }
  return acc.filter((c) => Object.keys(c.comboEn).length > 0);
}

const comboLabel = (combo: Record<string, string>) =>
  Object.entries(combo)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");

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
      optionTypes: [],
      variantRows: [],
    },
  );
  const [state, setState] = useState<"idle" | "saving" | "deleting">("idle");
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof ProductFormValues) => (value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isEdit = Boolean(initial?.id);
  const hasVariants = form.variantRows.length > 0;

  // ===== إدارة أنواع الخيارات =====
  const setTypes = (updater: (types: OptionTypeRow[]) => OptionTypeRow[]) =>
    setForm((f) => ({ ...f, optionTypes: updater(f.optionTypes) }));

  function generateCombos() {
    const combos = buildCombos(form.optionTypes);
    setForm((f) => ({
      ...f,
      variantRows: combos.map((c) => {
        const key = JSON.stringify(c.comboEn);
        const existing = f.variantRows.find((r) => JSON.stringify(r.comboEn) === key);
        return {
          id: existing?.id,
          comboEn: c.comboEn,
          comboAr: c.comboAr,
          labelEn: comboLabel(c.comboEn),
          price: existing?.price ?? "",
          stock: existing?.stock ?? "0",
        };
      }),
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    setError(null);

    const cleanTypes = form.optionTypes.filter((o) => o.nameEn.trim() && o.values.some((v) => v.en.trim()));

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
      optionsEn: hasVariants
        ? cleanTypes.map((o) => ({
            name: o.nameEn.trim(),
            values: o.values.filter((v) => v.en.trim()).map((v) => v.en.trim()),
          }))
        : [],
      optionsAr: hasVariants
        ? cleanTypes.map((o) => ({
            name: o.nameAr.trim() || o.nameEn.trim(),
            values: o.values
              .filter((v) => v.en.trim())
              .map((v) => v.ar.trim() || v.en.trim()),
          }))
        : [],
      variants: form.variantRows.map((r) => ({
        id: r.id,
        optionsEn: r.comboEn,
        optionsAr: r.comboAr,
        price: r.price.trim() === "" ? null : Number(r.price),
        stock: Number(r.stock) || 0,
      })),
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
          <input
            type="number"
            required
            min={0}
            value={hasVariants ? String(form.variantRows.reduce((s, r) => s + (Number(r.stock) || 0), 0)) : form.stock}
            onChange={(e) => set("stock")(e.target.value)}
            className={inputClass}
            dir="ltr"
            disabled={hasVariants}
            title={hasVariants ? t("stockFromVariants") : undefined}
          />
          {hasVariants ? <span className="mt-1 block text-xs text-gray-500">{t("stockFromVariants")}</span> : null}
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-gray-700">{t("categoryField")}</span>
          <select value={form.categoryId} onChange={(e) => set("categoryId")(e.target.value)} className={inputClass}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {" ".repeat(c.depth * 3)}
                {c.depth > 0 ? "└ " : ""}
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

      {/* ===== الفاريانتس: مقاسات / ألوان / أوزان ===== */}
      <section className="rounded-md border border-gray-200 bg-gray-50 p-4">
        <h3 className="font-bold text-gray-900">{t("variantsTitle")}</h3>
        <p className="mt-1 text-xs text-gray-600">{t("variantsHint")}</p>

        {form.optionTypes.map((type, ti) => (
          <div key={ti} className="mt-3 rounded-md border border-gray-200 bg-white p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block text-xs">
                <span className="mb-1 block font-semibold text-gray-700">{t("optionNameEn")}</span>
                <input
                  value={type.nameEn}
                  onChange={(e) =>
                    setTypes((ts) => ts.map((o, i) => (i === ti ? { ...o, nameEn: e.target.value } : o)))
                  }
                  className={inputClass}
                  dir="ltr"
                  placeholder="Size / Color / Weight"
                />
              </label>
              <label className="block text-xs">
                <span className="mb-1 block font-semibold text-gray-700">{t("optionNameAr")}</span>
                <input
                  value={type.nameAr}
                  onChange={(e) =>
                    setTypes((ts) => ts.map((o, i) => (i === ti ? { ...o, nameAr: e.target.value } : o)))
                  }
                  className={inputClass}
                  dir="rtl"
                  placeholder="المقاس / اللون / الوزن"
                />
              </label>
            </div>

            <p className="mt-2 text-xs font-semibold text-gray-700">{t("optionValues")}</p>
            {type.values.map((value, vi) => (
              <div key={vi} className="mt-1 flex items-center gap-2">
                <input
                  value={value.en}
                  onChange={(e) =>
                    setTypes((ts) =>
                      ts.map((o, i) =>
                        i === ti
                          ? { ...o, values: o.values.map((v, j) => (j === vi ? { ...v, en: e.target.value } : v)) }
                          : o,
                      ),
                    )
                  }
                  className={`${inputClass} flex-1`}
                  dir="ltr"
                  placeholder="M / Red / 5kg"
                />
                <input
                  value={value.ar}
                  onChange={(e) =>
                    setTypes((ts) =>
                      ts.map((o, i) =>
                        i === ti
                          ? { ...o, values: o.values.map((v, j) => (j === vi ? { ...v, ar: e.target.value } : v)) }
                          : o,
                      ),
                    )
                  }
                  className={`${inputClass} flex-1`}
                  dir="rtl"
                  placeholder="M / أحمر / ٥ كجم"
                />
                <button
                  type="button"
                  onClick={() =>
                    setTypes((ts) =>
                      ts.map((o, i) => (i === ti ? { ...o, values: o.values.filter((_, j) => j !== vi) } : o)),
                    )
                  }
                  className="shrink-0 text-red-700"
                  aria-label={tc("delete")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setTypes((ts) =>
                    ts.map((o, i) => (i === ti ? { ...o, values: [...o.values, { en: "", ar: "" }] } : o)),
                  )
                }
                className="flex items-center gap-1 text-xs text-orion-link hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("addValue")}
              </button>
              <button
                type="button"
                onClick={() => setTypes((ts) => ts.filter((_, i) => i !== ti))}
                className="flex items-center gap-1 text-xs text-red-700 hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("removeOption")}
              </button>
            </div>
          </div>
        ))}

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {form.optionTypes.length < 3 ? (
            <button
              type="button"
              onClick={() => setTypes((ts) => [...ts, { nameEn: "", nameAr: "", values: [{ en: "", ar: "" }] }])}
              className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm hover:bg-gray-100"
            >
              <Plus className="h-4 w-4" />
              {t("addOption")}
            </button>
          ) : null}
          {form.optionTypes.length > 0 ? (
            <button
              type="button"
              onClick={generateCombos}
              className="flex items-center gap-1 rounded-full bg-orion-mid px-4 py-1.5 text-sm font-semibold text-white hover:bg-orion-light"
            >
              <Wand2 className="h-4 w-4" />
              {t("generate")}
            </button>
          ) : null}
        </div>

        {form.variantRows.length > 0 ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-120 text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-600">
                  <th className="p-2 text-start">{t("variantLabel")}</th>
                  <th className="p-2 text-start">{t("variantPrice")}</th>
                  <th className="p-2 text-start">{t("stockField")}</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {form.variantRows.map((row, ri) => (
                  <tr key={ri} className="bg-white">
                    <td className="p-2 text-gray-800" dir="ltr">
                      {row.labelEn}
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={1}
                        value={row.price}
                        placeholder={form.price || "—"}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            variantRows: f.variantRows.map((r, i) => (i === ri ? { ...r, price: e.target.value } : r)),
                          }))
                        }
                        className={`${inputClass} w-28`}
                        dir="ltr"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min={0}
                        value={row.stock}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            variantRows: f.variantRows.map((r, i) => (i === ri ? { ...r, stock: e.target.value } : r)),
                          }))
                        }
                        className={`${inputClass} w-24`}
                        dir="ltr"
                      />
                    </td>
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, variantRows: f.variantRows.filter((_, i) => i !== ri) }))
                        }
                        className="text-red-700"
                        aria-label={tc("delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

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
