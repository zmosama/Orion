import type { Product } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import ProductCard from "@/components/product/ProductCard";

/** صف منتجات أفقي بستايل أمازون — عنوان + "عرض الكل" + سكرول أفقي */
export default async function ProductRow({
  title,
  products,
  viewAllHref,
}: {
  title: string;
  products: Product[];
  viewAllHref?: string;
}) {
  const t = await getTranslations("common");
  if (products.length === 0) return null;

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-900 sm:text-xl">{title}</h2>
        {viewAllHref ? (
          <Link href={viewAllHref} className="shrink-0 text-sm text-orion-link hover:underline">
            {t("viewAll")}
          </Link>
        ) : null}
      </div>
      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-1">
        {products.map((p) => (
          <div key={p.id} className="w-52 shrink-0 sm:w-56">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
