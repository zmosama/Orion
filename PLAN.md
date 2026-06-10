# Orion — خطة المشروع

متجر دروب شيبنج بتجربة مألوفة شبيهة بأمازون لكن بهوية بصرية خاصة (ثيم فضائي/كوكبة الجبّار).
**ثنائي اللغة: إنجليزي (الافتراضي) + عربي، بمبدّل لغة زي أمازون.**

## 1. الرؤية والمتطلبات

- تجربة مألوفة: هيدر داكن ببحث بارز، شبكات منتجات، صفحة منتج بـ Buy Box، منتجات مشابهة (Related)، وجدول مقارنة.
- **i18n**: إنجليزي LTR هو الافتراضي على `/`، العربي RTL على `/ar/...` — مبدّل لغة في الهيدر بيحافظ على نفس الصفحة. العملة EGP في الحالتين.
- جاهز للترافيك العالي (خلف Cloudflare): ISR/caching، استعلامات خفيفة، rate limiting.
- **توزيع عادل للستوك المحدود**: مفيش اتنين ياخدوا آخر قطعة — خصم ذرّي (atomic) من المخزون وقت إنشاء الطلب.
- إلغاء الطلب أو انتهاء مهلة الدفع ⇒ **رجوع المنتج للستوك تلقائياً**.
- تسجيل دخول: Google + Facebook + Apple + يوزر/باسورد عادي.
- صفحة حساب العميل: الاسم، الإيميل، الموبايل، العناوين، الطلبات.
- بوابات دفع مصرية: Paymob (Accept) كأساس + COD، مع توثيق Fawry/Kashier/PayTabs.

## 2. الستاك

| الطبقة | الاختيار |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) — فرونت + باك + API |
| i18n | next-intl — routing بـ `/[locale]/` (en بدون prefix، ar بـ `/ar`) |
| UI | Tailwind CSS v4 + lucide-react + خط Cairo (بيدعم عربي ولاتيني) |
| DB | Prisma ORM + SQLite للتطوير (الإنتاج: PostgreSQL — تغيير provider فقط) |
| Auth | NextAuth (Auth.js v5) — JWT sessions + Prisma Adapter |
| Payments | طبقة تجريد `lib/payments.ts` — COD فعّال + Paymob جاهز بمفاتيح env |

## 3. بنية الـ i18n (إلزامي لكل الأجينتس)

- **الصفحات كلها تحت `src/app/[locale]/`**. الـ API routes برّه (`src/app/api/`).
- `src/i18n/routing.ts` — locales: `["en","ar"]`، default `en`، prefix `as-needed`.
- **الروابط والتنقل**: استورد `Link, useRouter, usePathname, redirect` من **`@/i18n/navigation`** (مش `next/link` أو `next/navigation`) عشان الـ locale يتحافظ عليه.
- كل صفحة: `const { locale } = await params;` ثم `setRequestLocale(locale);` في أول السطر (مطلوب للـ SSG/ISR).
- الترجمات: `getTranslations` (server) / `useTranslations` (client).
- **ملفات الرسائل مقسومة بالملكية** — كل أجينت يكتب في ملفاته فقط (en + ar بنفس المفاتيح):
  - `messages/{en,ar}/common.json` — Main (هيدر/فوتر/أزرار عامة/حالات الطلب)
  - `messages/{en,ar}/home.json` — Agent A (الرئيسية/الفئات/البحث)
  - `messages/{en,ar}/pdp.json` — Agent B (صفحة المنتج/المقارنة)
  - `messages/{en,ar}/account.json` — Agent C (الدخول/التسجيل/الحساب)
  - `messages/{en,ar}/shop.json` — Agent D (السلة/الدفع/الطلبات)
  - الـ namespaces الجذرية لازم تكون مميزة لكل ملف (مفيش تداخل).
- **محتوى المنتجات bilingual في الـ DB**: `titleEn/titleAr`, `descriptionEn/descriptionAr`, `specsEn/specsAr`, والفئات `nameEn/nameAr`. استخدم helpers من `src/lib/catalog.ts` (`productTitle(p, locale)` إلخ) — متعملش JSON.parse يدوي.

## 4. نظام الألوان والهوية (إلزامي لكل الأجينتس)

معرّفة كـ Tailwind theme tokens في `globals.css`:

| Token | القيمة | الاستخدام |
|---|---|---|
| `orion-dark` | `#0B1426` | الهيدر والفوتر (كحلي فضائي) |
| `orion-mid` | `#16263F` | شريط الفئات الثانوي |
| `orion-accent` | `#F5A623` | أزرار CTA (أضف للسلة) |
| `orion-accent-dark` | `#E08A00` | hover / اشترِ الآن |
| `orion-link` | `#2E7CD6` | الروابط |
| `orion-bg` | `#EAEDED` | خلفية الصفحات (رمادي فاتح) |

