import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@craftorganic.kg" },
    update: {},
    create: {
      email: "admin@craftorganic.kg",
      password: adminPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create seller
  const sellerPassword = await bcrypt.hash("seller123", 12);
  const seller = await prisma.user.upsert({
    where: { email: "seller@craftorganic.kg" },
    update: {},
    create: {
      email: "seller@craftorganic.kg",
      password: sellerPassword,
      name: "Айбек Усталар",
      role: "SELLER",
    },
  });
  console.log("✅ Seller user created:", seller.email);

  // Create buyer
  const buyerPassword = await bcrypt.hash("buyer123", 12);
  const buyer = await prisma.user.upsert({
    where: { email: "buyer@craftorganic.kg" },
    update: {},
    create: {
      email: "buyer@craftorganic.kg",
      password: buyerPassword,
      name: "Нурзат Покупатель",
      role: "BUYER",
    },
  });
  console.log("✅ Buyer user created:", buyer.email);

  // Categories
  const categories = [
    {
      slug: "honey",
      translations: [
        { locale: "ru", name: "Мёд", description: "Натуральный горный мёд" },
        { locale: "en", name: "Honey", description: "Natural mountain honey" },
        { locale: "kg", name: "Бал", description: "Табигый тоо балы" },
      ],
    },
    {
      slug: "felt",
      translations: [
        { locale: "ru", name: "Войлок", description: "Изделия из войлока" },
        { locale: "en", name: "Felt Products", description: "Handmade felt crafts" },
        { locale: "kg", name: "Кийиз", description: "Кийизден жасалган буюмдар" },
      ],
    },
    {
      slug: "dairy",
      translations: [
        { locale: "ru", name: "Молочные продукты", description: "Курут, айран, кымыз" },
        { locale: "en", name: "Dairy", description: "Kurt, ayran, kumis" },
        { locale: "kg", name: "Сүт азыктары", description: "Курут, айран, кымыз" },
      ],
    },
    {
      slug: "herbs",
      translations: [
        { locale: "ru", name: "Травы и чай", description: "Горные травы и чаи" },
        { locale: "en", name: "Herbs & Tea", description: "Mountain herbs and teas" },
        { locale: "kg", name: "Чөптөр жана чай", description: "Тоо чөптөрү жана чайлары" },
      ],
    },
    {
      slug: "textiles",
      translations: [
        { locale: "ru", name: "Текстиль", description: "Ручной текстиль" },
        { locale: "en", name: "Textiles", description: "Handmade textiles" },
        { locale: "kg", name: "Текстиль", description: "Колдон жасалган текстиль" },
      ],
    },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        slug: cat.slug,
        translations: { create: cat.translations },
      },
    });
    createdCategories.push(created);
    console.log(`✅ Category: ${cat.slug}`);
  }

  // Products
  const products = [
    {
      slug: "mountain-honey-1kg",
      price: 800,
      stock: 50,
      categorySlug: "honey",
      images: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80"],
      translations: [
        { locale: "ru", name: "Горный мёд 1кг", description: "Натуральный горный мёд из Иссык-Кульской области. Собран на альпийских лугах." },
        { locale: "en", name: "Mountain Honey 1kg", description: "Natural mountain honey from Issyk-Kul region. Collected from alpine meadows." },
        { locale: "kg", name: "Тоо балы 1кг", description: "Ысык-Көл облусунун табигый тоо балы. Альпи жайыттарынан чогултулган." },
      ],
    },
    {
      slug: "felt-slippers-handmade",
      price: 1500,
      stock: 30,
      categorySlug: "felt",
      images: ["https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80"],
      translations: [
        { locale: "ru", name: "Войлочные тапочки ручной работы", description: "Тёплые тапочки из натурального войлока с кыргызским орнаментом." },
        { locale: "en", name: "Handmade Felt Slippers", description: "Warm slippers from natural felt with Kyrgyz ornament." },
        { locale: "kg", name: "Кийизден жасалган тапочкалар", description: "Кыргыз оймо-чиймеси менен табигый кийизден жасалган жылуу тапочкалар." },
      ],
    },
    {
      slug: "kurt-dried-cheese",
      price: 350,
      stock: 100,
      categorySlug: "dairy",
      images: ["https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&q=80"],
      translations: [
        { locale: "ru", name: "Курут (сушёный сыр)", description: "Традиционный курут из козьего молока." },
        { locale: "en", name: "Kurt (Dried Cheese)", description: "Traditional kurt from goat milk." },
        { locale: "kg", name: "Курут", description: "Эчки сүтүнөн жасалган салттуу курут." },
      ],
    },
    {
      slug: "mountain-herbal-tea",
      price: 450,
      stock: 75,
      categorySlug: "herbs",
      images: ["https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&q=80"],
      translations: [
        { locale: "ru", name: "Горный травяной чай", description: "Сбор горных трав: чабрец, зверобой, мята. 100г." },
        { locale: "en", name: "Mountain Herbal Tea", description: "Mountain herb collection: thyme, St. John's wort, mint. 100g." },
        { locale: "kg", name: "Тоо чөп чайы", description: "Тоо чөптөрүнүн жыйнагы: тимьян, сары чай, жалбыз. 100г." },
      ],
    },
    {
      slug: "shyrdak-felt-rug",
      price: 5000,
      stock: 10,
      categorySlug: "felt",
      images: ["https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&q=80"],
      translations: [
        { locale: "ru", name: "Шырдак (войлочный ковёр)", description: "Традиционный кыргызский шырдак ручной работы. 150x200 см." },
        { locale: "en", name: "Shyrdak Felt Rug", description: "Traditional Kyrgyz handmade shyrdak. 150x200 cm." },
        { locale: "kg", name: "Шырдак", description: "Кыргыздын салттуу колдон жасалган шырдагы. 150x200 см." },
      ],
    },
    {
      slug: "wild-flower-honey",
      price: 650,
      stock: 40,
      categorySlug: "honey",
      images: ["https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80"],
      translations: [
        { locale: "ru", name: "Мёд из диких цветов 500г", description: "Ароматный мёд из полевых цветов Чуйской долины." },
        { locale: "en", name: "Wild Flower Honey 500g", description: "Aromatic honey from wildflowers of Chuy Valley." },
        { locale: "kg", name: "Жапайы гүл балы 500г", description: "Чүй өрөөнүнүн талаа гүлдөрүнөн жасалган жыттуу бал." },
      ],
    },
  ];

  for (const prod of products) {
    const category = createdCategories.find(
      (c) => c.slug === prod.categorySlug
    );
    if (!category) continue;

    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        images: JSON.stringify(prod.images ?? []),
      },
      create: {
        slug: prod.slug,
        price: prod.price,
        stock: prod.stock,
        sellerId: seller.id,
        categoryId: category.id,
        images: JSON.stringify(prod.images ?? []),
        translations: { create: prod.translations },
      },
    });
    console.log(`✅ Product: ${prod.slug}`);
  }

  console.log("\n🎉 Seed completed!\n");
  console.log("Test accounts:");
  console.log("  Admin:  admin@craftorganic.kg / admin123");
  console.log("  Seller: seller@craftorganic.kg / seller123");
  console.log("  Buyer:  buyer@craftorganic.kg / buyer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
