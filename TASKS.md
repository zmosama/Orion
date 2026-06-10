# Orion — Task List

> بتتحدث أول بأول مع كل إنجاز. ✅ = خلصت | 🔄 = شغالة | ⬜ = لسه

## Phase 0 — Scaffold (Main) ✅
- [x] إنشاء مشروع Next.js 16 + TypeScript + Tailwind v4 + App Router (`src/`)
- [x] تثبيت الاعتمادات: Prisma، NextAuth v5، bcryptjs، lucide-react، zod، tsx، **next-intl**
- [x] PLAN.md + TASKS.md
- [x] ⚡ تعديل من محمد: الموقع ثنائي اللغة (EN default + AR) — الخطة اتحدثت

## Phase 1 — Foundation (Main) ✅
- [x] `prisma/schema.prisma` — كل الموديلات (bilingual: titleEn/titleAr إلخ)
- [x] `src/lib/prisma.ts` — singleton client
- [x] `src/lib/constants.ts` — حالات الطلب + ثوابت + محافظات bilingual
- [x] `src/lib/money.ts` — تنسيق EGP حسب اللغة
- [x] `src/lib/stock.ts` — الحجز الذرّي + الإلغاء + تحرير الحجوزات المنتهية
- [x] `src/lib/payments.ts` — تجريد بوابات الدفع (COD + Paymob)
- [x] `src/lib/ratelimit.ts` — rate limiting بسيط
- [x] `src/auth.ts` + `/api/auth/[...nextauth]` — NextAuth v5 (Google/Facebook/Apple/Credentials)
- [x] `src/lib/catalog.ts` — helpers للمحتوى bilingual
- [x] i18n: `src/i18n/{routing,navigation,request}.ts` + **`src/proxy.ts`** (Next 16 غيّر اسم middleware) + `next.config.ts`
- [x] `messages/{en,ar}/common.json` + ملفات placeholder للأجينتس
- [x] `globals.css` — ثيم Orion + خط Cairo
- [x] `src/app/[locale]/layout.tsx` — html/dir حسب اللغة + Header + Footer + Providers
- [x] `src/components/layout/` — Header, SearchBar, AccountMenu, CartButton, LanguageSwitcher, Footer
- [x] `src/components/cart/CartProvider.tsx` — سلة client-side (localStorage)
- [x] `src/components/product/` — ProductCard, RatingStars, AddToCartButton
- [x] `prisma/seed.ts` — 4 فئات × 20 منتج bilingual + صور + specs للمقارنة
- [x] `.env` + `.env.example`
- [x] `prisma db push` + seed ناجح (4 فئات/20 منتج) + build ناجح + smoke test للغتين ناجح
- [x] ⚠️ Prisma 7 فيها breaking changes — نزّلنا لـ Prisma 6.19 المستقرة
- [x] رفع الكود على GitHub: https://github.com/zmosama/Orion

## Phase 2 — Agents (بالتوازي)

### Agent A — الرئيسية والتصفح ✅
> الأجينتس اصطدموا بحد الاستخدام (session limit بيتجدد 8:10 صباحاً) — Main كمّل الشغل inline.
- [x] `src/app/[locale]/page.tsx` — Hero + فئات + صفوف منتجات (ISR 60s، SSG للغتين)
- [x] `src/app/[locale]/category/[slug]/page.tsx` — شبكة منتجات + فرز (الأحدث/السعر/التقييم)
- [x] `src/app/[locale]/search/page.tsx` — نتائج بحث (titleEn/titleAr/description/brand)
- [x] `src/components/home/*` (HeroBanner + CategoryCardGrid من Agent A قبل القطع، ProductRow + SortSelect من Main) + `messages/{en,ar}/home.json`

### Agent B — صفحة المنتج ✅ (نفّذها Main بعد حد الاستخدام)
- [x] `src/app/[locale]/products/[slug]/page.tsx` — breadcrumb + جاليري + تفاصيل + Buy Box (ISR 120s)
- [x] منتجات مشابهة (Related) من نفس الفئة — صف أفقي
- [x] جدول مقارنة مع 3 منتجات مشابهة (specs bilingual + "المنتج ده" highlighted)
- [x] `src/components/pdp/` (Gallery + BuyBox مع Buy Now + CompareTable) + `messages/{en,ar}/pdp.json`

### Agent C — الحسابات والعملاء
- [ ] `src/app/[locale]/login/page.tsx` — credentials + أزرار Google/Facebook/Apple
- [ ] `src/app/[locale]/register/page.tsx` + `POST /api/register`
- [ ] `src/app/[locale]/account/page.tsx` — البيانات + الموبايل + العناوين
- [ ] `PATCH /api/account/profile` + `POST/DELETE /api/account/addresses`
- [ ] `src/components/account/*` + `messages/{en,ar}/account.json`

### Agent D — السلة والدفع والطلبات
- [ ] `src/app/[locale]/cart/page.tsx`
- [ ] `src/app/[locale]/checkout/page.tsx` — عنوان + طريقة دفع (COD/Paymob)
- [ ] `POST /api/checkout` — حجز ذرّي عبر `lib/stock`
- [ ] `src/app/[locale]/orders/page.tsx` + `orders/[id]/page.tsx` + زر إلغاء
- [ ] `POST /api/orders/[id]/cancel` + `GET /api/cron/release-stock`
- [ ] `messages/{en,ar}/shop.json`

## Phase 3 — Integration & QA (Main)
- [ ] مراجعة تكامل شغل الأجينتس + حل التعارضات
- [ ] `npm run build` ناجح بدون أخطاء TypeScript
- [ ] اختبار يدوي: تصفح → سلة → checkout → إلغاء → رجوع الستوك (باللغتين)
- [ ] اختبار التزاحم: طلبين متوازيين على آخر قطعة ⇒ واحد بس ينجح
- [ ] README.md نهائي (تشغيل + مفاتيح OAuth/Paymob + نشر)
