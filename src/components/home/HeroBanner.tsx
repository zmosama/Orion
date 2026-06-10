import { Sparkles, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/** بانر الصفحة الرئيسية — تدرّج كحلي بنجوم خفيفة + عنوان وزر CTA */
export default async function HeroBanner() {
  const t = await getTranslations("home");

  return (
    <section className="relative min-h-[300px] w-full overflow-hidden bg-linear-to-br from-orion-dark via-orion-mid to-orion-light pb-28 sm:min-h-[340px]">
      {/* نجوم ديكورية — عناصر زخرفية فقط */}
      <div aria-hidden className="pointer-events-none absolute inset-0 text-white">
        <Star className="absolute start-[6%] top-10 h-4 w-4 opacity-25" fill="currentColor" />
        <Star className="absolute start-[18%] top-32 h-2.5 w-2.5 opacity-15" fill="currentColor" />
        <Sparkles className="absolute start-[30%] top-6 h-5 w-5 opacity-20" />
        <Star className="absolute end-[8%] top-12 h-5 w-5 opacity-30" fill="currentColor" />
        <Star className="absolute end-[20%] top-40 h-3 w-3 opacity-20" fill="currentColor" />
        <Sparkles className="absolute end-[32%] top-24 h-4 w-4 opacity-15" />
        <Star className="absolute end-[45%] top-8 h-2.5 w-2.5 opacity-25" fill="currentColor" />
        <Star className="absolute start-[45%] top-44 h-3.5 w-3.5 opacity-10" fill="currentColor" />
        <Sparkles className="absolute start-[10%] top-48 h-4 w-4 opacity-10" />
        <Star className="absolute end-[12%] top-56 h-3 w-3 opacity-15" fill="currentColor" />
      </div>

      <div className="relative mx-auto flex max-w-screen-2xl flex-col items-start gap-4 px-4 pt-14 sm:pt-20">
        <h1 className="max-w-2xl text-3xl font-bold text-white sm:text-5xl">{t("hero.title")}</h1>
        <p className="max-w-xl text-base text-gray-300 sm:text-lg">{t("hero.subtitle")}</p>
        <Link
          href="/category/electronics"
          className="mt-2 rounded-md bg-orion-accent px-6 py-3 text-sm font-bold text-orion-dark transition-colors hover:bg-orion-accent-dark sm:text-base"
        >
          {t("hero.cta")}
        </Link>
      </div>
    </section>
  );
}
