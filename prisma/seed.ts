import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** صور placeholder من picsum — استبدلها بصور المنتجات الحقيقية لاحقاً */
const imgs = (seed: string, count = 3) =>
  JSON.stringify(
    Array.from({ length: count }, (_, i) => `https://picsum.photos/seed/${seed}-${i + 1}/600/600`),
  );

const j = (o: Record<string, string>) => JSON.stringify(o);

const categories = [
  { slug: "electronics", nameEn: "Electronics", nameAr: "إلكترونيات", image: "https://picsum.photos/seed/cat-electronics/400/300" },
  { slug: "home-kitchen", nameEn: "Home & Kitchen", nameAr: "المنزل والمطبخ", image: "https://picsum.photos/seed/cat-home/400/300" },
  { slug: "fashion", nameEn: "Fashion", nameAr: "الموضة", image: "https://picsum.photos/seed/cat-fashion/400/300" },
  { slug: "sports-fitness", nameEn: "Sports & Fitness", nameAr: "الرياضة واللياقة", image: "https://picsum.photos/seed/cat-sports/400/300" },
];

type SeedProduct = {
  slug: string;
  titleEn: string;
  titleAr: string;
  brand: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  listPrice: number;
  specsEn: Record<string, string>;
  specsAr: Record<string, string>;
  stock: number;
  rating: number;
  reviewCount: number;
  featured?: boolean;
};

