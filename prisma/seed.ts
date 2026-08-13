import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Categories
  const categoryTech = await prisma.category.upsert({
    where: { slug: 'tech' },
    update: {},
    create: {
      name: 'ტექნიკა',
      slug: 'tech',
    },
  });

  const categoryBeauty = await prisma.category.upsert({
    where: { slug: 'beauty' },
    update: {},
    create: {
      name: 'სილამაზე & მოვლა',
      slug: 'beauty',
    },
  });

  // Create Brands
  const brandAriete = await prisma.brand.create({
    data: {
      name: 'Ariete',
    },
  });

  const brandDreame = await prisma.brand.create({
    data: {
      name: 'Dreame',
    },
  });
  
  const brandJonr = await prisma.brand.create({
    data: {
      name: 'Jonr',
    },
  });

  const brandKarcher = await prisma.brand.create({
    data: {
      name: 'Karcher',
    },
  });
  
  const brandDJI = await prisma.brand.create({
    data: {
      name: 'DJI',
    },
  });

  // Create Products
  const products = [
    {
      title: 'ელექტრო ცოცხი Ariete 2764 Evo 2-In-1 Bagless Corded Electric Broom',
      slug: 'ariete-2764-evo',
      description: 'Ariete-ს ინოვაციური ელექტრო ცოცხი 2 1-ში, იდეალურია ყოველდღიური დასუფთავებისთვის.',
      price: 279.0,
      discountPrice: 223.0,
      monthlyInstallment: 9,
      stock: 50,
      categoryId: categoryTech.id,
      brandId: brandAriete.id,
      images: ['https://via.placeholder.com/200'],
    },
    {
      title: 'ხელის მტვერსასრუტი Dreame T10 Cordless Vacuum Cleaner Silver',
      slug: 'dreame-t10',
      description: 'მძლავრი და მსუბუქი უკაბელო მტვერსასრუტი Dreame T10.',
      price: 899.0,
      discountPrice: 719.0,
      monthlyInstallment: 29,
      stock: 20,
      categoryId: categoryTech.id,
      brandId: brandDreame.id,
      images: ['https://via.placeholder.com/200'],
    },
    {
      title: 'ხელის მტვერსასრუტი Ariete 2759 Electric Broom And Handheld Vacuum',
      slug: 'ariete-2759',
      description: 'მოსახერხებელი 2 1-ში მტვერსასრუტი Ariete-სგან.',
      price: 399.0,
      discountPrice: 319.0,
      monthlyInstallment: 13,
      stock: 15,
      categoryId: categoryTech.id,
      brandId: brandAriete.id,
      images: ['https://via.placeholder.com/200'],
    },
    {
      title: 'ხელის მტვერსასრუტი Jonr Cordless Vacuum ED 12 Pro Max',
      slug: 'jonr-ed-12-pro-max',
      description: 'უმაღლესი კლასის მტვერსასრუტი დიდი სახლებისთვის.',
      price: 1599.0,
      discountPrice: 1279.0,
      monthlyInstallment: 51,
      stock: 5,
      categoryId: categoryTech.id,
      brandId: brandJonr.id,
      images: ['https://via.placeholder.com/200'],
    },
    {
      title: 'ხელის მტვერსასრუტი Karcher VC7 Signature Line Handheld Vacuum',
      slug: 'karcher-vc7',
      description: 'გერმანული ხარისხის სტანდარტი Karcher-ისგან.',
      price: 1799.0,
      discountPrice: 1439.0,
      monthlyInstallment: 58,
      stock: 8,
      categoryId: categoryTech.id,
      brandId: brandKarcher.id,
      images: ['https://via.placeholder.com/200'],
    },
    {
      title: 'ყავის აპარატი Ariete 1389 Vintage Espresso Machine Blue',
      slug: 'ariete-1389-vintage',
      description: 'ვინტაჟური დიზაინის ესპრესოს აპარატი.',
      price: 539.0,
      discountPrice: 404.0,
      monthlyInstallment: 16,
      stock: 12,
      categoryId: categoryTech.id,
      brandId: brandAriete.id,
      images: ['https://via.placeholder.com/200'],
    },
    {
      title: 'DJI Neo DJI-NEO100 Drone White',
      slug: 'dji-neo-drone',
      description: 'ულტრა მსუბუქი და კომპაქტური დრონი 4K ვიდეოთი.',
      price: 809.0,
      discountPrice: 749.0,
      monthlyInstallment: 30,
      stock: 10,
      categoryId: categoryTech.id,
      brandId: brandDJI.id,
      images: ['https://via.placeholder.com/200'],
    }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
