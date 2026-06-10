"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orion-accent focus:ring-2 focus:ring-orion-accent/40";

export default function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { redirect: false, email, password });
    setLoading(false);
    if (res?.error) {
      setError(t("invalidCredentials"));
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-gray-700">{t("email")}</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          autoComplete="email"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-semibold text-gray-700">{t("password")}</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          autoComplete="current-password"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-orion-accent py-2 text-sm font-bold text-orion-dark transition-colors hover:bg-orion-accent-dark disabled:opacity-60"
      >
        {loading ? "…" : t("signInButton")}
      </button>
    </form>
  );
}
