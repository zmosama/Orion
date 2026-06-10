"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { OrderStatus } from "@/lib/constants";

const SELECTABLE = [
  OrderStatus.CONFIRMED,
  OrderStatus.PAID,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
] as const;

export default function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const ts = useTranslations("orderStatus");
  const t = useTranslations("admin.orders");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  // الحالات النهائية مفيش رجوع منها (كان هيحتاج خصم ستوك تاني)
  if (status === OrderStatus.CANCELLED || status === OrderStatus.EXPIRED) {
    return <span className="text-xs font-bold text-gray-500">{ts(status)}</span>;
  }

  async function onChange(next: string) {
    setBusy(true);
    setError(false);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      setError(true);
    }
    setBusy(false);
  }

  const options: string[] = SELECTABLE.includes(status as (typeof SELECTABLE)[number])
    ? [...SELECTABLE]
    : [status, ...SELECTABLE];

  return (
    <div>
      <select
        value={status}
        disabled={busy}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:border-orion-accent disabled:opacity-50"
      >
        {options.map((s) => (
          <option key={s} value={s}>
            {ts(s)}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-xs text-red-700">{t("updateFailed")}</p> : null}
    </div>
  );
}
