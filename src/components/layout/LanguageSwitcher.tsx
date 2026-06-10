"use client";

import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";

/** مبدّل اللغة — بيحافظ على نفس الصفحة والـ query (زي أمازون) */
export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const other = locale === "ar" ? "en" : "ar";

  function switchLocale() {
    const qs = searchParams.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { locale: other });
  }

  return (
    <button
      onClick={switchLocale}
      className="flex items-center gap-1 rounded border border-transparent px-2 py-1 text-sm font-bold hover:border-white"
      aria-label={other === "ar" ? "التبديل إلى العربية" : "Switch to English"}
    >
      <Globe className="h-4 w-4" />
      <span>{other === "ar" ? "العربية" : "EN"}</span>
    </button>
  );
}
