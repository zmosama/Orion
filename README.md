# Orion ✦ أوريون

متجر إلكتروني (دروب شيبنج) بتجربة مألوفة شبيهة بأمازون وهوية خاصة — **ثنائي اللغة (إنجليزي افتراضي + عربي RTL)** ومبني للترافيك العالي.

- **Repo:** https://github.com/zmosama/Orion
- **الخطة الكاملة:** [PLAN.md](PLAN.md) — **حالة التنفيذ:** [TASKS.md](TASKS.md)

## المزايا

- 🏠 رئيسية بستايل أمازون: Hero + كروت فئات + صفوف (الأكثر مبيعاً / عروض النهارده / وصل حديثاً)
- 📦 صفحة منتج: جاليري + Buy Box + مواصفات + **منتجات مشابهة** + **جدول مقارنة**
- 🌐 i18n كامل بـ next-intl: الإنجليزي على `/` والعربي على `/ar` بمبدّل لغة في الهيدر
- 🛒 سلة client-side (localStorage) + checkout بعنوان شحن وطريقة دفع
- ⚖️ **توزيع عادل للستوك**: خصم ذرّي بشرط `stock >= qty` داخل transaction — مستحيل اتنين ياخدوا آخر قطعة (مُختبَر بطلبين متوازيين)
- ↩️ إلغاء الطلب يرجّع الستوك فوراً (محمي من الإلغاء المزدوج) + مهلة دفع 30 دقيقة للطلبات الأونلاين بعدها الستوك يتحرر تلقائياً
- 🔐 تسجيل دخول: يوزر/باسورد + Google + Facebook + Apple (بتتفعّل بمفاتيح env)
- 👤 صفحة حساب: البيانات + الموبايل + دفتر عناوين بمحافظات مصر
- 💳 دفع: COD شغّال + Paymob (Accept) جاهز بالمفاتيح — وتوصيات Fawry/Kashier/PayTabs
- ⚡ ISR للرئيسية وصفحات المنتجات + rate limiting + جاهز لـ Cloudflare

## الستاك

Next.js 16 (App Router + Turbopack) · TypeScript · Tailwind CSS v4 · Prisma 6 + SQLite (تطوير) · NextAuth v5 · next-intl v4 · zod v4

## التشغيل محلياً

```bash
npm install
cp .env.example .env        # واملا AUTH_SECRET: openssl rand -base64 32
npm run db:push             # إنشاء قاعدة البيانات
npm run db:seed             # 4 فئات × 20 منتج bilingual
npm run dev                 # http://localhost:3000
```

> مستخدم تجريبي جاهز (من اختبارات الـ QA): `test@orion.dev` / `test12345`

## مفاتيح البيئة (.env)

| المفتاح | الوصف |
|---|---|
| `DATABASE_URL` | `file:./dev.db` للتطوير — PostgreSQL للإنتاج |
| `AUTH_SECRET` | إلزامي — `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID/SECRET` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — Redirect: `https://domain.com/api/auth/callback/google` |
| `AUTH_FACEBOOK_ID/SECRET` | [Facebook Developers](https://developers.facebook.com/apps/) — Redirect: `.../api/auth/callback/facebook` |
| `AUTH_APPLE_ID/SECRET` | [Apple Developer](https://developer.apple.com/) (Service ID + مفتاح JWT) |
| `PAYMOB_API_KEY` | من [Paymob Accept](https://accept.paymob.com) → Settings → Account Info |
| `PAYMOB_INTEGRATION_ID` | Developers → Payment Integrations (Online Card / Wallet) |
| `PAYMOB_IFRAME_ID` | Developers → iframes |
| `CRON_SECRET` | حماية endpoint تحرير الحجوزات |

أزرار OAuth والدفع بالبطاقة **بتشتغل تلقائياً** أول ما المفاتيح تتحط — من غيرها COD شغّال عادي والأزرار الاجتماعية بتظهر disabled.

## بوابات الدفع في مصر — التوصية

1. **Paymob (Accept)** — الأوسع انتشاراً: كروت + محافظ (فودافون كاش/أورنج/اتصالات) + ValU. *(منفّذ في `src/lib/payments.ts`)*
2. **Fawry** — أساسي للدفع كاش بكود (متاح كمان من خلال Paymob)
3. **Kashier** — بديل حديث سهل الربط
4. **PayTabs** — لو في خطط توسع خليجي
5. **COD** — شغّال فوراً ومهم جداً للسوق المصري

## عدالة الستوك (إزاي بتشتغل)

كل اللوجيك في `src/lib/stock.ts`:

```
1) الحجز:    UPDATE products SET stock = stock - qty WHERE id = ? AND stock >= qty
             داخل transaction — لو رجعت 0 صفوف ⇒ rollback كامل ⇒ "نفد المخزون"
2) المهلة:   طلبات الدفع الأونلاين PENDING_PAYMENT لمدة 30 دقيقة (reservedUntil)
             بعدها releaseExpiredReservations() ترجّع الستوك وتعلّم الطلب EXPIRED
3) الإلغاء:  تحويل الحالة بشرط الحالة الحالية (updateMany) ⇒ مستحيل restock مرتين
```

تحرير الحجوزات بيحصل تلقائياً مع كل checkout + endpoint للـ cron:
`GET /api/cron/release-stock?key=CRON_SECRET` — اربطه بـ Cloudflare Workers Cron كل 5 دقايق.

## النشر للإنتاج (ترافيك عالي)

1. **PostgreSQL**: غيّر `provider = "postgresql"` في `prisma/schema.prisma` + حدّث `DATABASE_URL` ثم `prisma db push` — كل لوجيك الستوك شغال أحسن على Postgres (row-level locks).
2. **Cloudflare قدام الموقع**: الرئيسية وصفحات المنتجات ISR (60-120 ثانية) فبتتكاش ممتاز. فعّل Rate Limiting Rules على `/api/checkout` و `/api/register`.
3. **Build**: `npm run build && npm start` (أو Docker/PM2 على VPS).
4. الـ rate limiter الحالي in-memory (يكفي لعملية واحدة) — للتوزيع الأفقي استخدم Redis.
5. بحث الإنتاج: ضيف `mode: "insensitive"` لاستعلامات البحث بعد النقل لـ Postgres.

## بنية المشروع

```
prisma/            schema (bilingual) + seed
messages/{en,ar}/  ملفات الترجمة (common/home/pdp/account/shop)
src/
  i18n/            routing + navigation + request config
  proxy.ts         locale routing (الاسم الجديد لـ middleware في Next 16)
  auth.ts          NextAuth v5 (credentials + Google/Facebook/Apple)
  lib/             prisma, stock (العدالة), payments, money, catalog, ratelimit, constants
  components/      layout (Header/Footer) + cart + product + home + pdp + account + shop
  app/[locale]/    كل الصفحات (en بدون prefix / ar)
  app/api/         register, account, checkout, orders, cron
```
