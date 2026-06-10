import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";

export default async function AdminCustomersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!(await getAdminSession())) return null;
  const t = await getTranslations("admin.customers");
  const dateLocale = locale === "ar" ? "ar-EG" : "en-US";

  const users = await prisma.user.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>

      {users.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-600">
          {t("empty")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full min-w-140 text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-600">
                <th className="p-3 text-start">{t("name")}</th>
                <th className="p-3 text-start">{t("email")}</th>
                <th className="p-3 text-start">{t("phone")}</th>
                <th className="p-3 text-start">{t("role")}</th>
                <th className="p-3 text-start">{t("orders")}</th>
                <th className="p-3 text-start">{t("joined")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-3 text-gray-900">{u.name ?? "—"}</td>
                  <td className="p-3 text-gray-700" dir="ltr">
                    {u.email}
                  </td>
                  <td className="p-3 text-gray-700" dir="ltr">
                    {u.phone ?? "—"}
                  </td>
                  <td className="p-3">
                    {u.role === "admin" ? (
                      <span className="rounded bg-orion-accent px-1.5 py-0.5 text-xs font-bold text-orion-dark">
                        admin
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">customer</span>
                    )}
                  </td>
                  <td className="p-3 font-medium text-gray-900">{u._count.orders}</td>
                  <td className="p-3 text-gray-700">
                    {u.createdAt.toLocaleDateString(dateLocale, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
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
