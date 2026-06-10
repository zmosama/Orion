import Image from "next/image";
import { PackageOpen } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { Link, redirect } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { productImages } from "@/lib/catalog";
import { formatEGP } from "@/lib/money";

const STATUS_BADGE: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-green-100 text-green-800",
  PAID: "bg-green-100 text-green-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-gray-200 text-gray-700",
  EXPIRED: "bg-red-100 text-red-800",
};

export default async function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) redirect({ href: "/login", locale });

  const orders = await prisma.order.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
    take: 25,
  });

  const t = await getTranslations("orders");
  const ts = await getTranslations("orderStatus");
  const dateLocale = locale === "ar" ? "ar-EG" : "en-US";

  return (
    <div className="mx-auto max-w-screen-lg px-4 py-6">
      <h1 className="mb-5 text-2xl font-bold text-gray-900">{t("title")}</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-16 text-center">
          <PackageOpen className="h-12 w-12 text-gray-400" />
          <p className="mt-4 font-semibold text-gray-900">{t("empty")}</p>
          <Link
            href="/"
            className="mt-4 rounded-full bg-orion-accent px-6 py-2 text-sm font-bold text-orion-dark transition-colors hover:bg-orion-accent-dark"
          >
            {t("startShopping")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              {/* شريط معلومات الطلب */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-2 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
                <div>
                  <p className="font-semibold uppercase">{t("orderPlaced")}</p>
                  <p>
                    {order.createdAt.toLocaleDateString(dateLocale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="font-semibold uppercase">{t("total")}</p>
                  <p>{formatEGP(order.total, locale)}</p>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold uppercase">{t("orderId")}</p>
                  <p className="truncate" dir="ltr">
                    {order.id}
                  </p>
                </div>
                <span
                  className={`ms-auto rounded-full px-2.5 py-1 text-xs font-bold ${
                    STATUS_BADGE[order.status] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {ts(order.status)}
                </span>
              </div>

              {/* المنتجات */}
              <ul className="divide-y divide-gray-100 px-4">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-3 text-sm">
                    <span className="relative h-14 w-14 shrink-0">
                      <Image
                        src={productImages(item.product)[0]}
                        alt={locale === "ar" ? item.titleAr : item.titleEn}
                        fill
                        sizes="56px"
                        className="object-contain"
                      />
                    </span>
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="line-clamp-1 flex-1 text-gray-800 hover:text-orion-link"
                    >
                      {locale === "ar" ? item.titleAr : item.titleEn}
                    </Link>
                    <span className="text-gray-600">×{item.qty}</span>
                    <span className="font-semibold text-gray-900">
                      {formatEGP(item.price * item.qty, locale)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-100 px-4 py-3">
                <Link href={`/orders/${order.id}`} className="text-sm text-orion-link hover:underline">
                  {t("viewDetails")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
