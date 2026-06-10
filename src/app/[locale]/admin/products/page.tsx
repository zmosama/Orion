import Image from "next/image";
import { Plus, Star } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";
import { categoryName, productImages, productTitle } from "@/lib/catalog";
import { formatEGP } from "@/lib/money";
import { Link } from "@/i18n/navigation";

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!(await getAdminSession())) return null;
  const t = await getTranslations("admin.products");

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1 rounded-full bg-orion-accent px-4 py-1.5 text-sm font-bold text-orion-dark transition-colors hover:bg-orion-accent-dark"
        >
          <Plus className="h-4 w-4" />
          {t("addNew")}
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-160 text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-start text-xs uppercase text-gray-600">
              <th className="p-3 text-start">{t("image")}</th>
              <th className="p-3 text-start">{t("product")}</th>
              <th className="p-3 text-start">{t("category")}</th>
              <th className="p-3 text-start">{t("price")}</th>
              <th className="p-3 text-start">{t("stock")}</th>
              <th className="p-3 text-start">{t("featured")}</th>
              <th className="p-3 text-start">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <span className="relative block h-12 w-12">
                    <Image
                      src={productImages(p)[0]}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-contain"
                    />
                  </span>
                </td>
                <td className="max-w-60 p-3">
                  <p className="line-clamp-1 font-medium text-gray-900">{productTitle(p, locale)}</p>
                  <p className="line-clamp-1 text-xs text-gray-500" dir="ltr">
                    {p.slug}
                  </p>
                </td>
                <td className="p-3 text-gray-700">{categoryName(p.category, locale)}</td>
                <td className="p-3 font-medium text-gray-900">{formatEGP(p.price, locale)}</td>
                <td className={`p-3 font-bold ${p.stock === 0 ? "text-red-700" : p.stock <= 5 ? "text-amber-700" : "text-gray-900"}`}>
                  {p.stock}
                </td>
                <td className="p-3">
                  {p.featured ? (
                    <Star className="h-4 w-4 fill-orion-accent text-orion-accent" />
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="p-3">
                  <Link href={`/admin/products/${p.id}`} className="text-orion-link hover:underline">
                    {t("edit")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
