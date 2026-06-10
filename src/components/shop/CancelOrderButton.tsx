"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const t = useTranslations("orders");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCancel() {
    if (!confirm(t("cancelConfirm"))) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
    if (res.ok) {
      router.refresh();
    } else {
      setError(t("cancelFailed"));
    }
    setBusy(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={onCancel}
        disabled={busy}
        className="rounded-full border border-red-300 px-5 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
      >
        {t("cancelOrder")}
      </button>
      <p className="mt-1 text-xs text-gray-500">{t("cancelNote")}</p>
      {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
