import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next 16: proxy.ts هو الاسم الجديد لـ middleware.ts
// بيتولى اكتشاف اللغة والـ rewrite: "/" ⇒ en (بدون prefix)، "/ar/..." ⇒ عربي
const intl = createMiddleware(routing);

export default function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const { pathname } = req.nextUrl;

  // دومين الأدمن (orionadmin.*): الجذر يوّدي على لوحة التحكم مباشرة
  if (host.startsWith("orionadmin.") && (pathname === "/" || pathname === "/ar")) {
    const target = pathname === "/ar" ? "/ar/admin" : "/admin";
    return NextResponse.redirect(new URL(target, req.url));
  }

  return intl(req);
}

export const config = {
  // كل المسارات ما عدا الـ API والملفات الداخلية والستاتيك
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
