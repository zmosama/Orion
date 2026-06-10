"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

const OPTIONS = ["newest", "price-asc", "price-desc", "rating"] as const;

export default function SortSelect({ current }: { current: string }) {
  const t = useTranslations("category.sort");
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">{t("label")}</span>
      <select
        value={current}
        onChange={(e) => router.replace(`${pathname}?sort=${e.target.value}`)}
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
