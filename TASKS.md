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

### Agent C — الحسابات والعملاء ✅ (نفّذها Main بعد حد الاستخدام)
- [x] `src/app/[locale]/login/page.tsx` — credentials + أزرار Google/Facebook/Apple (بتتفعّل تلقائياً بمفاتيح .env، disabled مع ملاحظة لو مش متظبطة)
- [x] `src/app/[locale]/register/page.tsx` + `POST /api/register` (zod + bcrypt + rate limit + auto sign-in)
- [x] `src/app/[locale]/account/page.tsx` — كارت الطلبات + بيانات الدخول (الاسم/الموبايل) + دفتر العناوين
- [x] `PATCH /api/account/profile` + `POST /api/account/addresses` + `PATCH/DELETE /api/account/addresses/[id]` (كله auth-scoped + أول عنوان بيبقى افتراضي)
- [x] `src/components/account/` (LoginForm, OAuthButtons بأيقونات Google/FB/Apple, RegisterForm, ProfileForm, AddressBook) + `messages/{en,ar}/account.json`

### Agent D — السلة والدفع والطلبات ✅ (نفّذها Main بعد حد الاستخدام)
- [x] `src/app/[locale]/cart/page.tsx` — سلة كاملة بكميات وحذف وملخص وشحن مجاني فوق 1000
- [x] `src/app/[locale]/checkout/page.tsx` — عناوين محفوظة + عنوان جديد + COD/Paymob + مراجعة وإجماليات
- [x] `POST /api/checkout` — حجز ذرّي عبر `lib/stock` + rate limit + إلغاء تلقائي لو فشلت تهيئة الدفع
- [x] `src/app/[locale]/orders/page.tsx` + `orders/[id]/page.tsx` + زر إلغاء + بانر نجاح + تنبيه مهلة الدفع
- [x] `POST /api/orders/[id]/cancel` + `GET /api/cron/release-stock` (محمي بـ CRON_SECRET)
- [x] `messages/{en,ar}/shop.json` + `src/components/shop/` (CartView, CheckoutForm, CancelOrderButton)

## Phase 3 — Integration & QA (Main) ✅
- [x] `npm run build` ناجح بدون أخطاء TypeScript (كل الـ routes)
- [x] **اختبار التزاحم نجح**: ستوك = 1 + طلبين متوازيين ⇒ واحد CONFIRMED والتاني 409 OUT_OF_STOCK، الستوك النهائي 0 وأوردر واحد بس
- [x] **اختبار الإلغاء نجح**: إلغاء ⇒ الستوك رجع 1 والحالة CANCELLED، وإلغاء تاني ⇒ 400 NOT_CANCELLABLE (مفيش restock مزدوج)
- [x] اختبار API: تسجيل → دخول credentials → session بـ user.id ✅
- [x] smoke test للصفحات باللغتين: الرئيسية + المنتج (مقارنة وBuy Now) + الفئة + البحث + الدخول ✅
- [x] README.md نهائي (تشغيل + مفاتيح OAuth/Paymob + عدالة الستوك + نشر)
- [x] مستخدم تجريبي: test@orion.dev / test12345

## Phase 4 — لوحة الأدمن ✅ (2026-06-10)
- [x] عمود `role` في User (customer | admin) + تمريره في JWT/session
- [x] `scripts/create-admin.ts` — إنشاء/تحديث أدمن من الترمينال + أدمن فعلي اتعمل (admin@orion.shop)
- [x] `/admin` (تحت [locale]): Dashboard (إحصائيات + ستوك منخفض + أحدث طلبات) + المنتجات (إضافة/تعديل/حذف bilingual) + الطلبات (تغيير الحالة، والإلغاء بيرجّع الستوك) + العملاء
- [x] APIs محمية بـ `getAdminSession()`: `/api/admin/products` + `[id]` + `/api/admin/orders/[id]`
- [x] `proxy.ts`: دومين `orionadmin.*` بيوجّه الجذر لـ `/admin` مباشرة
- [x] 🔒 سد تسريب RSC payload: حارس أدمن جوه كل صفحة (مش الـ layout بس) — متأكد بالاختبار
- [x] اختبارات: أدمن يدخل ويشوف الداشبورد (EN+AR) / عميل عادي Access denied من غير داتا / عميل على API أدمن ⇒ 403 / إنشاء وحذف منتج من API الأدمن ✓
- [x] إيقاف تعريض Prisma Studio على التانل (الأدمن الجديد بديله)

## Roadmap — إكمال Orion (قرار محمد 2026-06-10: نكمّل المنتج الأول، والـ SaaS بعدين)

### Phase 5 — اكتمال المتجر
- [ ] Paymob فعلي: مفاتيح حقيقية + webhook تأكيد الدفع (`markOrderPaid` جاهزة في lib/stock)
- [ ] مفاتيح OAuth حقيقية (Google / Facebook / Apple)
- [ ] منتجات وصور حقيقية بدل الـ seed (تخزين الصور على Cloudflare R2)
- [ ] إيميلات الطلبات (تأكيد / شحن / إلغاء)
- [ ] مراجعات العملاء (تقييم + تعليق بعد الاستلام)
- [ ] كوبونات خصم
- [ ] جدولة cron فعلية لتحرير الحجوزات (Cloudflare Worker Cron ⇒ `/api/cron/release-stock`)
- [ ] تشغيل تلقائي للسيرفر على الجهاز (launchd) أو النقل لـ VPS (دروبليت 2vCPU/4GB فرانكفورت + PostgreSQL)

### Phase 6 — التحويل لـ SaaS multi-tenant (بعد اكتمال المنتج)
- [ ] جدول Store + `storeId` على كل الجداول + Prisma Client Extension للفلترة التلقائية + Postgres RLS
- [ ] توجيه بالدومين (proxy.ts) + Cloudflare for SaaS للدومينات المخصصة
- [ ] ثيم لكل متجر من الـ DB (ألوان/لوجو/محتوى — الـ CSS vars جاهزة لده)
- [ ] لوحة Super Admin (إنشاء متاجر، باقات، اشتراكات)
- ⚠️ **قاعدة من دلوقتي:** أي كود جديد يتكتب tenant-aware — مفيش hardcoding لهوية المتجر جوه المكونات
