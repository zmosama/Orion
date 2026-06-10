import { Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function Footer() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 text-white">
      <a
        href="#top"
        className="block bg-orion-light py-3 text-center text-sm font-medium transition-colors hover:bg-orion-mid"
      >
        {t("backToTop")}
      </a>

      <div className="bg-orion-dark">
        <div className="mx-auto grid max-w-screen-xl grid-cols-2 gap-8 px-6 py-10 text-sm sm:grid-cols-3">
          <div>
            <h3 className="mb-3 font-bold">{t("shop")}</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/" className="hover:text-white hover:underline">
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white hover:underline">
                  {t("cart")}
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white hover:underline">
                  {t("orders")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-bold">{t("customerService")}</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="mailto:support@orion.shop" className="hover:text-white hover:underline">
                  {t("contactUs")}
                </a>
              </li>
              <li>{t("shippingPolicy")}</li>
              <li>{t("returnsPolicy")}</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-bold">{t("aboutTitle")}</h3>
            <p className="leading-relaxed text-gray-300">{t("aboutText")}</p>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-center">
          <div className="mb-2 flex items-center justify-center gap-1">
            <Star className="h-4 w-4 fill-orion-accent text-orion-accent" />
            <span className="text-lg font-bold tracking-wide">Orion</span>
          </div>
          <p className="text-xs text-gray-400">{t("rights", { year })}</p>
        </div>
      </div>
    </footer>
  );
}
