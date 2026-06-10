import {
  FolderTree,
  LayoutDashboard,
  Package,
  ShieldX,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { Link, redirect } from "@/i18n/navigation";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) redirect({ href: "/login", locale });

  const t = await getTranslations("admin");

  if (session!.user.role !== "admin") {
    return (
      <div className="flex flex-col items-center px-4 py-24 text-center">
        <ShieldX className="h-14 w-14 text-red-600" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">{t("forbiddenTitle")}</h1>
        <p className="mt-1 text-gray-600">{t("forbiddenText")}</p>
      </div>
    );
  }

  const nav = [
    { href: "/admin", icon: LayoutDashboard, label: t("nav.dashboard") },
    { href: "/admin/products", icon: Package, label: t("nav.products") },
    { href: "/admin/categories", icon: FolderTree, label: t("nav.categories") },
    { href: "/admin/orders", icon: ShoppingBag, label: t("nav.orders") },
    { href: "/admin/customers", icon: Users, label: t("nav.customers") },
  ] as const;

  return (
    <div className="mx-auto flex max-w-screen-2xl flex-col gap-6 px-4 py-6 lg:flex-row">
      <aside className="shrink-0 lg:w-56">
        <nav className="rounded-lg border border-gray-200 bg-white p-2">
          <ul className="scrollbar-hide flex gap-1 overflow-x-auto lg:flex-col">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-orion-bg"
                >
                  <item.icon className="h-4 w-4 text-orion-link" />
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="lg:mt-1 lg:border-t lg:border-gray-100 lg:pt-1">
              <Link
                href="/"
                className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-orion-bg"
              >
                <Store className="h-4 w-4" />
                {t("nav.viewStore")}
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
