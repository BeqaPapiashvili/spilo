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

  // Ensure photo-video and mobiles exist
  await prisma.category.upsert({
    where: { id: "photo-video" },
    update: { name: "ფოტო & ვიდეო", slug: "photo-video" },
    create: { id: "photo-video", name: "ფოტო & ვიდეო", slug: "photo-video", icon: "Camera" },
  });

  await prisma.category.upsert({
    where: { id: "mobiles" },
    update: { name: "მობილურები", slug: "mobiles" },
    create: { id: "mobiles", name: "მობილურები", slug: "mobiles", icon: "Smartphone" },
  });

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
      categoryId: "mobiles",
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

  // 7. Seed Reviews
  const reviewsData = [
    {
      id: "rev-1",
      productId: "dji-neo",
      author: "გიორგი მაისურაძე",
      rating: 5,
      comment: "შესანიშნავი დრონია! ძალიან მარტივი სამართავია და გადაღების ხარისხი 4K-ში უმაღლესია.",
      verifiedPurchase: true,
      likes: 12,
    },
    {
      id: "rev-2",
      productId: "iphone-16-pro-max",
      author: "ნინო ჩხეიძე",
      rating: 5,
      comment: "Desert Titanium ფერი ულამაზესია. ელემენტი მთელი 2 დღე ძლებს, კამერა საოცრებაა!",
      verifiedPurchase: true,
      likes: 24,
    },
  ];

  for (const rev of reviewsData) {
    await prisma.review.upsert({
      where: { id: rev.id },
      update: rev,
      create: rev,
    });
  }
  console.log("✅ Seeded Reviews");

  // 8. Seed Product Variants
  const variantsData = [
    {
      id: "var-ip16pm-desert-256",
      productId: "iphone-16-pro-max",
      name: "ფერი",
      type: "color",
      label: "Desert Titanium",
      value: "desert-titanium",
      colorHex: "#D4B996",
      priceModifier: 0,
      stock: 5,
      sku: "IP16PM-DT-256",
    },
    {
      id: "var-ip16pm-black-256",
      productId: "iphone-16-pro-max",
      name: "ფერი",
      type: "color",
      label: "Black Titanium",
      value: "black-titanium",
      colorHex: "#3C3B37",
      priceModifier: 0,
      stock: 3,
      sku: "IP16PM-BT-256",
    },
    {
      id: "var-ip16pm-natural-512",
      productId: "iphone-16-pro-max",
      name: "მეხსიერება",
      type: "text",
      label: "512 GB",
      value: "512gb",
      priceModifier: 600,
      stock: 4,
      sku: "IP16PM-NT-512",
    },
  ];

  for (const v of variantsData) {
    await prisma.productVariant.upsert({
      where: { id: v.id },
      update: v,
      create: v,
    });
  }
  console.log("✅ Seeded Product Variants");

  // 9. Seed System Settings
  const defaultSettings = [
    { key: "storeName", value: "Spilo E-Commerce" },
    { key: "contactEmail", value: "info@spilo.ge" },
    { key: "contactPhone", value: "+995 32 2 00 00 00" },
    { key: "address", value: "თბილისი, ჭავჭავაძის გამზირი #34" },
    { key: "freeShippingThreshold", value: "100" },
    { key: "standardDeliveryFee", value: "5" },
    { key: "expressDeliveryFee", value: "15" },
    { key: "regionsDeliveryFee", value: "10" },
  ];

  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("✅ Seeded System Settings");

  // 10. Seed Granular Storefront Sections
  await prisma.storefrontSection.deleteMany();

  const granularSections = [
    {
      key: "hero_banner",
      type: "HERO_BANNER",
      title: "Hero Banner Carousel (მთავარი ბანერები)",
      subtitle: "სლაიდერი აქციებისა და შეთავაზებებისთვის",
      isEnabled: true,
      sortOrder: 0,
      config: {
        autoplay: true,
        interval: 5000,
        heroSlides: [
          {
            id: "hero-1",
            image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1400&q=80",
            badge: "სპეციალური შეთავაზება",
            title: "იპოვე იდეალური საჩუქარი ყველასთვის",
            subtitle: "შეარჩიე, შეფუთე, გაუგზავნე საჩუქარი მარტივად spilo-თი",
            buttonText: "შეარჩიე საჩუქარი",
            link: "/catalog",
          },
          {
            id: "hero-2",
            image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1400&q=80",
            badge: "Next-Gen Gaming",
            title: "PlayStation 5 & VR2 ექსკლუზივი",
            subtitle: "საუკეთესო ფასები და 0% განვადება წამყვან ბანკებში",
            buttonText: "გეიმინგ კატალოგი",
            link: "/catalog?category=gaming",
          },
          {
            id: "hero-3",
            image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1400&q=80",
            badge: "Apple Official",
            title: "iPhone 16 Pro & Apple Intelligence",
            subtitle: "ტიტანის კორპუსი და პროფესიონალური კამერის სისტემა",
            buttonText: "აღმოაჩინე",
            link: "/catalog?brand=apple",
          },
        ],
      },
    },
    {
      key: "categories_grid",
      type: "CATEGORY_GRID",
      title: "Category Cards Carousel (კატეგორიები)",
      subtitle: "სწრაფი ნავიგაციის კატეგორიების ბარათები",
      isEnabled: true,
      sortOrder: 1,
      config: { limit: 8 },
    },
    {
      key: "dji_products",
      type: "PRODUCT_CAROUSEL",
      title: "DJI ტექნიკა & აქსესუარები",
      subtitle: "პროფესიონალური დრონები და სტაბილიზატორები",
      isEnabled: true,
      sortOrder: 2,
      config: { brand: "dji", categoryId: "photo-video", limit: 8, targetLink: "/catalog?category=photo-video" },
    },
    {
      key: "promo_cards",
      type: "PROMO_CAROUSEL",
      title: "სპეციალური შეთავაზებები (Promo Cards)",
      subtitle: "აქციები და ფასდაკლების ბარათები",
      isEnabled: true,
      sortOrder: 3,
      config: {
        promoCards: [
          {
            id: "pc-1",
            title: "ტანსაცმელი & ფეხსაცმელი",
            badge: "40%-მდე",
            bgColor: "#FFC5E3",
            bgImageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
            link: "/catalog",
          },
          {
            id: "pc-2",
            title: "აუდიოტექნიკა",
            badge: "40%-მდე",
            bgColor: "#E2D9FF",
            bgImageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80",
            link: "/catalog?category=audio",
          },
          {
            id: "pc-3",
            title: "ქართული ბრენდები",
            badge: "40%-მდე",
            bgColor: "#FFE6C7",
            bgImageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
            link: "/catalog",
          },
        ],
      },
    },
    {
      key: "mobile_products",
      type: "PRODUCT_CAROUSEL",
      title: "სმარტფონები & აქსესუარები",
      subtitle: "უახლესი ფლაგმანური სმარტფონები ოფიციალური გარანტიით",
      isEnabled: true,
      sortOrder: 4,
      config: { categoryId: "mobiles", limit: 8, targetLink: "/catalog?category=mobiles" },
    },
    {
      key: "apple_promo_banner",
      type: "BANNER",
      title: "iPhone 16 Pro Series",
      subtitle: "ტიტანის კორპუსი, A18 Pro ჩიპი და ინოვაციური კამერის მართვა. 0%-იანი ონლაინ განვადებით.",
      isEnabled: true,
      sortOrder: 5,
      config: {
        tagText: "Apple Flagship",
        buttonText: "ყიდვა",
        bannerUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1400&q=80",
        link: "/catalog",
      },
    },
    {
      key: "laptop_products",
      type: "PRODUCT_CAROUSEL",
      title: "ლეპტოპები & კომპიუტერები",
      subtitle: "სამუშაო და გეიმინგ ლეპტოპები საუკეთესო ფასად",
      isEnabled: true,
      sortOrder: 6,
      config: { categoryId: "laptops", limit: 8, targetLink: "/catalog?category=laptops" },
    },
    {
      key: "ps5_promo_banner",
      type: "BANNER",
      title: "PlayStation 5 Slim & DualSense",
      subtitle: "ჩაერთე გეიმინგის ახალ ეპოქაში. 4K 120Hz გრაფიკა და ულტრა-სწრაფი SSD.",
      isEnabled: true,
      sortOrder: 7,
      config: {
        tagText: "Next-Gen Gaming",
        buttonText: "კონსოლების ნახვა",
        bannerUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1400&q=80",
        link: "/catalog",
      },
    },
    {
      key: "brands_carousel",
      type: "BRAND_GRID",
      title: "ოფიციალური ბრენდები",
      subtitle: "მსოფლიო დონის მწარმოებლები ოფიციალური გარანტიით",
      isEnabled: true,
      sortOrder: 8,
      config: {},
    },
    {
      key: "recently_viewed",
      type: "RECENTLY_VIEWED",
      title: "Recently Viewed (ბოლოს ნანახი)",
      subtitle: "მომხმარებლის მიერ ბოლოს დათვალიერებული ნივთები",
      isEnabled: true,
      sortOrder: 9,
      config: {},
    },
    {
      key: "trust_strip",
      type: "TRUST_STRIP",
      title: "Spilo გარანტია & სერვისები",
      subtitle: "სწრაფი მიწოდება, ოფიციალური გარანტია, 0% განვადება და სასაჩუქრე შეფუთვა",
      isEnabled: true,
      sortOrder: 10,
      config: {
        trustItems: [
          {
            id: "trust-1",
            icon: "Truck",
            title: "სწრაფი მიწოდება",
            subtitle: "უფასოდ მთელ საქართველოში",
            link: "/page/delivery",
            iconColor: "#2563eb",
          },
          {
            id: "trust-2",
            icon: "ShieldCheck",
            title: "ოფიციალური გარანტია",
            subtitle: "100% ორიგინალი პროდუქცია",
            link: "/page/warranty",
            iconColor: "#16a34a",
          },
          {
            id: "trust-3",
            icon: "CreditCard",
            title: "0% განვადება",
            subtitle: "ყველა წამყვან ბანკში",
            link: "/page/installments",
            iconColor: "#d97706",
          },
          {
            id: "trust-4",
            icon: "Sparkles",
            title: "სასაჩუქრე შეფუთვა",
            subtitle: "უფასო შეფუთვა და ბარათი",
            link: "/catalog",
            iconColor: "#9333ea",
          },
        ],
      },
    },
  ];

  for (const sec of granularSections) {
    await prisma.storefrontSection.create({
      data: {
        key: sec.key,
        type: sec.type,
        title: sec.title,
        subtitle: sec.subtitle,
        isEnabled: sec.isEnabled,
        sortOrder: sec.sortOrder,
        config: sec.config,
      },
    });
  }
  console.log("✅ Seeded Granular Storefront Sections");

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
