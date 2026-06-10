import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  // الإنجليزي على / من غير prefix، والعربي على /ar/...
  localePrefix: "as-needed",
});
