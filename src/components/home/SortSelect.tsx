"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";

const OPTIONS = ["newest", "price-asc", "price-desc", "rating"] as const;

export default function SortSelect({ current }: { current: string }) {
  const t = useTranslations("category.sort");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(value: string) {
    // الحفاظ على باقي الباراميترات (الفلاتر وكلمة البحث)
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">{t("label")}</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-orion-accent"
      >
        {OPTIONS.map((o) => (
          <option key={o} value={o}>
            {t(o)}
          </option>
        ))}
      </select>
    </label>
  );
}
