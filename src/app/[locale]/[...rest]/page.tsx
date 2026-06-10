import { notFound } from "next/navigation";

/** أي مسار مش معروف تحت [locale] ⇒ صفحة 404 المترجمة */
export default function CatchAllPage() {
  notFound();
}
