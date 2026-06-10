"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

type Providers = { google: boolean; facebook: boolean; apple: boolean };

function BrandIcon({ id }: { id: "google" | "facebook" | "apple" }) {
  if (id === "google") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
        <path
          fill="#4285F4"
          d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.17 3.57-8.81Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.07 7.93-2.91l-3.87-3a7.19 7.19 0 0 1-10.8-3.78H1.27v3.1A12 12 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.26 14.3a7.18 7.18 0 0 1 0-4.6V6.6H1.27a12 12 0 0 0 0 10.8l3.99-3.1Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.97 11.97 0 0 0 1.27 6.6l3.99 3.1A7.17 7.17 0 0 1 12 4.75Z"
        />
      </svg>
    );
  }
  if (id === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#1877F2" aria-hidden>
        <path d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.93-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38A12 12 0 0 0 24 12Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M16.36 12.79c.03 3.26 2.86 4.34 2.89 4.36-.02.08-.45 1.55-1.49 3.07-.9 1.31-1.83 2.62-3.3 2.65-1.44.03-1.91-.86-3.56-.86-1.65 0-2.17.83-3.54.89-1.42.05-2.5-1.42-3.4-2.73C2.1 17.5.69 12.62 2.58 9.39a5.27 5.27 0 0 1 4.45-2.7c1.39-.03 2.7.94 3.55.94.85 0 2.44-1.16 4.12-.99.7.03 2.67.28 3.93 2.13-.1.06-2.35 1.37-2.27 4.02ZM13.66 4.87c.75-.91 1.25-2.17 1.12-3.43-1.08.04-2.38.72-3.15 1.62-.7.8-1.3 2.09-1.14 3.32 1.2.1 2.43-.61 3.17-1.51Z" />
    </svg>
  );
}

/** أزرار الدخول الاجتماعي — بتتفعّل تلقائياً لما مفاتيح الـ OAuth تتحط في .env */
export default function OAuthButtons({ providers }: { providers: Providers }) {
  const t = useTranslations("auth");
  const list = [
    { id: "google" as const, enabled: providers.google },
    { id: "facebook" as const, enabled: providers.facebook },
    { id: "apple" as const, enabled: providers.apple },
  ];
  const anyEnabled = list.some((p) => p.enabled);

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="h-px flex-1 bg-gray-200" />
        {t("orDivider")}
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="mt-3 space-y-2">
        {list.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={!p.enabled}
            onClick={() => signIn(p.id)}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BrandIcon id={p.id} />
            {t(p.id)}
          </button>
        ))}
      </div>

      {!anyEnabled ? <p className="mt-2 text-center text-xs text-gray-500">{t("oauthSoon")}</p> : null}
    </div>
  );
}
