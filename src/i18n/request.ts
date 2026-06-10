import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // الرسائل مقسومة ملفات حسب ملكية الأجينتس — الـ namespaces الجذرية مميزة لكل ملف
  const [common, home, pdp, account, shop, admin] = await Promise.all([
    import(`../../messages/${locale}/common.json`),
    import(`../../messages/${locale}/home.json`),
    import(`../../messages/${locale}/pdp.json`),
    import(`../../messages/${locale}/account.json`),
    import(`../../messages/${locale}/shop.json`),
    import(`../../messages/${locale}/admin.json`),
  ]);

  return {
    locale,
    messages: {
      ...common.default,
      ...home.default,
      ...pdp.default,
      ...account.default,
      ...shop.default,
      ...admin.default,
    },
  };
});
