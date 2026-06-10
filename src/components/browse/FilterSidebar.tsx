"use client";

import { useState } from "react";
import { SlidersHorizontal, Star, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { formatEGP } from "@/lib/money";
import type { AppliedFilters, Facets } from "@/lib/filters";

/** سايدبار الفلاتر (زي أمازون) — بيكتب الاختيارات في الـ URL فالنتائج SSR وقابلة للمشاركة */
export default function FilterSidebar({
  facets,
  applied,
}: {
  facets: Facets;
  applied: AppliedFilters;
}) {
  const t = useTranslations("filters");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [minInput, setMinInput] = useState(applied.min?.toString() ?? "");
  const [maxInput, setMaxInput] = useState(applied.max?.toString() ?? "");

  function navigate(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
  }

  function toggleCsv(key: string, value: string) {
    navigate((params) => {
      const current = (params.get(key) ?? "").split(",").filter(Boolean);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (next.length > 0) params.set(key, next.join(","));
      else params.delete(key);
    });
  }

  function setParam(key: string, value: string | null) {
    navigate((params) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
  }

  function applyPrice(e: React.FormEvent) {
    e.preventDefault();
    navigate((params) => {
      if (minInput.trim()) params.set("min", minInput.trim());
      else params.delete("min");
      if (maxInput.trim()) params.set("max", maxInput.trim());
      else params.delete("max");
    });
  }

  function clearAll() {
    setMinInput("");
    setMaxInput("");
    navigate((params) => {
      const keep = new Map<string, string>();
      const q = params.get("q");
      const sort = params.get("sort");
      if (q) keep.set("q", q);
      if (sort) keep.set("sort", sort);
      [...params.keys()].forEach((k) => params.delete(k));
      keep.forEach((v, k) => params.set(k, v));
    });
  }

  const anyActive =
    applied.brands.length > 0 ||
    applied.min !== undefined ||
    applied.max !== undefined ||
    applied.rating !== undefined ||
    applied.inStock ||
    Object.keys(applied.options).length > 0;

  const checkboxClass = "h-4 w-4 shrink-0 accent-orion-accent";
  const rowClass =
    "flex cursor-pointer items-center gap-2 py-1 text-sm text-gray-800 hover:text-orion-accent-dark";

  return (
    <div>
      {/* زر الفلاتر على الموبايل */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mb-3 flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {t("title")}
        {anyActive ? <span className="h-2 w-2 rounded-full bg-orion-accent" /> : null}
      </button>

      <aside
        className={`${open ? "block" : "hidden"} space-y-5 rounded-lg border border-gray-200 bg-white p-4 lg:block`}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">{t("title")}</h2>
          {anyActive ? (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-orion-link hover:underline"
            >
              <X className="h-3.5 w-3.5" />
              {t("clear")}
            </button>
          ) : null}
        </div>

        {/* التوفر */}
        <section>
          <label className={rowClass}>
            <input
              type="checkbox"
              checked={applied.inStock}
              onChange={() => setParam("instock", applied.inStock ? null : "1")}
              className={checkboxClass}
            />
            {t("inStockOnly")}
          </label>
        </section>

        {/* البراند */}
        {facets.brands.length > 0 ? (
          <section>
            <h3 className="mb-1 text-sm font-bold text-gray-900">{t("brand")}</h3>
            {facets.brands.map((b) => (
              <label key={b.name} className={rowClass}>
                <input
                  type="checkbox"
                  checked={applied.brands.includes(b.name)}
                  onChange={() => toggleCsv("brand", b.name)}
                  className={checkboxClass}
                />
                <span className="min-w-0 flex-1 truncate">{b.name}</span>
                <span className="text-xs text-gray-400">({b.count})</span>
              </label>
            ))}
          </section>
        ) : null}

        {/* خيارات الفاريانتس: مقاس/لون/وزن… */}
        {facets.options.map((option) => (
          <section key={option.nameEn}>
            <h3 className="mb-1 text-sm font-bold text-gray-900">{option.nameLocalized}</h3>
            {option.values.map((value) => (
              <label key={value.en} className={rowClass}>
                <input
                  type="checkbox"
                  checked={(applied.options[option.nameEn] ?? []).includes(value.en)}
                  onChange={() => toggleCsv(`opt_${option.nameEn}`, value.en)}
                  className={checkboxClass}
                />
                <span className="min-w-0 flex-1 truncate">{value.localized}</span>
                <span className="text-xs text-gray-400">({value.count})</span>
              </label>
            ))}
          </section>
        ))}

        {/* السعر */}
        <section>
          <h3 className="mb-1 text-sm font-bold text-gray-900">{t("price")}</h3>
          <form onSubmit={applyPrice} className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              placeholder={t("min")}
              className="w-0 flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-orion-accent"
              dir="ltr"
            />
            <span className="text-gray-400">–</span>
            <input
              type="number"
              min={0}
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              placeholder={t("max")}
              className="w-0 flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-orion-accent"
              dir="ltr"
            />
            <button
              type="submit"
              className="rounded-full border border-gray-300 px-3 py-1 text-sm font-medium hover:bg-gray-50"
            >
              {t("go")}
            </button>
          </form>
          {applied.min !== undefined || applied.max !== undefined ? (
            <p className="mt-1 text-xs text-gray-500">
              {applied.min !== undefined ? formatEGP(applied.min, locale) : "٠"} —{" "}
              {applied.max !== undefined ? formatEGP(applied.max, locale) : "∞"}
            </p>
          ) : null}
        </section>

        {/* التقييم */}
        <section>
          <h3 className="mb-1 text-sm font-bold text-gray-900">{t("rating")}</h3>
          {[4, 3].map((stars) => (
            <button
              key={stars}
              type="button"
              onClick={() =>
                setParam("rating", applied.rating === stars ? null : String(stars))
              }
              className={`${rowClass} w-full ${applied.rating === stars ? "font-bold text-orion-accent-dark" : ""}`}
            >
              <span className="inline-flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i <= stars ? "fill-orion-accent text-orion-accent" : "fill-gray-200 text-gray-300"}`}
                  />
                ))}
              </span>
              {t("andUp")}
            </button>
          ))}
        </section>
      </aside>
    </div>
  );
}
