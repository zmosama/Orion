import { Star } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth, enabledOAuthProviders } from "@/auth";
import { Link, redirect } from "@/i18n/navigation";
import LoginForm from "@/components/account/LoginForm";
import OAuthButtons from "@/components/account/OAuthButtons";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (session?.user) redirect({ href: "/account", locale });

  const t = await getTranslations("auth");

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center px-4 py-10">
      <Link href="/" className="mb-6 flex items-center gap-1">
        <Star className="h-7 w-7 fill-orion-accent text-orion-accent" />
        <span className="text-3xl font-bold text-orion-dark">Orion</span>
      </Link>

      <div className="w-full rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">{t("signInTitle")}</h1>
        <LoginForm />
        <OAuthButtons providers={enabledOAuthProviders} />
      </div>

      <div className="my-4 flex w-full items-center gap-3 text-xs text-gray-500">
        <span className="h-px flex-1 bg-gray-300" />
        {t("newToOrion")}
        <span className="h-px flex-1 bg-gray-300" />
      </div>

      <Link
        href="/register"
        className="w-full rounded-full border border-gray-300 bg-white py-2 text-center text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50"
      >
        {t("createAccount")}
      </Link>
    </div>
  );
}
