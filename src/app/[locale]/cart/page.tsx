import { setRequestLocale } from "next-intl/server";
import CartView from "@/components/shop/CartView";

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-6">
      <CartView />
    </div>
  );
}
