import { Package, ChevronRight, ChevronLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { Link, redirect } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/account/ProfileForm";
import AddressBook from "@/components/account/AddressBook";

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) redirect({ href: "/login", locale });

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    include: { addresses: { orderBy: { isDefault: "desc" } } },
  });
  if (!user) redirect({ href: "/login", locale });

  const t = await getTranslations("account");
  const Chevron = locale === "ar" ? ChevronLeft : ChevronRight;

  return (
    <div className="mx-auto max-w-screen-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("title")}</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* طلباتك */}
        <Link
          href="/orders"
          className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md lg:col-span-2"
        >
          <Package className="h-10 w-10 shrink-0 text-orion-link" />
          <span className="flex-1">
            <span className="block font-bold text-gray-900">{t("ordersCard")}</span>
            <span className="block text-sm text-gray-600">{t("ordersCardHint")}</span>
          </span>
          <Chevron className="h-5 w-5 text-gray-400" />
        </Link>

        {/* بيانات الدخول */}
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-bold text-gray-900">{t("profileTitle")}</h2>
          <ProfileForm name={user!.name ?? ""} email={user!.email ?? ""} phone={user!.phone ?? ""} />
        </section>

        {/* العناوين */}
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-bold text-gray-900">{t("addressesTitle")}</h2>
          <AddressBook
            addresses={user!.addresses.map((a) => ({
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
        </section>
      </div>
    </div>
  );
}
