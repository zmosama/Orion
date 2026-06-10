import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next 16: proxy.ts هو الاسم الجديد لـ middleware.ts
// بيتولى اكتشاف اللغة والـ rewrite: "/" ⇒ en (بدون prefix)، "/ar/..." ⇒ عربي
export default createMiddleware(routing);

export const config = {
  // كل المسارات ما عدا الـ API والملفات الداخلية والستاتيك
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
