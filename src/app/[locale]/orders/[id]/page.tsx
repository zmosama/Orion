import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { Link, redirect } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { productImages } from "@/lib/catalog";
import { formatEGP } from "@/lib/money";
import { CANCELLABLE_STATUSES, GOVERNORATES, OrderStatus, type OrderStatusType } from "@/lib/constants";
import CancelOrderButton from "@/components/shop/CancelOrderButton";

const STATUS_BADGE: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-green-100 text-green-800",
  PAID: "bg-green-100 text-green-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-gray-200 text-gray-700",
  EXPIRED: "bg-red-100 text-red-800",
};

type Props = {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ placed?: string }>;
};

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const { placed } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) redirect({ href: "/login", locale });

  const order = await prisma.order.findFirst({
    where: { id, userId: session!.user.id },
    include: { items: { include: { product: true } } },
  });
  if (!order) notFound();

  const t = await getTranslations("orders");
  const ts = await getTranslations("orderStatus");
  const tp = await getTranslations("paymentMethod");
  const dateLocale = locale === "ar" ? "ar-EG" : "en-US";

  const gov = GOVERNORATES.find((g) => g.value === order.shippingGovernorate);
  const govLabel = gov ? (locale === "ar" ? gov.ar : gov.en) : order.shippingGovernorate;

  return (
    <div className="mx-auto max-w-screen-lg space-y-4 px-4 py-6">
      {placed === "1" ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
          <CheckCircle2 className="h-6 w-6 shrink-0" />
          <p className="font-semibold">{t("successBanner")}</p>
        </div>
      ) : null}

      {order.status === OrderStatus.PENDING_PAYMENT && order.reservedUntil ? (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <Clock className="h-5 w-5 shrink-0" />
          <p>
            {t("payBefore", {
              time: order.reservedUntil.toLocaleTimeString(dateLocale, {
                hour: "2-digit",
                minute: "2-digit",
              }),
            })}
          </p>
        </div>
      ) : null}

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t("detailTitle")}</h1>
            <p className="mt-1 text-xs text-gray-500" dir="ltr">
              {order.id}
            </p>
            <p className="text-sm text-gray-600">
              {order.createdAt.toLocaleDateString(dateLocale, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              STATUS_BADGE[order.status] ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {ts(order.status)}
          </span>
        </div>

        <h2 className="mt-4 font-bold text-gray-900">{t("itemsTitle")}</h2>
        <ul className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3 text-sm">
              <span className="relative h-16 w-16 shrink-0">
                <Image
                  src={productImages(item.product)[0]}
                  alt={locale === "ar" ? item.titleAr : item.titleEn}
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </span>
              <Link
                href={`/products/${item.product.slug}`}
                className="line-clamp-2 flex-1 text-gray-800 hover:text-orion-link"
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
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
          <h3 className="mb-2 font-bold text-gray-900">{t("shippingTo")}</h3>
          <p className="font-medium text-gray-800">{order.shippingName}</p>
          <p className="text-gray-600">{order.shippingLine}</p>
          <p className="text-gray-600">
            {order.shippingCity}، {govLabel}
          </p>
          <p className="text-gray-500" dir="ltr">
            {order.shippingPhone}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
          <h3 className="mb-2 font-bold text-gray-900">{t("paymentMethod")}</h3>
          <p className="text-gray-700">{tp(order.paymentMethod)}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
          <h3 className="mb-2 font-bold text-gray-900">{t("summaryTitle")}</h3>
          <dl className="space-y-1 text-gray-700">
            <div className="flex justify-between">
              <dt>{t("itemsSubtotal")}</dt>
              <dd>{formatEGP(order.subtotal, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{t("shipping")}</dt>
              <dd className={order.shippingFee === 0 ? "font-medium text-green-700" : ""}>
                {order.shippingFee === 0 ? t("free") : formatEGP(order.shippingFee, locale)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-1 font-bold text-gray-900">
              <dt>{t("totalLabel")}</dt>
              <dd>{formatEGP(order.total, locale)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {CANCELLABLE_STATUSES.includes(order.status as OrderStatusType) ? (
        <CancelOrderButton orderId={order.id} />
      ) : null}
    </div>
  );
}
