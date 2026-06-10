import { Star } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { Link, redirect } from "@/i18n/navigation";
import RegisterForm from "@/components/account/RegisterForm";

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
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
        <h1 className="mb-4 text-2xl font-bold text-gray-900">{t("registerTitle")}</h1>
        <RegisterForm />
      </div>

      <p className="mt-4 text-sm text-gray-600">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-orion-link hover:underline">
          {t("signInLink")}
        </Link>
      </p>
    </div>
  );
}
