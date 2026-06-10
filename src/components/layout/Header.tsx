import { Suspense } from "react";
import { Star } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { categoryName } from "@/lib/catalog";
import SearchBar from "./SearchBar";
import LanguageSwitcher from "./LanguageSwitcher";
import AccountMenu from "./AccountMenu";
import CartButton from "./CartButton";

export default async function Header() {
  const t = await getTranslations("header");
  const locale = await getLocale();

  let categories: { id: string; slug: string; nameEn: string; nameAr: string }[] = [];
  try {
    // الفئات الرئيسية بس في شريط التنقل — الفرعية بتظهر جوه صفحة الفئة
    categories = await prisma.category.findMany({
      where: { parentId: null },
      select: { id: true, slug: true, nameEn: true, nameAr: true },
      orderBy: { nameEn: "asc" },
    });
  } catch {
    // الـ DB لسه متعملتش seed — الهيدر يشتغل من غير الفئات
  }

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* الشريط الرئيسي */}
      <div className="bg-orion-dark text-white">
        <div className="mx-auto flex max-w-screen-2xl items-center gap-1 px-3 py-2 sm:gap-3 sm:px-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1 rounded border border-transparent px-2 py-1 hover:border-white"
          >
            <Star className="h-5 w-5 fill-orion-accent text-orion-accent" />
            <span className="text-xl font-bold tracking-wide">Orion</span>
          </Link>

          <div className="hidden min-w-0 flex-1 sm:block">
            <SearchBar />
          </div>

          <div className="ms-auto flex items-center sm:ms-0">
            <Suspense fallback={null}>
              <LanguageSwitcher />
            </Suspense>
            <AccountMenu />
            <Link
              href="/orders"
              className="hidden rounded border border-transparent px-2 py-1 text-xs leading-tight hover:border-white lg:block"
            >
              <span className="block text-gray-300">{t("returnsLine")}</span>
              <span className="block text-sm font-bold">{t("ordersLine")}</span>
            </Link>
            <CartButton />
          </div>
        </div>

        {/* البحث على الموبايل */}
        <div className="px-3 pb-2 sm:hidden">
          <SearchBar />
        </div>
      </div>

      {/* شريط الفئات */}
      <nav className="bg-orion-mid text-white">
        <div className="scrollbar-hide mx-auto flex max-w-screen-2xl items-center gap-1 overflow-x-auto px-3 text-sm">
          <Link
            href="/"
            className="whitespace-nowrap rounded border border-transparent px-2 py-2 font-bold hover:border-white"
          >
            {t("all")}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="whitespace-nowrap rounded border border-transparent px-2 py-2 hover:border-white"
            >
              {categoryName(c, locale)}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
