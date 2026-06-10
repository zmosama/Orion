"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const router = useRouter();
  const t = useTranslations("header");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex h-10 w-full overflow-hidden rounded-md bg-white ring-orion-accent focus-within:ring-2"
      role="search"
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="min-w-0 flex-1 px-3 text-sm text-gray-900 outline-none placeholder:text-gray-500"
      />
      <button
        type="submit"
        aria-label={t("searchPlaceholder")}
        className="bg-orion-accent px-4 transition-colors hover:bg-orion-accent-dark"
      >
        <Search className="h-5 w-5 text-orion-dark" />
      </button>
    </form>
  );
}
