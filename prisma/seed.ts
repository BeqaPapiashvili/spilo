import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";
import { CATEGORIES_DATA } from "../src/data/categories";

const connectionString = process.env.DATABASE_URL || "mysql://root:@127.0.0.1:3306/spilo_db";
const adapter = new PrismaMariaDb(connectionString);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting MySQL Database Seed for Spilo.ge...");

  // 1. Seed Featured Brands
  const brandsData = [
    { id: "dji", name: "DJI", slug: "dji", logo: "https://veli.store/media-cdn/__sized__/brand/dji_logo-thumbnail-100x100-95.png" },
    { id: "apple", name: "Apple", slug: "apple", logo: "https://veli.store/media-cdn/__sized__/brand/apple_logo-thumbnail-100x100-95.png" },
    { id: "samsung", name: "Samsung", slug: "samsung", logo: "https://veli.store/media-cdn/__sized__/brand/samsung_logo-thumbnail-100x100-95.png" },
    { id: "sony", name: "Sony", slug: "sony", logo: "https://veli.store/media-cdn/__sized__/brand/sony_logo-thumbnail-100x100-95.png" },
    { id: "asus", name: "ASUS", slug: "asus", logo: "https://veli.store/media-cdn/__sized__/brand/asus_logo-thumbnail-100x100-95.png" },
    { id: "marshall", name: "Marshall", slug: "marshall", logo: "https://veli.store/media-cdn/__sized__/brand/marshall_logo-thumbnail-100x100-95.png" },
    { id: "jbl", name: "JBL", slug: "jbl", logo: "https://veli.store/media-cdn/__sized__/brand/jbl_logo-thumbnail-100x100-95.png" },
    { id: "xiaomi", name: "Xiaomi", slug: "xiaomi", logo: "https://veli.store/media-cdn/__sized__/brand/xiaomi_logo-thumbnail-100x100-95.png" },
  ];

  for (const b of brandsData) {
    await prisma.brand.upsert({
      where: { id: b.id },
      update: { name: b.name, slug: b.slug, logo: b.logo },
      create: b,
    });
  }
  console.log("✅ Seeded Brands");

  // 2. Seed Main Categories from CATEGORIES_DATA
  for (const c of CATEGORIES_DATA) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: { 
        name: c.name, 
        slug: c.slug, 
        icon: c.icon, 
        childrenJson: c.children ? JSON.stringify(c.children) : null 
      },
      create: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        childrenJson: c.children ? JSON.stringify(c.children) : null,
      },
    });
  }
  console.log("✅ Seeded Categories");

  // 3. Seed Products
  const productsData = [
    {
      id: "dji-neo",
      title: "დრონი DJI Neo Drone Gray",
      slug: "dji-neo-drone-gray",
      sku: "DJI-NEO-001",
      description: "პორტატული და ულტრა-მსუბუქი დრონი 4K Ultra HD ვიდეო გადაღებით და AI სმარტ თრექინგით.",
      price: 799,
      discountPrice: 699,
      discountPercentage: 12,
      monthlyInstallment: 28,
      stock: 15,
      categoryId: "photo-video",
      brandId: "dji",
      images: ["https://veli.store/media-cdn/__sized__/product/DJI_Neo_Drone-1-thumbnail-200x200-95.jpeg"],
      isFeatured: true,
      isFlashDeal: true,
    },
    {
      id: "iphone-16-pro-max",
      title: "სმარტფონი Apple iPhone 16 Pro Max 256GB Desert Titanium",
      slug: "apple-iphone-16-pro-max-256gb-desert-titanium",
      sku: "APL-IP16PM-256",
      description: "ფლაგმანური iPhone 16 Pro Max ტიტანის კორპუსით, A18 Pro ჩიპით და კამერის მართვის ინოვაციური ღილაკით.",
      price: 4899,
      discountPrice: 4399,
      discountPercentage: 10,
      monthlyInstallment: 175,
      stock: 8,
      categoryId: "mobiles",
      brandId: "apple",
      images: ["https://veli.store/media-cdn/__sized__/product/Apple_iPhone_16_Pro_Desert_Titanium_1-thumbnail-200x200-95.png"],
      isFeatured: true,
      isFlashDeal: true,
    },
    {
      id: "macbook-pro-16",
      title: 'ლეპტოპი Apple MacBook Pro 16" M3 Max / 36GB / 1TB Space Black',
      slug: "apple-macbook-pro-16-m3-max-36gb-1tb-space-black",
      sku: "APL-MBP16-M3MAX",
      description: "პროფესიონალური MacBook Pro 16 M3 Max პროცესორით, Liquid Retina XDR ეკრანით და ულტრა-სწრაფი 1TB SSD-ით.",
      price: 11499,
      discountPrice: 9999,
      discountPercentage: 13,
      monthlyInstallment: 400,
      stock: 5,
      categoryId: "laptops",
      brandId: "apple",
      images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80"],
      isFeatured: true,
      isFlashDeal: false,
    },
    {
      id: "ps5-slim-digital",
      title: "თამაშების კონსოლი Sony PlayStation 5 Slim Digital Edition White",
      slug: "sony-playstation-5-slim-digital-edition-white",
      sku: "SNY-PS5-SLIM-DIG",
      description: "ახალი თაობის სათამაშო კონსოლი 4K 120Hz გრაფიკით, 1TB ultra-high speed SSD-ით და DualSense ტრიგერებით.",
      price: 1799,
      discountPrice: 1499,
      discountPercentage: 17,
      monthlyInstallment: 60,
      stock: 12,
      categoryId: "gaming",
      brandId: "sony",
      images: ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&q=80"],
      isFeatured: true,
      isFlashDeal: true,
    },
    {
      id: "marshall-stanmore-3",
      title: "აკუსტიკური სისტემა Marshall Stanmore III Bluetooth Speaker Black",
      slug: "marshall-stanmore-iii-bluetooth-speaker-black",
      sku: "MSH-STAN3-BLK",
      description: "ლეგენდარული Marshall-ის აკუსტიკური დინამიკი სუფთა ბასებით და ვინტაჟური დიზაინით.",
      price: 1499,
      discountPrice: 1299,
      discountPercentage: 13,
      monthlyInstallment: 52,
      stock: 10,
      categoryId: "audio-systems",
      brandId: "marshall",
      images: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80"],
      isFeatured: true,
      isFlashDeal: false,
    },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }
  console.log("✅ Seeded Products");

  // 4. Seed Admin Users
  await prisma.adminUser.upsert({
    where: { email: "admin@spilo.ge" },
    update: { password: "admin123" },
    create: {
      name: "Admin User",
      email: "admin@spilo.ge",
      password: "admin123",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  await prisma.adminUser.upsert({
    where: { email: "beka@spilo.ge" },
    update: { password: "admin123" },
    create: {
      name: "Beka Papiashvili",
      email: "beka@spilo.ge",
      password: "admin123",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  await prisma.adminUser.upsert({
    where: { email: "nino@spilo.ge" },
    update: {},
    create: {
      name: "Nino Beridze",
      email: "nino@spilo.ge",
      role: "STORE_MANAGER",
      status: "ACTIVE",
    },
  });
  console.log("✅ Seeded Admin Users");

  // 5. Seed Sample Customer User
  await prisma.user.upsert({
    where: { phone: "995551008897" },
    update: {},
    create: {
      phone: "995551008897",
      email: "papicha@gmail.com",
      name: "ბექა პაპიაშვილი",
      role: "CUSTOMER",
    },
  });
  console.log("✅ Seeded Sample Customer User");

  console.log("🎉 MySQL Seed Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
