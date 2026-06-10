import type { Prisma, Product } from "@prisma/client";

/**
 * فلاتر التصفح (سايدبار زي أمازون) — مشتركة بين صفحات الفئات والبحث.
 * الفلترة بتتم في JS بعد جلب نتائج الفئة/البحث لأن خيارات الفاريانتس JSON في SQLite.
 * (للإنتاج على PostgreSQL: تتنقل لـ JSONB queries)
 */

export const SORT_ORDERS: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
  rating: { rating: "desc" },
};

export function sortKeyOf(sort?: string): string {
  return sort && sort in SORT_ORDERS ? sort : "newest";
}

export interface AppliedFilters {
  brands: string[];
  min?: number;
  max?: number;
  rating?: number;
  inStock: boolean;
  /** nameEn ⇒ القيم EN المختارة (من URL: opt_Color=Red,Blue) */
  options: Record<string, string[]>;
}

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

const csv = (v: string | string[] | undefined): string[] =>
  typeof v === "string"
    ? v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

const num = (v: string | string[] | undefined): number | undefined => {
  const n = Number(typeof v === "string" ? v : NaN);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function parseFilters(sp: SearchParamsRecord): AppliedFilters {
  const options: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (key.startsWith("opt_")) {
      const values = csv(value);
      if (values.length > 0) options[key.slice(4)] = values;
    }
  }
  return {
    brands: csv(sp.brand),
    min: num(sp.min),
    max: num(sp.max),
    rating: num(sp.rating),
    inStock: sp.instock === "1",
    options,
  };
}

export function hasActiveFilters(f: AppliedFilters): boolean {
  return (
    f.brands.length > 0 ||
    f.min !== undefined ||
    f.max !== undefined ||
    f.rating !== undefined ||
    f.inStock ||
    Object.keys(f.options).length > 0
  );
}

export type ProductWithVariants = Product & {
  variants: { optionsEn: string; stock: number }[];
};

export function applyFilters<T extends ProductWithVariants>(
  products: T[],
  f: AppliedFilters,
): T[] {
  return products.filter((p) => {
    if (f.brands.length > 0 && (!p.brand || !f.brands.includes(p.brand))) return false;
    if (f.min !== undefined && p.price < f.min) return false;
    if (f.max !== undefined && f.max > 0 && p.price > f.max) return false;
    if (f.rating !== undefined && p.rating < f.rating) return false;
    if (f.inStock && p.stock <= 0) return false;

    // فلاتر الخيارات: جوه المجموعة الواحدة OR، وبين المجموعات AND (زي أمازون)
    for (const [name, values] of Object.entries(f.options)) {
      const matches = p.variants.some((v) => {
        try {
          const opts = JSON.parse(v.optionsEn) as Record<string, string>;
          return values.includes(opts[name]);
        } catch {
          return false;
        }
      });
      if (!matches) return false;
    }
    return true;
  });
}

export interface Facets {
  brands: { name: string; count: number }[];
  options: {
    nameEn: string;
    nameLocalized: string;
    values: { en: string; localized: string; count: number }[];
  }[];
}

interface OptionTypeJson {
  name: string;
  values: string[];
}

/** تجميع قيم الفلاتر المتاحة من نتائج الصفحة الحالية (قبل الفلترة) */
export function buildFacets(products: ProductWithVariants[], locale: string): Facets {
  const brandMap = new Map<string, number>();
  for (const p of products) {
    if (p.brand) brandMap.set(p.brand, (brandMap.get(p.brand) ?? 0) + 1);
  }

  const optMap = new Map<
    string,
    { nameLocalized: string; values: Map<string, { localized: string; count: number }> }
  >();
  for (const p of products) {
    if (!p.hasVariants || !p.optionsEn) continue;
    let typesEn: OptionTypeJson[] = [];
    let typesLoc: OptionTypeJson[] = [];
    try {
      typesEn = JSON.parse(p.optionsEn) as OptionTypeJson[];
    } catch {
      continue;
    }
    try {
      typesLoc = JSON.parse(
        (locale === "ar" ? p.optionsAr : p.optionsEn) ?? "[]",
      ) as OptionTypeJson[];
    } catch {
      typesLoc = [];
    }

    typesEn.forEach((type, i) => {
      const entry = optMap.get(type.name) ?? {
        nameLocalized: typesLoc[i]?.name ?? type.name,
        values: new Map<string, { localized: string; count: number }>(),
      };
      type.values.forEach((value, j) => {
        const v = entry.values.get(value) ?? {
          localized: typesLoc[i]?.values[j] ?? value,
          count: 0,
        };
        v.count += 1;
        entry.values.set(value, v);
      });
      optMap.set(type.name, entry);
    });
  }

  return {
    brands: [...brandMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    options: [...optMap.entries()].map(([nameEn, entry]) => ({
      nameEn,
      nameLocalized: entry.nameLocalized,
      values: [...entry.values.entries()].map(([en, v]) => ({
        en,
        localized: v.localized,
        count: v.count,
      })),
    })),
  };
}