const products: Record<string, SeedProduct[]> = {
  electronics: [
    {
      slug: "aurora-wireless-earbuds-pro",
      titleEn: "Aurora Wireless Earbuds Pro with Active Noise Cancellation",
      titleAr: "سماعات أورورا اللاسلكية برو بخاصية عزل الضوضاء النشط",
      brand: "Aurora",
      descriptionEn:
        "Immerse yourself in pure sound with Aurora Pro earbuds. Active noise cancellation, deep bass, crystal-clear calls and up to 30 hours of battery with the charging case.",
      descriptionAr:
        "استمتع بصوت نقي مع سماعات أورورا برو. عزل ضوضاء نشط، باص عميق، مكالمات واضحة تماماً وبطارية تدوم حتى ٣٠ ساعة مع علبة الشحن.",
      price: 1299,
      listPrice: 1799,
      specsEn: { Battery: "30 hours with case", Bluetooth: "5.3", "Noise Cancellation": "Active (ANC)", "Water Resistance": "IPX5", Warranty: "1 year" },
      specsAr: { "البطارية": "٣٠ ساعة مع العلبة", "البلوتوث": "5.3", "عزل الضوضاء": "نشط (ANC)", "مقاومة المياه": "IPX5", "الضمان": "سنة" },
      stock: 25,
      rating: 4.6,
      reviewCount: 312,
      featured: true,
    },
    {
      slug: "orbit-smart-watch",
      titleEn: "Orbit Smart Watch with AMOLED Display & GPS",
      titleAr: "ساعة أوربت الذكية بشاشة AMOLED وGPS مدمج",
      brand: "Orbit",
      descriptionEn:
        "Track your health and stay connected with the Orbit smart watch. 1.43\" AMOLED display, built-in GPS, heart-rate and sleep tracking, and a battery that lasts up to 10 days.",
      descriptionAr:
        "تابع صحتك وخلّيك متواصل مع ساعة أوربت الذكية. شاشة AMOLED مقاس ١٫٤٣ بوصة، GPS مدمج، تتبع نبض القلب والنوم، وبطارية تعيش لحد ١٠ أيام.",
      price: 1899,
      listPrice: 2499,
      specsEn: { Display: '1.43" AMOLED', Battery: "10 days", "Water Resistance": "5 ATM", GPS: "Built-in", Warranty: "1 year" },
      specsAr: { "الشاشة": "AMOLED ١٫٤٣ بوصة", "البطارية": "١٠ أيام", "مقاومة المياه": "5 ATM", "GPS": "مدمج", "الضمان": "سنة" },
      stock: 18,
      rating: 4.4,
      reviewCount: 208,
      featured: true,
    },
    {
      slug: "nova-power-bank-20000",
      titleEn: "Nova Power Bank 20,000mAh with 22.5W Fast Charging",
      titleAr: "باور بانك نوفا ٢٠٠٠٠ مللي أمبير بشحن سريع ٢٢٫٥ وات",
      brand: "Nova",
      descriptionEn:
        "Never run out of power. The Nova 20,000mAh power bank charges your phone up to 4 times, with 22.5W PD fast charging and dual USB output for charging two devices at once.",
      descriptionAr:
        "عمرك ما هتقلق من فصل الشحن. باور بانك نوفا ٢٠٠٠٠ مللي أمبير بيشحن موبايلك لحد ٤ مرات، بشحن سريع ٢٢٫٥ وات ومخرجين USB لشحن جهازين مع بعض.",
      price: 749,
      listPrice: 999,
      specsEn: { Capacity: "20,000mAh", "Fast Charging": "22.5W PD", Ports: "2× USB-A + USB-C", Weight: "380g", Warranty: "1 year" },
      specsAr: { "السعة": "٢٠٠٠٠ مللي أمبير", "الشحن السريع": "٢٢٫٥ وات PD", "المنافذ": "2× USB-A + USB-C", "الوزن": "٣٨٠ جرام", "الضمان": "سنة" },
      stock: 40,
      rating: 4.7,
      reviewCount: 540,
    },
    {
      slug: "pulse-bluetooth-speaker",
      titleEn: "Pulse Portable Bluetooth Speaker 20W — IPX7 Waterproof",
      titleAr: "مكبر صوت بالس المحمول ٢٠ وات — مقاوم للمياه IPX7",
      brand: "Pulse",
      descriptionEn:
        "Big sound in a compact body. 20W of punchy audio, IPX7 waterproofing for the beach or pool, and 12 hours of playtime on a single charge.",
      descriptionAr:
        "صوت ضخم في حجم صغير. قوة ٢٠ وات، مقاومة مياه IPX7 تنفع للبحر وحمام السباحة، و١٢ ساعة تشغيل بشحنة واحدة.",
      price: 899,
      listPrice: 1199,
      specsEn: { Power: "20W", Battery: "12 hours", "Water Resistance": "IPX7", Bluetooth: "5.0", Warranty: "1 year" },
      specsAr: { "القدرة": "٢٠ وات", "البطارية": "١٢ ساعة", "مقاومة المياه": "IPX7", "البلوتوث": "5.0", "الضمان": "سنة" },
      stock: 3,
      rating: 4.5,
      reviewCount: 187,
    },
    {
      slug: "guard-wifi-camera-2k",
      titleEn: "Guard WiFi Security Camera 2K with Night Vision",
      titleAr: "كاميرا مراقبة جارد واي فاي 2K برؤية ليلية",
      brand: "Guard",
      descriptionEn:
        "Keep an eye on what matters. Crisp 2K video, 10m night vision, motion alerts to your phone, and storage on SD card or the cloud.",
      descriptionAr:
        "خلّي عينك على اللي يهمك. فيديو 2K واضح، رؤية ليلية ١٠ متر، تنبيهات حركة على موبايلك، وتخزين على كارت SD أو السحابة.",
      price: 1099,
      listPrice: 1399,
      specsEn: { Resolution: "2K QHD", "Night Vision": "10m", Storage: "SD card + Cloud", "Motion Detection": "Yes", Warranty: "1 year" },
      specsAr: { "الدقة": "2K QHD", "الرؤية الليلية": "١٠ متر", "التخزين": "كارت SD + سحابة", "استشعار الحركة": "نعم", "الضمان": "سنة" },
      stock: 22,
      rating: 4.3,
      reviewCount: 95,
    },
  ],
  "home-kitchen": [
    {
      slug: "crispo-air-fryer-55l",
      titleEn: "Crispo Digital Air Fryer 5.5L — 8 Programs",
      titleAr: "قلاية كريسبو الهوائية الديجيتال ٥٫٥ لتر — ٨ برامج",
      brand: "Crispo",
      descriptionEn:
        "Crispy results with little to no oil. 5.5L family-size basket, 8 one-touch programs, digital touch screen and easy-clean non-stick basket.",
      descriptionAr:
        "قرمشة من غير زيت تقريباً. سعة عائلية ٥٫٥ لتر، ٨ برامج بلمسة واحدة، شاشة ديجيتال تاتش وسلة تيفال سهلة التنظيف.",
      price: 2499,
      listPrice: 3299,
      specsEn: { Capacity: "5.5L", Power: "1700W", Programs: "8", Screen: "Digital touch", Warranty: "2 years" },
      specsAr: { "السعة": "٥٫٥ لتر", "القدرة": "١٧٠٠ وات", "البرامج": "٨", "الشاشة": "ديجيتال تاتش", "الضمان": "سنتين" },
      stock: 15,
      rating: 4.8,
      reviewCount: 423,
      featured: true,
    },
    {
      slug: "vortex-portable-blender",
      titleEn: "Vortex Portable Blender 450ml — USB Rechargeable",
      titleAr: "خلاط فورتكس المحمول ٤٥٠ مل — شحن USB",
      brand: "Vortex",
      descriptionEn:
        "Fresh smoothies anywhere. 450ml BPA-free jar, 6 stainless-steel blades, USB-C charging and enough power for ice and frozen fruit.",
      descriptionAr:
        "سموزي فريش في أي مكان. زجاجة ٤٥٠ مل خالية من BPA، ٦ شفرات استانلس، شحن USB-C وقوة تكسر التلج والفاكهة المجمدة.",
      price: 549,
      listPrice: 749,
      specsEn: { Capacity: "450ml", Blades: "6 stainless steel", Charging: "USB-C", Material: "BPA-free", Warranty: "1 year" },
      specsAr: { "السعة": "٤٥٠ مل", "الشفرات": "٦ استانلس", "الشحن": "USB-C", "الخامة": "خالي من BPA", "الضمان": "سنة" },
      stock: 30,
      rating: 4.2,
      reviewCount: 156,
    },
    {
      slug: "zephyr-cordless-vacuum",
      titleEn: "Zephyr Cordless Stick Vacuum — 22kPa Suction",
      titleAr: "مكنسة زفير اللاسلكية — قوة شفط ٢٢ كيلو باسكال",
      brand: "Zephyr",
      descriptionEn:
        "Lightweight deep cleaning. 22kPa suction, 45 minutes of runtime, swappable attachments for floors, sofas and corners — all at just 1.5kg.",
      descriptionAr:
        "تنظيف عميق وخفيف. شفط ٢٢ كيلو باسكال، تشغيل ٤٥ دقيقة، رؤوس قابلة للتبديل للأرضيات والكنب والأركان — وكل ده بوزن ١٫٥ كيلو بس.",
      price: 3299,
      listPrice: 4199,
      specsEn: { Suction: "22kPa", Runtime: "45 min", Weight: "1.5kg", Filter: "HEPA", Warranty: "2 years" },
      specsAr: { "الشفط": "٢٢ كيلو باسكال", "مدة التشغيل": "٤٥ دقيقة", "الوزن": "١٫٥ كجم", "الفلتر": "HEPA", "الضمان": "سنتين" },
      stock: 8,
      rating: 4.5,
      reviewCount: 88,
      featured: true,
    },
    {
      slug: "luna-granite-cookware-10pc",
      titleEn: "Luna Granite Cookware Set — 10 Pieces",
      titleAr: "طقم حلل لونا جرانيت — ١٠ قطع",
      brand: "Luna",
      descriptionEn:
        "Cook like a chef. 10-piece granite-coated set with even heat distribution, scratch resistance and compatibility with all cooktops including induction.",
      descriptionAr:
        "اطبخ زي الشيف. طقم ١٠ قطع بطبقة جرانيت بتوزّع الحرارة بالتساوي، مقاوم للخدش ويشتغل على كل أنواع البوتاجازات حتى الكهربائي.",
      price: 2899,
      listPrice: 3599,
      specsEn: { Pieces: "10", Material: "Granite coating", Induction: "Compatible", "Oven Safe": "Up to 180°C", Warranty: "2 years" },
      specsAr: { "القطع": "١٠", "الخامة": "طبقة جرانيت", "البوتاجاز الكهربائي": "متوافق", "الفرن": "حتى ١٨٠ درجة", "الضمان": "سنتين" },
      stock: 12,
      rating: 4.6,
      reviewCount: 201,
    },
    {
      slug: "lumio-smart-led-strip-5m",
      titleEn: "Lumio Smart LED Strip 5m — 16M Colors, App & Voice Control",
      titleAr: "شريط إضاءة لوميو الذكي ٥ متر — ١٦ مليون لون بتحكم بالتطبيق والصوت",
      brand: "Lumio",
      descriptionEn:
        "Set the mood instantly. 5 meters of vivid RGB lighting with 16 million colors, music sync, and control via app, Alexa or Google Assistant.",
      descriptionAr:
        "غيّر جو الأوضة في ثانية. ٥ متر إضاءة RGB بـ ١٦ مليون لون، مزامنة مع الموسيقى، وتحكم بالتطبيق أو أليكسا أو جوجل أسيستنت.",
      price: 399,
      listPrice: 549,
      specsEn: { Length: "5m", Colors: "16M RGB", Control: "App + Voice", Power: "USB", Warranty: "1 year" },
      specsAr: { "الطول": "٥ متر", "الألوان": "١٦ مليون RGB", "التحكم": "تطبيق + صوت", "الطاقة": "USB", "الضمان": "سنة" },
      stock: 50,
      rating: 4.1,
      reviewCount: 320,
    },
  ],
  fashion: [
    {
      slug: "meridian-classic-watch",
      titleEn: "Meridian Classic Men's Watch — Genuine Leather Strap",
      titleAr: "ساعة ميريديان الكلاسيكية الرجالي — جلد طبيعي",
      brand: "Meridian",
      descriptionEn:
        "Timeless style for every occasion. 42mm stainless-steel case, Japanese quartz movement, genuine leather strap and 3 ATM water resistance.",
      descriptionAr:
        "ستايل كلاسيكي يناسب كل المناسبات. علبة استانلس ٤٢ مم، موتور كوارتز ياباني، سير جلد طبيعي ومقاومة مياه 3 ATM.",
      price: 1599,
      listPrice: 2199,
      specsEn: { Movement: "Japanese Quartz", Case: "42mm stainless steel", Strap: "Genuine leather", "Water Resistance": "3 ATM", Warranty: "1 year" },
      specsAr: { "الموتور": "كوارتز ياباني", "العلبة": "استانلس ٤٢ مم", "السير": "جلد طبيعي", "مقاومة المياه": "3 ATM", "الضمان": "سنة" },
      stock: 20,
      rating: 4.4,
      reviewCount: 167,
      featured: true,
    },
    {
      slug: "vega-crossbody-bag",
      titleEn: "Vega Crossbody Bag — Water-Resistant PU Leather",
      titleAr: "شنطة فيجا كروس — جلد PU مقاوم للمياه",
      brand: "Vega",
      descriptionEn:
        "Carry your essentials in style. Premium PU leather, 5 organized pockets, adjustable strap and a slim profile that fits tablets up to 10 inches.",
      descriptionAr:
        "شيل احتياجاتك بشياكة. جلد PU فاخر، ٥ جيوب منظمة، حزام قابل للتعديل وتصميم رفيع يستوعب تابلت لحد ١٠ بوصة.",
      price: 699,
      listPrice: 899,
      specsEn: { Material: "PU leather", Dimensions: "28×20×8cm", Pockets: "5", Strap: "Adjustable", Care: "Wipe clean" },
      specsAr: { "الخامة": "جلد PU", "الأبعاد": "٢٨×٢٠×٨ سم", "الجيوب": "٥", "الحزام": "قابل للتعديل", "العناية": "تنظيف بالمسح" },
      stock: 35,
      rating: 4.3,
      reviewCount: 244,
    },
    {
      slug: "helios-polarized-sunglasses",
      titleEn: "Helios Polarized Sunglasses — UV400 Aluminum Frame",
      titleAr: "نضارة هيليوس الشمسية المستقطبة — UV400 بإطار ألومنيوم",
      brand: "Helios",
      descriptionEn:
        "Protect your eyes in style. Polarized UV400 lenses cut glare on the road and beach, with a featherlight 23g aluminum frame.",
      descriptionAr:
        "احمي عينيك بستايل. عدسات مستقطبة UV400 بتقطع وهج الشمس في الطريق والبحر، بإطار ألومنيوم وزنه ٢٣ جرام بس.",
      price: 449,
      listPrice: 649,
      specsEn: { Lens: "Polarized UV400", Frame: "Aluminum", Weight: "23g", Includes: "Case + cloth", Warranty: "6 months" },
      specsAr: { "العدسات": "مستقطبة UV400", "الإطار": "ألومنيوم", "الوزن": "٢٣ جرام", "المحتويات": "علبة + قماشة", "الضمان": "٦ شهور" },
      stock: 2,
      rating: 4.5,
      reviewCount: 132,
    },
    {
      slug: "sahara-leather-belt",
      titleEn: "Sahara Genuine Leather Belt — Auto-Lock Buckle",
      titleAr: "حزام صحارى جلد طبيعي — إبزيم أوتوماتيك",
      brand: "Sahara",
      descriptionEn:
        "Everyday elegance that lasts. Full-grain genuine leather, ratchet auto-lock buckle for a perfect fit, and a trim-to-size design.",
      descriptionAr:
        "أناقة يومية بتعيش. جلد طبيعي فاخر، إبزيم أوتوماتيك بياخد مقاسك بالظبط، وتصميم بيتقص على مقاسك.",
      price: 349,
      listPrice: 499,
      specsEn: { Material: "Genuine leather", Width: "3.5cm", Buckle: "Auto-lock ratchet", Length: "Trim to size", Warranty: "6 months" },
      specsAr: { "الخامة": "جلد طبيعي", "العرض": "٣٫٥ سم", "الإبزيم": "أوتوماتيك", "الطول": "يتقص على المقاس", "الضمان": "٦ شهور" },
      stock: 45,
      rating: 4.2,
      reviewCount: 98,
    },
    {
      slug: "orion-slim-rfid-wallet",
      titleEn: "Slim RFID-Blocking Wallet — Carbon Fiber & Leather",
      titleAr: "محفظة سليم بحماية RFID — كاربون فايبر وجلد",
      brand: "Orion Basics",
      descriptionEn:
        "Protect your cards, ditch the bulk. RFID-blocking layer, room for 12 cards plus cash, in a slim carbon-fiber and leather body.",
      descriptionAr:
        "احمي كروتك من السرقة الإلكترونية من غير حجم زيادة. طبقة حماية RFID، تتسع ١٢ كارت غير الكاش، بجسم رفيع كاربون فايبر وجلد.",
      price: 299,
      listPrice: 429,
      specsEn: { Material: "Carbon fiber + leather", RFID: "Blocking", Cards: "12", Dimensions: "11×8×1.5cm", Warranty: "6 months" },
      specsAr: { "الخامة": "كاربون فايبر + جلد", "RFID": "حماية كاملة", "الكروت": "١٢", "الأبعاد": "١١×٨×١٫٥ سم", "الضمان": "٦ شهور" },
      stock: 60,
      rating: 4.6,
      reviewCount: 310,
    },
  ],
  "sports-fitness": [
    {
      slug: "zen-pro-yoga-mat",
      titleEn: "Zen Pro Yoga Mat 6mm — Non-Slip TPE",
      titleAr: "مفرش يوجا زن برو ٦ مم — TPE مانع للانزلاق",
      brand: "Zen",
      descriptionEn:
        "Practice in comfort. 6mm of cushioning, double-sided non-slip texture, eco-friendly TPE material and a free carry strap.",
      descriptionAr:
        "تمرّن براحة. سُمك ٦ مم مريح للمفاصل، ملمس مانع للانزلاق من الوشين، خامة TPE صديقة للبيئة وحزام شيل هدية.",
      price: 499,
      listPrice: 699,
      specsEn: { Thickness: "6mm", Material: "TPE", Size: "183×61cm", "Non-Slip": "Double-sided", Includes: "Carry strap" },
      specsAr: { "السُمك": "٦ مم", "الخامة": "TPE", "المقاس": "١٨٣×٦١ سم", "مانع الانزلاق": "وشين", "المحتويات": "حزام شيل" },
      stock: 28,
      rating: 4.7,
      reviewCount: 275,
    },
    {
      slug: "titan-adjustable-dumbbells-24kg",
      titleEn: "Titan Adjustable Dumbbells Pair — 2.5 to 24kg Each",
      titleAr: "دامبلز تيتان القابلة للتعديل — من ٢٫٥ لـ ٢٤ كجم للقطعة",
      brand: "Titan",
      descriptionEn:
        "A full rack in one pair. Dial from 2.5 to 24kg per dumbbell in seconds — replaces 15 sets of weights and saves your space.",
      descriptionAr:
        "جيم كامل في قطعتين. عيّر الوزن من ٢٫٥ لـ ٢٤ كجم للدامبل في ثواني — بتغنيك عن ١٥ طقم أوزان وبتوفر مساحتك.",
      price: 4499,
      listPrice: 5499,
      specsEn: { Range: "2.5–24kg each", Adjustment: "Quick dial", Pair: "Yes (2 dumbbells)", Base: "Included", Warranty: "2 years" },
      specsAr: { "المدى": "٢٫٥–٢٤ كجم للقطعة", "التعديل": "قرص سريع", "العدد": "قطعتين", "القاعدة": "متضمنة", "الضمان": "سنتين" },
      stock: 6,
      rating: 4.8,
      reviewCount: 64,
      featured: true,
    },
    {
      slug: "flex-resistance-bands-set",
      titleEn: "Flex Resistance Bands Set — 5 Levels up to 68kg",
      titleAr: "طقم أحبال مقاومة فلكس — ٥ مستويات حتى ٦٨ كجم",
      brand: "Flex",
      descriptionEn:
        "Train anywhere. 5 stackable bands up to 68kg of total resistance, with handles, ankle straps, door anchor and a carry bag.",
      descriptionAr:
        "اتمرّن في أي مكان. ٥ أحبال بتتركب مع بعض بمقاومة إجمالية ٦٨ كجم، مع مقابض وأحزمة رجل ومثبت باب وشنطة.",
      price: 349,
      listPrice: 499,
      specsEn: { Bands: "5 levels", "Max Resistance": "68kg combined", Material: "Natural latex", Accessories: "Handles + anchor + straps", Includes: "Carry bag" },
      specsAr: { "الأحبال": "٥ مستويات", "أقصى مقاومة": "٦٨ كجم مجمعة", "الخامة": "لاتكس طبيعي", "الإكسسوارات": "مقابض + مثبت + أحزمة", "المحتويات": "شنطة" },
      stock: 55,
      rating: 4.4,
      reviewCount: 412,
    },
    {
      slug: "polar-thermal-bottle-1l",
      titleEn: "Polar Thermal Bottle 1L — 24h Cold / 12h Hot",
      titleAr: "زجاجة بولار الحافظة للحرارة ١ لتر — ٢٤ ساعة بارد / ١٢ ساعة سخن",
      brand: "Polar",
      descriptionEn:
        "Your drink, the right temperature, all day. Double-wall 316 stainless steel keeps drinks cold for 24 hours or hot for 12, leak-proof guaranteed.",
      descriptionAr:
        "مشروبك بدرجة الحرارة المظبوطة طول اليوم. استانلس 316 بجدار مزدوج يحافظ على البرودة ٢٤ ساعة والسخونة ١٢ ساعة، ومضمونة ضد التسريب.",
      price: 399,
      listPrice: 549,
      specsEn: { Capacity: "1L", Insulation: "24h cold / 12h hot", Material: "Stainless steel 316", "Leak-Proof": "Yes", Warranty: "1 year" },
      specsAr: { "السعة": "١ لتر", "العزل": "٢٤ ساعة بارد / ١٢ سخن", "الخامة": "استانلس 316", "ضد التسريب": "نعم", "الضمان": "سنة" },
      stock: 33,
      rating: 4.5,
      reviewCount: 189,
    },
    {
      slug: "atlas-foldable-workout-bench",
      titleEn: "Atlas Foldable Workout Bench — 7 Positions, 300kg Load",
      titleAr: "بنش تمارين أطلس القابل للطي — ٧ أوضاع وتحمل ٣٠٠ كجم",
      brand: "Atlas",
      descriptionEn:
        "A home gym essential. 7 adjustable backrest positions from decline to upright, heavy-duty 300kg capacity, folds flat in seconds for storage.",
      descriptionAr:
        "أساسي لجيم البيت. ٧ أوضاع للظهر من الميل لحد القائم، تحمّل ٣٠٠ كجم، وبيتطبق مسطح في ثواني للتخزين.",
      price: 2799,
      listPrice: 3499,
      specsEn: { Positions: "7", "Max Load": "300kg", Foldable: "Yes", Padding: "High-density foam", Warranty: "2 years" },
      specsAr: { "الأوضاع": "٧", "أقصى حمل": "٣٠٠ كجم", "قابل للطي": "نعم", "الحشو": "فوم عالي الكثافة", "الضمان": "سنتين" },
      stock: 9,
      rating: 4.3,
      reviewCount: 57,
    },
  ],
};

async function main() {
  console.log("🌱 Seeding Orion…");

  // ترتيب الحذف مهم بسبب الـ foreign keys
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  for (const cat of categories) {
    const category = await prisma.category.create({ data: cat });
    const items = products[cat.slug] ?? [];
    for (const p of items) {
      await prisma.product.create({
        data: {
          slug: p.slug,
          titleEn: p.titleEn,
          titleAr: p.titleAr,
          brand: p.brand,
          descriptionEn: p.descriptionEn,
          descriptionAr: p.descriptionAr,
          price: p.price,
          listPrice: p.listPrice,
          images: imgs(p.slug),
          specsEn: j(p.specsEn),
          specsAr: j(p.specsAr),
          stock: p.stock,
          rating: p.rating,
          reviewCount: p.reviewCount,
          featured: p.featured ?? false,
          categoryId: category.id,
        },
      });
    }
    console.log(`  ✓ ${cat.nameEn}: ${items.length} products`);
  }

  console.log("✅ Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
