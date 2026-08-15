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
      price: 4599,
      discountPrice: 4299,
      discountPercentage: 6,
      monthlyInstallment: 172,
      stock: 8,
      categoryId: "phones",
      brandId: "apple",
      images: ["https://veli.store/media-cdn/__sized__/product/iPhone_16_Pro_Max_Desert_Titanium_PDP_Image_Position_1__en-US_1-thumbnail-200x200-95.jpg"],
      isFeatured: true,
      isFlashDeal: true,
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
  console.log("✅ Seeded Admin Users");

  // 5. Seed Installment Options
  const installmentOptions = [
    { bankName: "თიბისი ბანკი", bankCode: "TBC_INST_9921", months: 12, ratePercent: 0, isActive: true },
    { bankName: "საქართველოს ბანკი (BOG)", bankCode: "BOG_INST_4402", months: 12, ratePercent: 0, isActive: true },
    { bankName: "კრედო ბანკი", bankCode: "CREDO_INST_1109", months: 12, ratePercent: 0, isActive: true },
    { bankName: "Space Bank", bankCode: "SPACE_TOP_CARD_882", months: 12, ratePercent: 0, isActive: true },
  ];

  for (const inst of installmentOptions) {
    await prisma.installmentOption.upsert({
      where: { bankCode: inst.bankCode },
      update: inst,
      create: inst,
    });
  }
  console.log("✅ Seeded Installment Options");

  // 6. Seed Delivery Zones
  const deliveryZones = [
    { id: "del-tb", title: "თბილისი - სტანდარტული მიწოდება", price: 5, estimatedDays: "1 სამუშაო დღე", isActive: true },
    { id: "del-reg", title: "რეგიონები - საკურიერო მიწოდება", price: 10, estimatedDays: "2-3 სამუშაო დღე", isActive: true },
  ];

  for (const del of deliveryZones) {
    await prisma.deliveryZone.upsert({
      where: { id: del.id },
      update: del,
      create: del,
    });
  }
  console.log("✅ Seeded Delivery Zones");

  // 7. Seed System Settings
  const defaultSettings = [
    { key: "site_name", value: "Spilo.ge" },
    { key: "support_phone", value: "+995 32 2 00 00 00" },
    { key: "support_email", value: "info@spilo.ge" },
    { key: "free_shipping_threshold", value: "100" },
  ];

  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("✅ Seeded System Settings");

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
