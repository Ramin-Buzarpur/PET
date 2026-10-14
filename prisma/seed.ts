import { PrismaClient, Species } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type CategorySeed = {
  name: string;
  slug: string;
  availableFilters: string[];
  productTypes: string[];
};

type SectionSeed = {
  name: string;
  slug: string;
  isHelper?: boolean;
  categories: CategorySeed[];
};

const SECTIONS: SectionSeed[] = [
  {
    name: "گربه",
    slug: "cats",
    categories: [
      { name: "غذا", slug: "cat-food", availableFilters: ["age", "packageWeight"], productTypes: ["غذای خشک", "کنسرو و پوچ", "شیر مخصوص", "سایر غذاها"] },
      { name: "تشویقی", slug: "cat-treats", availableFilters: ["productType", "packageWeight"], productTypes: ["بستنی گربه", "تشویقی نرم", "کرانچی"] },
      { name: "خاک و لوازم دستشویی", slug: "cat-litter", availableFilters: ["productType"], productTypes: ["خاک", "ظرف خاک", "بیلچه", "پادری و بوگیر"] },
      { name: "اسباب‌بازی و اسکرچر", slug: "cat-toys", availableFilters: ["productType"], productTypes: ["توپ", "موش", "چوب بازی", "تونل", "اسکرچر و درخت"] },
      { name: "بهداشت و نظافت", slug: "cat-grooming", availableFilters: ["productType"], productTypes: ["شامپو", "دستمال", "برس", "ناخن‌گیر", "مراقبت دهان و گوش"] },
      { name: "مکمل و مالت", slug: "cat-supplements", availableFilters: [], productTypes: ["مالت", "ویتامین", "مکمل"] },
      { name: "ظرف آب و غذا", slug: "cat-bowls", availableFilters: ["productType"], productTypes: ["ظرف معمولی", "آبخوری", "غذادهنده", "قطعات مصرفی"] },
      { name: "جای خواب", slug: "cat-beds", availableFilters: [], productTypes: ["تخت", "تشک", "خانه", "پتو"] },
      { name: "حمل و قلاده", slug: "cat-carry", availableFilters: ["productType"], productTypes: ["باکس", "کیف و کوله حمل", "قلاده", "هارنس و بند"] },
      { name: "لباس و اکسسوری", slug: "cat-clothing", availableFilters: ["size", "color"], productTypes: [] },
    ],
  },
  {
    name: "سگ",
    slug: "dogs",
    categories: [
      { name: "غذا", slug: "dog-food", availableFilters: ["age", "dogSize", "packageWeight"], productTypes: ["غذای خشک", "کنسرو و پوچ", "شیر مخصوص", "سایر غذاها"] },
      { name: "تشویقی و جویدنی", slug: "dog-treats", availableFilters: ["productType", "packageWeight"], productTypes: ["تشویقی آموزشی", "بیسکویت", "تشویقی نرم", "جویدنی خوراکی"] },
      { name: "قلاده و پیاده‌روی", slug: "dog-leash", availableFilters: ["productType", "size"], productTypes: ["قلاده", "هارنس", "بند", "پوزه‌بند و پلاک"] },
      { name: "اسباب‌بازی", slug: "dog-toys", availableFilters: ["productType"], productTypes: ["توپ", "طناب", "عروسک", "اسباب‌بازی جویدنی و فکری"] },
      { name: "آموزش و دستشویی", slug: "dog-training", availableFilters: ["productType"], productTypes: ["کلیکر", "کیف تشویقی", "پد", "پوشک و کیسه مدفوع"] },
      { name: "بهداشت و نظافت", slug: "dog-grooming", availableFilters: ["productType"], productTypes: ["شامپو", "دستمال", "برس", "ماشین اصلاح", "مراقبت دهان و گوش"] },
      { name: "ویتامین و مکمل", slug: "dog-supplements", availableFilters: [], productTypes: ["ویتامین", "مکمل"] },
      { name: "ظرف آب و غذا", slug: "dog-bowls", availableFilters: ["productType"], productTypes: ["ظرف معمولی", "ظرف سفری", "آبخوری", "غذادهنده خودکار"] },
      { name: "جای خواب و خانه", slug: "dog-beds", availableFilters: ["productType"], productTypes: ["تخت", "تشک", "خانه", "قفس نگهداری", "پارک"] },
      { name: "حمل و سفر", slug: "dog-carry", availableFilters: ["productType"], productTypes: ["باکس", "کیف", "کوله", "کالسکه", "لوازم خودرو"] },
      { name: "لباس و اکسسوری", slug: "dog-clothing", availableFilters: ["size", "color"], productTypes: ["لباس روزمره", "لباس گرم", "بارانی", "کفش"] },
    ],
  },
  {
    name: "پرندگان",
    slug: "birds",
    categories: [
      { name: "غذا و تشویقی", slug: "bird-food", availableFilters: ["animalType", "packageWeight"], productTypes: ["دان", "پلت", "غذای نرم", "سرلاک", "تشویقی"] },
      { name: "ویتامین و مکمل", slug: "bird-supplements", availableFilters: ["animalType"], productTypes: ["ویتامین", "مکمل", "مواد معدنی", "کف دریا"] },
      { name: "قفس و لوازم قفس", slug: "bird-cages", availableFilters: ["animalType", "productType"], productTypes: ["قفس", "کاور", "نشیمن", "تاب", "لانه"] },
      { name: "ظرف آب و غذا", slug: "bird-bowls", availableFilters: [], productTypes: ["دانخوری", "آبخوری", "ابزار تغذیه"] },
      { name: "اسباب‌بازی", slug: "bird-toys", availableFilters: ["animalType"], productTypes: ["اسباب‌بازی جویدنی", "آویز", "فکری"] },
      { name: "بهداشت و حمل", slug: "bird-care", availableFilters: ["productType"], productTypes: ["وان حمام", "لوازم نظافت", "کیف حمل"] },
    ],
  },
  {
    name: "خرگوش و حیوانات کوچک",
    slug: "small-pets",
    categories: [
      { name: "غذا و مکمل", slug: "small-pet-food", availableFilters: ["animalType", "packageWeight", "productType"], productTypes: ["غذای آماده", "یونجه", "تشویقی", "مکمل"] },
      { name: "قفس و جای خواب", slug: "small-pet-cages", availableFilters: ["animalType"], productTypes: ["قفس", "محوطه", "خانه", "مخفیگاه"] },
      { name: "بستر و دستشویی", slug: "small-pet-bedding", availableFilters: ["animalType"], productTypes: ["بستر", "زیرانداز", "ظرف دستشویی"] },
      { name: "ظرف آب و غذا", slug: "small-pet-bowls", availableFilters: ["animalType"], productTypes: ["ظرف", "بطری آبخوری", "جای علوفه"] },
      { name: "اسباب‌بازی", slug: "small-pet-toys", availableFilters: ["animalType"], productTypes: ["تونل", "ابزار جویدن", "چرخ", "وسایل بازی"] },
      { name: "مراقبت و حمل", slug: "small-pet-care", availableFilters: ["animalType", "productType"], productTypes: ["برس", "ناخن‌گیر", "لوازم مراقبت", "باکس حمل"] },
    ],
  },
  {
    name: "ماهی و آکواریوم",
    slug: "aquarium",
    categories: [
      { name: "غذا و تغذیه", slug: "fish-food", availableFilters: ["waterType", "productType"], productTypes: ["غذای ماهی", "غذای میگو", "غذادهنده", "ابزار تغذیه"] },
      { name: "آکواریوم", slug: "fish-tanks", availableFilters: [], productTypes: ["مخزن", "ست کامل", "پایه", "درپوش"] },
      { name: "فیلتر و پمپ", slug: "fish-filters", availableFilters: ["waterType", "productType"], productTypes: ["فیلتر", "مدیا", "پمپ", "سنگ هوا", "قطعات"] },
      { name: "مراقبت آب", slug: "fish-water-care", availableFilters: ["waterType"], productTypes: ["ضدکلر", "باکتری‌ساز", "تست آب"] },
      { name: "نور و کنترل دما", slug: "fish-lighting", availableFilters: ["productType"], productTypes: ["چراغ", "بخاری", "دماسنج", "کنترلر"] },
      { name: "بستر و دکور", slug: "fish-decor", availableFilters: ["productType"], productTypes: ["شن", "ماسه", "بستر", "سنگ", "چوب", "گیاه"] },
      { name: "نظافت و نگهداری", slug: "fish-cleaning", availableFilters: [], productTypes: ["سیفون", "تور", "ابزار نظافت"] },
    ],
  },
  {
    name: "خزندگان و لاک‌پشت",
    slug: "reptiles",
    categories: [
      { name: "غذا و مکمل", slug: "reptile-food", availableFilters: ["animalType", "productType"], productTypes: ["غذای مخصوص گونه", "تشویقی", "کلسیم", "مکمل"] },
      { name: "زیستگاه", slug: "reptile-habitat", availableFilters: ["animalType"], productTypes: ["تراریوم", "مخزن", "محوطه نگهداری"] },
      { name: "نور و گرمایش", slug: "reptile-lighting", availableFilters: ["animalType"], productTypes: ["لامپ", "پد گرمایی", "دماسنج", "کنترل محیط"] },
      { name: "بستر و دکور", slug: "reptile-decor", availableFilters: ["animalType"], productTypes: ["بستر", "مخفیگاه", "شاخه", "سکوی آفتاب‌گیری"] },
      { name: "لوازم نگهداری", slug: "reptile-care", availableFilters: ["animalType"], productTypes: ["ظرف", "ابزار تغذیه", "نظافت", "باکس حمل"] },
    ],
  },
  {
    name: "خانه و سرپرست",
    slug: "home-caretaker",
    isHelper: true,
    categories: [
      { name: "نظافت خانه", slug: "home-cleaning", availableFilters: [], productTypes: ["پرزگیر", "پاک‌کننده لکه و بو"] },
      { name: "لوازم خانه و سرپرست", slug: "home-accessories", availableFilters: [], productTypes: ["روکش", "تجهیزات ایمنی", "وسایل هوشمند", "اکسسوری سرپرست"] },
    ],
  },
];

