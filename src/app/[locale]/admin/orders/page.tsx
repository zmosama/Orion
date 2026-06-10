import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";
import { formatEGP } from "@/lib/money";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

export default async function AdminOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!(await getAdminSession())) return null;
  const t = await getTranslations("admin.orders");
  const tp = await getTranslations("paymentMethod");
  const dateLocale = locale === "ar" ? "ar-EG" : "en-US";

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { qty: true } },
    },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
      <p className="text-sm text-gray-600">{t("restockNote")}</p>

      {orders.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-600">
          {t("empty")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full min-w-160 text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-600">
                <th className="p-3 text-start">{t("order")}</th>
                <th className="p-3 text-start">{t("date")}</th>
                <th className="p-3 text-start">{t("customer")}</th>
                <th className="p-3 text-start">{t("items")}</th>
                <th className="p-3 text-start">{t("total")}</th>
                <th className="p-3 text-start">{t("payment")}</th>
                <th className="p-3 text-start">{t("status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="max-w-28 truncate p-3 text-xs text-gray-500" dir="ltr">
                    {o.id}
                  </td>
                  <td className="p-3 text-gray-700">
                    {o.createdAt.toLocaleDateString(dateLocale, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="max-w-44 p-3">
                    <p className="line-clamp-1 text-gray-900">{o.user.name ?? "—"}</p>
                    <p className="line-clamp-1 text-xs text-gray-500" dir="ltr">
                      {o.user.email}
                    </p>
                  </td>
                  <td className="p-3 text-gray-700">
                    {o.items.reduce((sum, i) => sum + i.qty, 0)}
                  </td>
                  <td className="p-3 font-bold text-gray-900">{formatEGP(o.total, locale)}</td>
                  <td className="p-3 text-xs text-gray-700">{tp(o.paymentMethod)}</td>
                  <td className="p-3">
                    <OrderStatusSelect orderId={o.id} status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
