import Image from "next/image";
import type { Category } from "@prisma/client";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { categoryName } from "@/lib/catalog";

/** كروت الفئات الأربعة — بتركب على آخر الـ hero بستايل أمازون */
export default async function CategoryCardGrid({ categories }: { categories: Category[] }) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("home")]);

  return (
    <section className="relative z-10 -mt-20 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {categories.map((category) => {
        const name = categoryName(category, locale);
        return (
          <div
            key={category.id}
            className="flex flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <h2 className="text-base font-bold text-gray-900 sm:text-lg">{name}</h2>
            <Link
              href={`/category/${category.slug}`}
              className="relative mt-3 block aspect-[4/3] w-full overflow-hidden rounded"
            >
              <Image
                src={category.image ?? "/placeholder.svg"}
                alt={name}
                fill
                sizes="(max-width: 1024px) 50vw, 360px"
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </Link>
            <Link
              href={`/category/${category.slug}`}
              className="mt-3 text-sm font-medium text-orion-link hover:underline"
            >
              {t("shopNow")}
            </Link>
          </div>
        );
      })}
    </section>
  );
}