const BRANDS = [
  { name: "رویال کنین", slug: "royal-canin" },
  { name: "پدیگری", slug: "pedigree" },
  { name: "ویسکاس", slug: "whiskas" },
  { name: "فرش‌فیلدز", slug: "freshfields" },
  { name: "پت‌لند هوم", slug: "petland-home" },
];

type VariantSeed = {
  size?: string;
  color?: string;
  packageWeight?: string;
  price: number;
  stock: number;
};

type ProductSeed = {
  title: string;
  slug: string;
  description: string;
  images: string[];
  brandSlug?: string;
  ageGroup?: "BABY" | "ADULT" | "SENIOR";
  dogSize?: "SMALL" | "MEDIUM" | "LARGE";
  waterType?: "FRESH" | "SALT";
  animalSubtype?: string;
  productType?: string;
  categorySlugs: string[];
  variants: VariantSeed[];
};

const PRODUCTS: ProductSeed[] = [
  {
    title: "غذای خشک سگ بالغ مرغ و برنج",
    slug: "dog-food-chicken-rice",
    description: "غذای کامل و متعادل برای سگ‌های بالغ با منبع اصلی پروتئین از مرغ، همراه با برنج قابل هضم و امگا ۳ برای پوست و موی سالم‌تر.",
    images: ["/images/products/dog-food.svg"],
    brandSlug: "royal-canin",
    ageGroup: "ADULT",
    dogSize: "MEDIUM",
    productType: "غذای خشک",
    categorySlugs: ["dog-food"],
    variants: [
      { packageWeight: "4 کیلوگرم", price: 980000, stock: 30 },
      { packageWeight: "15 کیلوگرم", price: 3250000, stock: 15 },
    ],
  },
  {
    title: "غذای خشک گربه بالغ با طعم ماهی سالمون",
    slug: "cat-food-salmon",
    description: "فرمول مخصوص گربه‌های بالغ با پروتئین بالا از سالمون، کمک به کاهش گربول مو و تقویت سیستم ادراری.",
    images: ["/images/products/cat-food.svg"],
    brandSlug: "whiskas",
    ageGroup: "ADULT",
    productType: "غذای خشک",
    categorySlugs: ["cat-food"],
    variants: [
      { packageWeight: "1.5 کیلوگرم", price: 420000, stock: 40 },
      { packageWeight: "10 کیلوگرم", price: 2450000, stock: 20 },
    ],
  },
  {
    title: "توپ تعاملی هوشمند گربه",
    slug: "smart-interactive-ball-cat",
    description: "توپ خودکار با حرکت تصادفی برای تحریک حس بازی‌طلبی گربه، باتری قابل شارژ و بدنه ضدضربه.",
    images: ["/images/products/cat-ball.svg"],
    brandSlug: "petland-home",
    productType: "توپ",
    categorySlugs: ["cat-toys"],
    variants: [{ price: 620000, stock: 70 }],
  },
  {
    title: "طناب کشش دندانی سگ",
    slug: "dog-rope-chew-toy",
    description: "اسباب‌بازی طناب پنبه‌ای مناسب تمیز شدن دندان‌ها هنگام بازی کشش، مناسب سگ‌های کوچک تا متوسط.",
    images: ["/images/products/dog-rope.svg"],
    productType: "طناب",
    categorySlugs: ["dog-toys"],
    variants: [{ price: 290000, stock: 90 }],
  },
  {
    title: "خوابگاه نرم و گرم پت",
    slug: "cozy-pet-bed",
    description: "خوابگاه دایره‌ای با پر سیلیکونی، قابل شستشو در ماشین لباسشویی، مناسب سگ و گربه تا ۱۲ کیلوگرم. محصول مشترک برای سگ و گربه.",
    images: ["/images/products/pet-bed.svg"],
    brandSlug: "petland-home",
    productType: "تخت",
    categorySlugs: ["dog-beds", "cat-beds"],
    variants: [
      { size: "متوسط", price: 980000, stock: 25 },
      { size: "بزرگ", price: 1280000, stock: 15 },
    ],
  },
  {
    title: "قفس حمل پت سبک و تاشو",
    slug: "foldable-pet-carrier",
    description: "قفس حمل با بدنه مش تنفس‌پذیر، مناسب سفر و رفتن به دامپزشکی، قابل تاشدن برای جابه‌جایی راحت. محصول مشترک برای سگ و گربه.",
    images: ["/images/products/pet-carrier.svg"],
    productType: "باکس",
    categorySlugs: ["dog-carry", "cat-carry"],
    variants: [{ price: 1150000, stock: 25 }],
  },
  {
    title: "ژاکت زمستانی گربه",
    slug: "cat-winter-jacket",
    description: "ژاکت گرم و نرم برای گربه‌های حساس به سرما، بدون محدودیت در حرکت.",
    images: ["/images/products/cat-jacket.svg"],
    categorySlugs: ["cat-clothing"],
    variants: [
      { size: "S", color: "قرمز", price: 310000, stock: 12 },
      { size: "M", color: "آبی", price: 340000, stock: 10 },
    ],
  },
  {
    title: "بارانی ضدآب سگ",
    slug: "dog-raincoat",
    description: "بارانی سبک و ضدآب برای پیاده‌روی در روزهای بارانی، با بند قابل تنظیم.",
    images: ["/images/products/dog-raincoat.svg"],
    productType: "بارانی",
    categorySlugs: ["dog-clothing"],
    variants: [
      { size: "M", color: "زرد", price: 380000, stock: 18 },
      { size: "L", color: "سبز", price: 410000, stock: 14 },
    ],
  },
  {
    title: "دان مخصوص مرغ عشق",
    slug: "budgie-seed-mix",
    description: "ترکیب دانه‌های مخصوص مرغ عشق با ویتامین افزوده برای تغذیه کامل.",
    images: ["/images/products/bird-seed.svg"],
    animalSubtype: "مرغ عشق",
    productType: "دان",
    categorySlugs: ["bird-food"],
    variants: [
      { packageWeight: "500 گرم", price: 95000, stock: 50 },
      { packageWeight: "1 کیلوگرم", price: 170000, stock: 30 },
    ],
  },
  {
    title: "قفس پرنده متوسط",
    slug: "medium-bird-cage",
    description: "قفس فلزی با نشیمن و ظرف‌های جانبی، مناسب عروس هلندی و مرغ عشق.",
    images: ["/images/products/bird-cage.svg"],
    productType: "قفس",
    categorySlugs: ["bird-cages"],
    variants: [{ price: 1650000, stock: 10 }],
  },
  {
    title: "یونجه خرگوش درجه یک",
    slug: "premium-rabbit-hay",
    description: "یونجه تیموتی خشک‌شده طبیعی، منبع اصلی فیبر برای خرگوش و خوکچه هندی.",
    images: ["/images/products/rabbit-hay.svg"],
    animalSubtype: "خرگوش",
    productType: "یونجه",
    categorySlugs: ["small-pet-food"],
    variants: [
      { packageWeight: "1 کیلوگرم", price: 180000, stock: 40 },
      { packageWeight: "2.5 کیلوگرم", price: 390000, stock: 20 },
    ],
  },
  {
    title: "قفس خرگوش بزرگ دوطبقه",
    slug: "large-rabbit-cage",
    description: "قفس دوطبقه با رمپ، مناسب نگهداری راحت خرگوش و خوکچه هندی در خانه.",
    images: ["/images/products/rabbit-cage.svg"],
    productType: "قفس",
    categorySlugs: ["small-pet-cages"],
    variants: [{ price: 2450000, stock: 8 }],
  },
  {
    title: "غذای پرک ماهی‌های آکواریومی",
    slug: "tropical-fish-flakes",
    description: "غذای پرک متعادل برای ماهی‌های تزئینی آب شیرین، رنگ‌دهنده طبیعی.",
    images: ["/images/products/fish-food.svg"],
    waterType: "FRESH",
    productType: "غذای ماهی",
    categorySlugs: ["fish-food"],
    variants: [
      { packageWeight: "100 گرم", price: 145000, stock: 35 },
      { packageWeight: "250 گرم", price: 290000, stock: 20 },
    ],
  },
  {
    title: "آکواریوم کامل ۶۰ لیتری",
    slug: "aquarium-set-60l",
    description: "ست کامل آکواریوم شامل مخزن، پایه، درپوش و فیلتر داخلی، آماده نصب.",
    images: ["/images/products/aquarium-set.svg"],
    productType: "ست کامل",
    categorySlugs: ["fish-tanks"],
    variants: [{ price: 4200000, stock: 6 }],
  },
  {
    title: "فیلتر داخلی آکواریوم",
    slug: "internal-aquarium-filter",
    description: "فیلتر داخلی کم‌صدا مناسب مخازن کوچک تا متوسط، با اسفنج قابل شست‌وشو.",
    images: ["/images/products/aquarium-filter.svg"],
    waterType: "FRESH",
    productType: "فیلتر",
    categorySlugs: ["fish-filters"],
    variants: [{ price: 520000, stock: 18 }],
  },
  {
    title: "غذای مخصوص لاک‌پشت آبزی",
    slug: "aquatic-turtle-food",
    description: "پلت غذایی متعادل برای لاک‌پشت‌های آبزی با کلسیم افزوده برای سلامت لاک.",
    images: ["/images/products/reptile-food.svg"],
    animalSubtype: "لاک‌پشت آبزی",
    productType: "غذای مخصوص گونه",
    categorySlugs: ["reptile-food"],
    variants: [{ packageWeight: "250 گرم", price: 210000, stock: 22 }],
  },
  {
    title: "لامپ UVB مخصوص خزندگان",
    slug: "reptile-uvb-lamp",
    description: "لامپ تخصصی تأمین ویتامین D3 برای خزندگان نگهداری‌شده در تراریوم.",
    images: ["/images/products/reptile-lamp.svg"],
    productType: "لامپ",
    categorySlugs: ["reptile-lighting"],
    variants: [{ price: 640000, stock: 14 }],
  },
  {
    title: "پرزگیر حرفه‌ای لباس و مبل",
    slug: "pro-pet-hair-remover",
    description: "پرزگیر قابل شست‌وشو برای پاکسازی سریع موی پت از روی لباس، مبل و خودرو.",
    images: ["/images/products/home-cleaner.svg"],
    productType: "پرزگیر",
    categorySlugs: ["home-cleaning"],
    variants: [{ price: 240000, stock: 45 }],
  },
  {
    title: "دوربین هوشمند نظارت بر پت",
    slug: "smart-pet-camera",
    description: "دوربین Wi-Fi با دید در شب و دوطرفه صدا برای نظارت بر پت در غیاب شما.",
    images: ["/images/products/smart-camera.svg"],
    brandSlug: "petland-home",
    productType: "وسایل هوشمند",
    categorySlugs: ["home-accessories"],
    variants: [{ price: 1890000, stock: 12 }],
  },
];

