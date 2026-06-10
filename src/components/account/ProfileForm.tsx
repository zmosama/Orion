"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orion-accent focus:ring-2 focus:ring-orion-accent/40";

export default function ProfileForm({
  name,
  email,
  phone,
}: {
  name: string;
  email: string;
  phone: string;
}) {
  const t = useTranslations("account");
  const tc = useTranslations("common");
  const router = useRouter();
  const [form, setForm] = useState({ name, phone });
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setState("saved");
      router.refresh();
      setTimeout(() => setState("idle"), 2000);
    } else {
      setState("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-gray-700">{t("emailLabel")}</span>
        <input value={email} disabled className={`${inputClass} bg-gray-100 text-gray-500`} dir="ltr" />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-gray-700">{t("nameLabel")}</span>
        <input
          required
          minLength={2}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={inputClass}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-gray-700">{t("phoneLabel")}</span>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className={inputClass}
          dir="ltr"
          placeholder="+20 1xx xxx xxxx"
        />
      </label>

      {state === "error" ? <p className="text-sm text-red-700">{tc("error")}</p> : null}

      <button
        type="submit"
        disabled={state === "saving"}
        className="rounded-full bg-orion-accent px-6 py-2 text-sm font-bold text-orion-dark transition-colors hover:bg-orion-accent-dark disabled:opacity-60"
      >
        {state === "saved" ? t("saved") : tc("save")}
      </button>
    </form>
  );
}