- الكروت بيضا بحواف خفيفة، أسعار كبيرة بالـ EGP، نجوم تقييم برتقالية.
- اللوجو: "Orion ✦" — أيقونة نجمة على الكحلي.
- استخدم `rtl:`/`ltr:` variants أو خصائص منطقية (`ms-/me-/ps-/pe-/start-/end-`) بدل `ml-/mr-` عشان الاتجاهين يشتغلوا صح.

## 5. قاعدة البيانات (Prisma)

- `User` (+ `Account/Session` لـ NextAuth، `passwordHash`، `phone`)
- `Address` (مرتبط بالمستخدم، محافظة/مدينة/عنوان/موبايل، isDefault)
- `Category` (slug، `nameEn/nameAr`، صورة)
- `Product` (slug، `titleEn/titleAr`، براند، `descriptionEn/descriptionAr`، `price`/`listPrice` Int بالجنيه، `images` JSON، `specsEn/specsAr` JSON للمقارنة، `stock`، rating/reviewCount، featured)
- `Order` (status، paymentMethod، إجماليات، بيانات شحن snapshot، `reservedUntil`)
- `OrderItem` (snapshot `titleEn/titleAr` والسعر + qty)

حالات الطلب (نصوص — SQLite مفيش enum): `PENDING_PAYMENT | CONFIRMED | PAID | SHIPPED | DELIVERED | CANCELLED | EXPIRED` — الثوابت في `lib/constants.ts`، التسميات المعروضة من `orderStatus.*` في `common.json`.

## 6. عدالة الستوك (القلب التقني)

كل اللوجيك في `src/lib/stock.ts`:

1. **الحجز**: داخل transaction — `updateMany({ where: { id, stock: { gte: qty } }, data: { stock: { decrement: qty } } })`. لو `count === 0` ⇒ المنتج خلص ⇒ rollback كامل. ده atomic حتى تحت تزاحم عالي — مستحيل اتنين ياخدوا آخر قطعة.
2. **مهلة الدفع**: الطلبات أونلاين `PENDING_PAYMENT` بـ `reservedUntil = now + 30 دقيقة`. `releaseExpiredReservations()` بترجّع الستوك وتعلّم الطلب `EXPIRED` — بتتنادى مع كل checkout + `/api/cron/release-stock` (Cloudflare Cron).
3. **الإلغاء**: تحويل الحالة بشرط (`updateMany` على status الحالية) عشان يستحيل restock مرتين، وبعدها increment للستوك في نفس الـ transaction.

## 7. الصفحات (كلها تحت `src/app/[locale]/`)

| المسار | الوصف |
|---|---|
| `/` | Hero + شبكة فئات + صفوف منتجات (الأكثر مبيعاً / وصل حديثاً / عروض) |
| `/category/[slug]` | شبكة منتجات الفئة + فرز |
| `/search?q=` | نتائج البحث |
| `/products/[slug]` | جاليري + تفاصيل + Buy Box + منتجات مشابهة + **جدول مقارنة** |
| `/cart` | السلة (client-side localStorage + CartProvider) |
| `/checkout` | عنوان الشحن + طريقة الدفع ⇒ `/api/checkout` |
| `/orders` + `/orders/[id]` | الطلبات + تفاصيل + زر إلغاء |
| `/login` , `/register` | دخول/تسجيل (Google/Facebook/Apple + credentials) |
| `/account` | بيانات العميل + تعديل الموبايل + العناوين |

## 8. الـ APIs (برّه `[locale]`)

- `/api/auth/[...nextauth]` — NextAuth
- `POST /api/register` — تسجيل جديد (bcrypt)
- `PATCH /api/account/profile` ، `POST/DELETE /api/account/addresses`
- `POST /api/checkout` — تحقق + حجز ذرّي + إنشاء طلب
- `POST /api/orders/[id]/cancel` — إلغاء + restock
- `GET /api/cron/release-stock` — تحرير الحجوزات المنتهية

## 9. الأداء والترافيك العالي

- الرئيسية وصفحات المنتجات: **ISR** (`export const revalidate = 60..300`) + `setRequestLocale` — Cloudflare هيكاش الـ HTML للغتين (URLs مختلفة). الستوك الحقيقي بيتحسم وقت الـ checkout مش وقت العرض.
- Rate limiting بسيط in-memory على checkout/register (`lib/ratelimit.ts`) + توصية Cloudflare rules.
- الإنتاج: PostgreSQL + Redis للـ rate limit الموزّع (موثّق في README).

## 10. بوابات الدفع في مصر (التوصية)

