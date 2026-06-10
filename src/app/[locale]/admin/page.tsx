import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";
import { productTitle } from "@/lib/catalog";
import { formatEGP } from "@/lib/money";
import { OrderStatus } from "@/lib/constants";
import { Link } from "@/i18n/navigation";

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // الصفحة بتترندر بالتوازي مع الـ layout — الحارس هنا يمنع تسرب البيانات في الـ RSC payload
  if (!(await getAdminSession())) return null;
  const t = await getTranslations("admin.dashboard");
  const ts = await getTranslations("orderStatus");

  const [orderCount, customerCount, revenue, lowStock, recent] = await Promise.all([
    prisma.order.count(),
    prisma.user.count({ where: { role: "customer" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: {
          in: [OrderStatus.CONFIRMED, OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
        },
      },
    }),
    prisma.product.findMany({ where: { stock: { lte: 5 } }, orderBy: { stock: "asc" }, take: 6 }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const cards = [
    { label: t("totalOrders"), value: orderCount.toString() },
    { label: t("revenue"), value: formatEGP(revenue._sum.total ?? 0, locale) },
    { label: t("customers"), value: customerCount.toString() },
    { label: t("lowStock"), value: lowStock.length.toString() },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 font-bold text-gray-900">{t("lowStockTitle")}</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-gray-600">{t("noLowStock")}</p>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 py-2">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="line-clamp-1 text-gray-800 hover:text-orion-link"
                  >
                    {productTitle(p, locale)}
                  </Link>
                  <span className={`shrink-0 font-bold ${p.stock === 0 ? "text-red-700" : "text-amber-700"}`}>
                    {t("stockLeft", { count: p.stock })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 font-bold text-gray-900">{t("recentOrders")}</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-600">{t("noOrders")}</p>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-2 py-2">
                  <span className="min-w-0">
                    <span className="line-clamp-1 text-gray-800">
                      {o.user.name ?? o.user.email}
                    </span>
                    <span className="text-xs text-gray-500">{ts(o.status)}</span>
                  </span>
                  <span className="shrink-0 font-bold text-gray-900">
                    {formatEGP(o.total, locale)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
