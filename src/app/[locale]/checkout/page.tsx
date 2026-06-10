import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "@/components/shop/CheckoutForm";

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) redirect({ href: "/login", locale });

  const addresses = await prisma.address.findMany({
    where: { userId: session!.user.id },
    orderBy: { isDefault: "desc" },
  });

  const t = await getTranslations("checkout");

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">{t("title")}</h1>
      <CheckoutForm
        addresses={addresses.map((a) => ({
          id: a.id,
          label: a.label,
          fullName: a.fullName,
          phone: a.phone,
          governorate: a.governorate,
          city: a.city,
          line: a.line,
          isDefault: a.isDefault,
        }))}
      />
    </div>
  );
}