async function main() {
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.coursePackage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.animalSection.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.faqEntry.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const userPassword = await bcrypt.hash("User@123", 10);

  await prisma.user.create({
    data: { name: "مدیر فروشگاه", email: "admin@petshop.test", passwordHash: adminPassword, role: "ADMIN" },
  });

  const demoUser = await prisma.user.create({
    data: { name: "کاربر نمونه", email: "user@petshop.test", passwordHash: userPassword, role: "USER" },
  });

  // --- Catalog: sections + categories ---
  const categoryBySlug = new Map<string, string>();

  for (let i = 0; i < SECTIONS.length; i++) {
    const section = SECTIONS[i];
    const createdSection = await prisma.animalSection.create({
      data: { name: section.name, slug: section.slug, order: i, isHelper: !!section.isHelper },
    });

    for (let j = 0; j < section.categories.length; j++) {
      const category = section.categories[j];
      const createdCategory = await prisma.category.create({
        data: {
          name: category.name,
          slug: category.slug,
          order: j,
          sectionId: createdSection.id,
          availableFilters: category.availableFilters,
          productTypes: category.productTypes,
        },
      });
      categoryBySlug.set(category.slug, createdCategory.id);
    }
  }

  // --- Brands ---
  const brandBySlug = new Map<string, string>();
  for (const brand of BRANDS) {
    const created = await prisma.brand.create({ data: brand });
    brandBySlug.set(brand.slug, created.id);
  }

  // --- Products + variants + category links ---
  for (const product of PRODUCTS) {
    await prisma.product.create({
      data: {
        title: product.title,
        slug: product.slug,
        description: product.description,
        images: product.images,
        brandId: product.brandSlug ? brandBySlug.get(product.brandSlug) : undefined,
        ageGroup: product.ageGroup,
        dogSize: product.dogSize,
        waterType: product.waterType,
        animalSubtype: product.animalSubtype,
        productType: product.productType,
        categories: {
          create: product.categorySlugs.map((slug) => ({ categoryId: categoryBySlug.get(slug)! })),
        },
        variants: { create: product.variants },
      },
    });
  }

  // --- Courses (unchanged from v1) ---
  const dogCourse = await prisma.coursePackage.create({
    data: {
      title: "پکیج کامل نگهداری و تربیت سگ",
      slug: "complete-dog-care",
      species: Species.DOG,
      description: "یک دوره جامع برای صاحبان سگ، از تغذیه و بهداشت روزانه تا تربیت پایه و پیشگیری از بیماری‌های شایع.",
      price: 2450000,
      coverImage: "/images/courses/dog-course.svg",
      chapters: {
        create: [
          {
            order: 1,
            title: "آشنایی اولیه و آماده‌سازی خانه برای سگ جدید",
            isFreePreview: true,
            textContent: "در این چپتر یاد می‌گیرید چطور خانه را برای ورود سگ جدید آماده کنید: چیدمان امن محیط، انتخاب ظرف غذا و آب، محل خواب مناسب و اقلام ضروری اولیه. همچنین نکاتی درباره دوران سازگاری اولین هفته‌ها ارائه می‌شود.",
            audioUrl: "/media/audio/placeholder-chapter1.mp3",
            videoUrl: "/media/video/placeholder-chapter1.mp4",
          },
          {
            order: 2,
            title: "تغذیه صحیح سگ بر اساس سن و نژاد",
            textContent: "بررسی نیازهای غذایی سگ در سنین مختلف (توله، بالغ، سالمند)، تفاوت نیاز نژادهای کوچک و بزرگ، و نحوه محاسبه مقدار غذای روزانه بر اساس وزن و سطح فعالیت.",
            audioUrl: "/media/audio/placeholder-chapter2.mp3",
            videoUrl: "/media/video/placeholder-chapter2.mp4",
          },
          { order: 3, title: "بهداشت روزانه: حمام، ناخن و گوش", textContent: "آموزش گام‌به‌گام شست‌وشوی صحیح، کوتاه کردن ناخن بدون آسیب به رگ، و تمیز کردن گوش برای پیشگیری از عفونت‌های شایع." },
          { order: 4, title: "تربیت پایه: نشستن، ماندن و فراخوانی", textContent: "روش‌های تربیت مثبت و تشویقی برای یادگیری فرمان‌های پایه، زمان‌بندی مناسب تمرین و اشتباهات رایج صاحبان سگ در این مرحله." },
          { order: 5, title: "پیشگیری از بیماری‌های شایع و واکسیناسیون", textContent: "جدول واکسیناسیون استاندارد، علائم هشداردهنده بیماری‌های شایع مثل پاروویروس و کرم قلب، و زمان مناسب مراجعه به دامپزشک." },
        ],
      },
    },
  });

  await prisma.coursePackage.create({
    data: {
      title: "پکیج کامل نگهداری از گربه",
      slug: "complete-cat-care",
      species: Species.CAT,
      description: "همه چیزهایی که برای نگهداری درست از گربه نیاز دارید؛ از انتخاب خاک‌دان مناسب تا شناخت زبان بدن و پیشگیری از بیماری.",
      price: 2190000,
      coverImage: "/images/courses/cat-course.svg",
      chapters: {
        create: [
          {
            order: 1,
            title: "آماده‌سازی خانه برای گربه جدید",
            isFreePreview: true,
            textContent: "انتخاب خاک‌دان، محل مناسب برای ظرف غذا و خاک‌دان (دور از هم)، و نکات ایمنی خانه برای یک گربه کنجکاو.",
            audioUrl: "/media/audio/placeholder-chapter1.mp3",
            videoUrl: "/media/video/placeholder-chapter1.mp4",
          },
          { order: 2, title: "تغذیه گربه و جلوگیری از چاقی", textContent: "نیاز غذایی گربه به عنوان یک گوشتخوار اجباری، تفاوت غذای خشک و تر، و راهکارهای کنترل وزن." },
          { order: 3, title: "زبان بدن گربه: فهمیدن حالات و احساسات", textContent: "آموزش خواندن زبان بدن گربه از طریق حرکت دم، گوش و صدا؛ تشخیص استرس، رضایت و آمادگی برای بازی." },
          { order: 4, title: "مراقبت از مو و پیشگیری از گربول", textContent: "روش‌های شانه کردن منظم، انتخاب شانه مناسب بر اساس نوع مو، و راه‌های کاهش بلعیدن مو." },
          { order: 5, title: "پیشگیری از بیماری‌های شایع گربه", textContent: "علائم بیماری‌های کلیوی و ادراری شایع در گربه، اهمیت چکاپ دوره‌ای، و زمان مناسب مراجعه به دامپزشک." },
        ],
      },
    },
  });

  await prisma.enrollment.create({ data: { userId: demoUser.id, packageId: dogCourse.id, progress: 20 } });

  const faqs = [
    { question: "چند بار در روز باید به سگ غذا بدهم؟", answer: "توله سگ‌ها معمولاً ۳ تا ۴ بار در روز، و سگ‌های بالغ ۲ بار در روز (صبح و عصر) غذا دریافت می‌کنند. مقدار دقیق به وزن و سطح فعالیت سگ بستگی دارد.", tags: ["سگ", "تغذیه"] },
    { question: "چرا گربه‌ام زیادی خاک‌دان را بو می‌کند قبل از استفاده؟", answer: "این رفتار طبیعی است و معمولاً نشانه بررسی تمیزی و بوی خاک‌دان است. اگر بیش از حد شد یا همراه با علائم دیگر بود، بهتر است با دامپزشک مشورت کنید.", tags: ["گربه", "رفتار"] },
    { question: "بهترین سن برای شروع تربیت توله سگ چه زمانی است؟", answer: "می‌توانید از همان هفته‌های اول ورود توله به خانه (حدود ۸ هفتگی) تمرین‌های پایه و ساده را شروع کنید؛ تربیت زودهنگام و مثبت نتیجه بهتری دارد.", tags: ["سگ", "تربیت"] },
    { question: "آیا غذای خشک برای گربه کافی است یا باید غذای تر هم بدهم؟", answer: "ترکیب غذای خشک و تر معمولاً ایده‌آل است؛ غذای تر به تامین آب بدن کمک می‌کند و برای سلامت کلیه و مجاری ادراری مفید است.", tags: ["گربه", "تغذیه"] },
    { question: "چطور بفهمم سگم به واکسیناسیون نیاز دارد؟", answer: "برنامه واکسیناسیون معمولاً از ۶ تا ۸ هفتگی شروع می‌شود و طبق جدول دامپزشک تکرار می‌شود. بهترین راه، پیگیری منظم ویزیت‌های دامپزشکی است.", tags: ["سگ", "سلامت"] },
  ];

  for (const faq of faqs) {
    await prisma.faqEntry.create({ data: faq });
  }

  console.log("Seed data created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
