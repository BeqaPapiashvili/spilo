import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export function getColorHex(colorName: string): string {
  const c = (colorName || "").toLowerCase().trim();
  if (c.includes("black") || c.includes("შავი") || c.includes("obsidian") || c.includes("dark") || c.includes("midnight") || c.includes("corsair")) return "#171717";
  if (c.includes("white") || c.includes("თეთრი") || c.includes("porcelain") || c.includes("frost") || c.includes("lily") || c.includes("cloud")) return "#F8FAFC";
  if (c.includes("desert") || c.includes("gold") || c.includes("ოქროსფერი") || c.includes("sand")) return "#D4B996";
  if (c.includes("titanium gray") || c.includes("natural titanium") || c.includes("grey") || c.includes("ნაცრისფერი") || c.includes("hematite") || c.includes("fog")) return "#8E8E93";
  if (c.includes("silver") || c.includes("ვერცხლისფერი")) return "#E2E8F0";
  if (c.includes("blue") || c.includes("ლურჯი") || c.includes("sky") || c.includes("indigo") || c.includes("icy")) return "#3B82F6";
  if (c.includes("green") || c.includes("მწვანე") || c.includes("sage") || c.includes("olive") || c.includes("mint") || c.includes("pistachio") || c.includes("tendril") || c.includes("jade")) return "#10B981";
  if (c.includes("purple") || c.includes("violet") || c.includes("lavender") || c.includes("იასამნისფერი") || c.includes("moonstone") || c.includes("iris")) return "#A855F7";
  if (c.includes("pink") || c.includes("ვარდისფერი") || c.includes("guava")) return "#EC4899";
  if (c.includes("orange") || c.includes("ფორთოხლისფერი") || c.includes("cosmic orange")) return "#F97316";
  if (c.includes("yellow") || c.includes("ყვითელი")) return "#EAB308";
  if (c.includes("hazel")) return "#8E795B";
  return "#64748B";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const brandParam = searchParams.get("brand");

    const andConditions: any[] = [];

    if (categoryParam) {
      const categories = categoryParam.split(",").map((c) => c.trim()).filter(Boolean);
      if (categories.length > 0) {
        andConditions.push({
          OR: [
            { category: { slug: { in: categories } } },
            { category: { name: { in: categories } } },
            { categoryId: { in: categories } },
          ],
        });
      }
    }

    if (brandParam) {
      const brands = brandParam.split(",").map((b) => b.trim()).filter(Boolean);
      if (brands.length > 0) {
        andConditions.push({
          OR: [
            { brand: { slug: { in: brands } } },
            { brand: { name: { in: brands } } },
            { brandId: { in: brands } },
          ],
        });
      }
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    // 1. Fetch Categories & Brands
    const [allCategories, allBrands, products] = await Promise.all([
      prisma.category.findMany({
        where: { parentId: null },
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, slug: true },
      }),
      prisma.brand.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      }),
      prisma.product.findMany({
        where,
        select: {
          id: true,
          price: true,
          colorName: true,
          storage: true,
          categoryId: true,
          brandId: true,
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
        },
      }),
    ]);

    // 2. Compute dynamic counts
    const categoryCounts: Record<string, number> = {};
    const brandCounts: Record<string, number> = {};
    const colorCounts: Record<string, number> = {};
    const storageCounts: Record<string, number> = {};

    let minPrice = 0;
    let maxPrice = 10000;

    if (products.length > 0) {
      minPrice = Math.floor(Math.min(...products.map((p) => p.price)));
      maxPrice = Math.ceil(Math.max(...products.map((p) => p.price)));
    }

    products.forEach((p) => {
      // Category count
      if (p.category?.name) {
        categoryCounts[p.category.name] = (categoryCounts[p.category.name] || 0) + 1;
      }
      if (p.category?.slug) {
        categoryCounts[p.category.slug] = (categoryCounts[p.category.slug] || 0) + 1;
      }

      // Brand count
      if (p.brand?.name) {
        brandCounts[p.brand.name] = (brandCounts[p.brand.name] || 0) + 1;
      }
      if (p.brand?.slug) {
        brandCounts[p.brand.slug] = (brandCounts[p.brand.slug] || 0) + 1;
      }

      // Color count
      if (p.colorName && p.colorName.trim()) {
        const c = p.colorName.trim();
        colorCounts[c] = (colorCounts[c] || 0) + 1;
      }

      // Storage count
      if (p.storage && p.storage.trim()) {
        const s = p.storage.trim().replace(/\s+/, " ");
        storageCounts[s] = (storageCounts[s] || 0) + 1;
      }
    });

    // Format Colors sorted by count descending
    const colorsList = Object.entries(colorCounts)
      .map(([name, count]) => ({
        name,
        hex: getColorHex(name),
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // Standard storage sort order
    const storageOrder = ["64 GB", "128 GB", "256 GB", "256GB", "512 GB", "1 TB", "2 TB"];
    const storagesList = Object.entries(storageCounts)
      .map(([value, count]) => ({
        value,
        count,
      }))
      .sort((a, b) => {
        const idxA = storageOrder.indexOf(a.value);
        const idxB = storageOrder.indexOf(b.value);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        return a.value.localeCompare(b.value);
      });

    const categoriesList = allCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      count: categoryCounts[c.name] || categoryCounts[c.slug] || 0,
    }));

    const brandsList = allBrands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      count: brandCounts[b.name] || brandCounts[b.slug] || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        categories: categoriesList,
        brands: brandsList,
        colors: colorsList,
        storages: storagesList,
        price: { min: minPrice, max: maxPrice },
        totalProducts: products.length,
      },
    });
  } catch (error: any) {
    console.error("GET /api/products/filters error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch filters" },
      { status: 500 }
    );
  }
}