1. **Paymob (Accept)** — الأوسع: كروت + محافظ (فودافون كاش/أورنج/اتصالات) + ValU + أقساط. الـ integration الأساسي.
2. **Fawry** — مهم جداً للدفع الكاش بكود فوري (متاح أيضاً عبر Paymob).
3. **Kashier** — بديل حديث سهل الربط، كروت + محافظ.
4. **PayTabs** — لو في خطط توسع خليجي.
5. **COD (الدفع عند الاستلام)** — إلزامي في السوق المصري، شغّال فوراً من غير مفاتيح.

`lib/payments.ts` فيها interface موحد — COD منفّذ، وPaymob جاهز يتفعّل بمفاتيح `.env`.

## 11. تقسيم الشغل على الأجينتس

| Agent | النطاق | الملفات |
|---|---|---|
| **Main (أنا)** | الأساس: scaffold، i18n setup، Prisma schema+seed، lib، layout+Header+Footer، CartProvider، ProductCard، theme | `prisma/*`, `src/lib/*`, `src/auth.ts`, `src/i18n/*`, `src/middleware.ts`, `src/app/[locale]/layout.tsx`, `globals.css`, `src/components/{layout,cart,product}/*`, `messages/{en,ar}/common.json` |
| **Agent A** | الرئيسية والتصفح | `src/app/[locale]/page.tsx`, `category/[slug]/`, `search/`, `src/components/home/*`, `messages/{en,ar}/home.json` |
| **Agent B** | صفحة المنتج + مقارنة + related | `src/app/[locale]/products/[slug]/`, `src/components/pdp/*`, `messages/{en,ar}/pdp.json` |
| **Agent C** | Auth UI + حساب العميل | `src/app/[locale]/{login,register,account}/`, `src/components/account/*`, `src/app/api/{register,account}/*`, `messages/{en,ar}/account.json` |
| **Agent D** | السلة والدفع والطلبات | `src/app/[locale]/{cart,checkout,orders}/`, `src/app/api/{checkout,orders,cron}/*`, `messages/{en,ar}/shop.json` |

**قواعد التنسيق**: كل أجينت يلتزم بملفاته فقط، ميشغّلش install/build/dev، يستخدم المكونات والـ lib المشتركة، Next 16 (`await params`/`await searchParams`)، روابط من `@/i18n/navigation`، نصوص UI كلها من ملفات الرسائل (مفيش نصوص hardcoded) بالنسختين en+ar.

## 12. مستقبلاً (خارج النطاق الحالي)

- ربط Paymob فعلي بمفاتيح حقيقية + webhooks
- مراجعات العملاء (CRUD) — حالياً rating/reviewCount seeded
- إيميلات تأكيد الطلبات + كوبونات خصم
- نقل الإنتاج لـ PostgreSQL + Redis
- لغات إضافية (الهيكل جاهز — مجرد ملفات رسائل جديدة)

## 13. الرؤية المستقبلية: التحويل لـ SaaS Multi-Tenant

> قرار محمد (2026-06-10): بعد اكتمال Orion كمنتج، يتحول لمنصة متاجر —
> أي حد محتاج متجر ياخد نسخة من نفس الموديل، بعزل كامل للبيانات وهوية مختلفة لكل متجر.

**المعمارية المستهدفة** (كود واحد + داتابيز واحدة، مش نسخة لكل عميل):

1. **جدول `Store`**: الاسم، الدومين/الساب-دومين، اللوجو، ألوان الثيم، محتوى Hero/Footer، مفاتيح Paymob الخاصة بكل تاجر (مشفّرة)، الباقة والحالة.
2. **`storeId` على كل الجداول** — المنتجات والفئات والطلبات والعملاء ملك كل متجر.
3. **العزل بطبقتين**: Prisma Client Extension بيحقن `where storeId` تلقائياً في كل استعلام + Row-Level Security في PostgreSQL — حتى لو الكود فيه غلطة، الداتابيز بترفض التسرب.
4. **التوجيه بالدومين**: `proxy.ts` يحل الـ host ⇒ المتجر (نفس آلية orionadmin الحالية موسّعة) + **Cloudflare for SaaS** لدومينات العملاء المخصصة بـ SSL تلقائي.
5. **الهوية المختلفة لكل متجر**: ألوان الثيم CSS variables من الـ DB (المعمارية الحالية جاهزة لده) + لوجو وخط ومحتوى لكل متجر، ولاحقاً 2-3 قوالب layout يختار منها التاجر.
6. **لوحة Super Admin** لإدارة المتاجر والباقات والاشتراكات (Paymob recurring).
7. **التخزين**: صور كل متجر على R2 بـ prefix منفصل.

**⚠️ قاعدة سارية من دلوقتي:** أي كود جديد في Orion يتكتب tenant-aware — مفيش hardcoding لاسم المتجر أو هويته جوه المكونات، كل حاجة من الإعدادات/الـ DB.
