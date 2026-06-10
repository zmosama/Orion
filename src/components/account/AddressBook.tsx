"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { GOVERNORATES } from "@/lib/constants";

export interface AddressDTO {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  line: string;
  isDefault: boolean;
}

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orion-accent focus:ring-2 focus:ring-orion-accent/40";

const emptyForm = {
  label: "",
  fullName: "",
  phone: "",
  governorate: GOVERNORATES[0].value,
  city: "",
  line: "",
  isDefault: false,
};

export default function AddressBook({ addresses }: { addresses: AddressDTO[] }) {
  const t = useTranslations("account");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const govLabel = (value: string) => {
    const gov = GOVERNORATES.find((g) => g.value === value);
    return gov ? (locale === "ar" ? gov.ar : gov.en) : value;
  };

  async function call(path: string, init: RequestInit) {
    setBusy(true);
    setError(false);
    const res = await fetch(path, init);
    setBusy(false);
    if (!res.ok) {
      setError(true);
      return false;
    }
    router.refresh();
    return true;
  }

  async function addAddress(e: React.FormEvent) {
    e.preventDefault();
    const ok = await call("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (ok) {
      setForm(emptyForm);
      setShowForm(false);
    }
  }

  return (
    <div>
      {addresses.length === 0 ? (
        <p className="text-sm text-gray-600">{t("noAddresses")}</p>
      ) : (
        <ul className="space-y-3">
          {addresses.map((a) => (
            <li key={a.id} className="rounded-md border border-gray-200 p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    {a.fullName}
                    {a.label ? <span className="ms-2 text-xs font-normal text-gray-500">({a.label})</span> : null}
                    {a.isDefault ? (
                      <span className="ms-2 rounded bg-orion-accent px-1.5 py-0.5 text-xs font-bold text-orion-dark">
                        {t("defaultBadge")}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-gray-700">{a.line}</p>
                  <p className="text-gray-700">
                    {a.city}، {govLabel(a.governorate)}
                  </p>
                  <p className="text-gray-500" dir="ltr">
                    {a.phone}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {!a.isDefault ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        call(`/api/account/addresses/${a.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ isDefault: true }),
                        })
                      }
                      className="text-xs text-orion-link hover:underline disabled:opacity-50"
                    >
                      {t("setDefault")}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (confirm(t("deleteConfirm"))) {
                        void call(`/api/account/addresses/${a.id}`, { method: "DELETE" });
                      }
                    }}
                    className="flex items-center gap-1 text-xs text-red-700 hover:underline disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {tc("delete")}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error ? <p className="mt-2 text-sm text-red-700">{tc("error")}</p> : null}

      {showForm ? (
        <form onSubmit={addAddress} className="mt-4 space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-gray-700">{t("fullName")}</span>
              <input required value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className={inputClass} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-gray-700">{t("phoneField")}</span>
              <input type="tel" required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputClass} dir="ltr" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-gray-700">{t("governorate")}</span>
              <select
                value={form.governorate}
                onChange={(e) => setForm((f) => ({ ...f, governorate: e.target.value }))}
                className={inputClass}
              >
                {GOVERNORATES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {locale === "ar" ? g.ar : g.en}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-gray-700">{t("city")}</span>
              <input required value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className={inputClass} />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-gray-700">{t("line")}</span>
            <input required value={form.line} onChange={(e) => setForm((f) => ({ ...f, line: e.target.value }))} className={inputClass} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-gray-700">{t("labelField")}</span>
            <input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} className={inputClass} />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              className="h-4 w-4 accent-orion-accent"
            />
            {t("makeDefault")}
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-orion-accent px-5 py-1.5 text-sm font-bold text-orion-dark hover:bg-orion-accent-dark disabled:opacity-60"
            >
              {tc("save")}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-gray-300 px-5 py-1.5 text-sm hover:bg-gray-100"
            >
              {tc("cancel")}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-4 flex items-center gap-1 text-sm font-medium text-orion-link hover:underline"
        >
          <Plus className="h-4 w-4" />
          {t("addAddress")}
        </button>
      )}

      <p className="mt-3 flex items-center gap-1 text-xs text-gray-400">
        <MapPin className="h-3.5 w-3.5" />
        {t("addressHint")}
      </p>
    </div>
  );
}
