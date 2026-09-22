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

    const storefrontWhere = {
      AND: [...andConditions, { status: { not: "PENDING_REVIEW" } }],
    };

    const [allCategories, allBrands, categoryGroups, brandGroups, colorGroups, storageGroups, priceAgg] =
      await Promise.all([
        prisma.category.findMany({
          where: { parentId: null },
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true, slug: true },
        }),
        prisma.brand.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
        }),
        prisma.product.groupBy({
          by: ["categoryId"],
          where: storefrontWhere,
          _count: { _all: true },
        }),
        prisma.product.groupBy({
          by: ["brandId"],
          where: storefrontWhere,
          _count: { _all: true },
        }),
        prisma.product.groupBy({
          by: ["colorName"],
          where: { AND: [storefrontWhere, { colorName: { not: null } }] },
          _count: { _all: true },
        }),
        prisma.product.groupBy({
          by: ["storage"],
          where: { AND: [storefrontWhere, { storage: { not: null } }] },
          _count: { _all: true },
        }),
        prisma.product.aggregate({
          where: storefrontWhere,
          _min: { price: true },
          _max: { price: true },
          _count: { _all: true },
        }),
      ]);

    const categoryCountById = Object.fromEntries(
      categoryGroups.map((g) => [g.categoryId, g._count._all])
    );
    const brandCountById = Object.fromEntries(brandGroups.map((g) => [g.brandId, g._count._all]));

    const colorCounts: Record<string, number> = {};
    colorGroups.forEach((g) => {
      if (g.colorName) colorCounts[g.colorName.trim()] = g._count._all;
    });

    const storageCounts: Record<string, number> = {};
    storageGroups.forEach((g) => {
      if (g.storage) storageCounts[g.storage.trim().replace(/\s+/, " ")] = g._count._all;
    });

    const minPrice = Math.floor(priceAgg._min.price ?? 0);
    const maxPrice = Math.ceil(priceAgg._max.price ?? 10000);

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
      count: categoryCountById[c.id] || 0,
    }));

    const brandsList = allBrands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      count: brandCountById[b.id] || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        categories: categoriesList,
        brands: brandsList,
        colors: colorsList,
        storages: storagesList,
        price: { min: minPrice, max: maxPrice },
        totalProducts: priceAgg._count._all,
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
