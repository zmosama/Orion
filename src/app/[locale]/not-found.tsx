import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <Star className="h-16 w-16 fill-orion-accent text-orion-accent" />
      <h1 className="mt-6 text-3xl font-bold text-orion-dark">{t("notFoundTitle")}</h1>
      <p className="mt-2 text-gray-600">{t("notFoundText")}</p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-orion-accent px-6 py-2 font-semibold text-orion-dark transition-colors hover:bg-orion-accent-dark"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
