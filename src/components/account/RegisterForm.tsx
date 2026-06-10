"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orion-accent focus:ring-2 focus:ring-orion-accent/40";

const KNOWN_ERRORS = ["EMAIL_EXISTS", "INVALID_INPUT", "RATE_LIMITED"] as const;
type KnownError = (typeof KNOWN_ERRORS)[number];

export default function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      const code = data?.error;
      setError(
        code && (KNOWN_ERRORS as readonly string[]).includes(code)
          ? t(`errors.${code as KnownError}`)
          : t("errors.INVALID_INPUT"),
      );
      setLoading(false);
      return;
    }

    await signIn("credentials", { redirect: false, email: form.email, password: form.password });
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-gray-700">{t("name")}</span>
        <input required minLength={2} value={form.name} onChange={set("name")} className={inputClass} autoComplete="name" />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-gray-700">{t("email")}</span>
        <input type="email" required value={form.email} onChange={set("email")} className={inputClass} autoComplete="email" />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-gray-700">{t("phone")}</span>
        <input type="tel" value={form.phone} onChange={set("phone")} className={inputClass} autoComplete="tel" dir="ltr" placeholder="+20 1xx xxx xxxx" />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-gray-700">{t("password")}</span>
        <input type="password" required minLength={8} value={form.password} onChange={set("password")} className={inputClass} autoComplete="new-password" />
        <span className="mt-1 block text-xs text-gray-500">{t("passwordHint")}</span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-orion-accent py-2 text-sm font-bold text-orion-dark transition-colors hover:bg-orion-accent-dark disabled:opacity-60"
      >
        {loading ? "…" : t("registerButton")}
      </button>
    </form>
  );
}
