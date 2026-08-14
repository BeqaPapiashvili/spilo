import { NextResponse } from "next/server";
import { PRODUCTS_DATA } from "@/data/products";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase() || "";
    const category = searchParams.get("category")?.toLowerCase() || "";
    const brand = searchParams.get("brand")?.toLowerCase() || "";
    const minPrice = Number(searchParams.get("minPrice")) || 0;
    const maxPrice = Number(searchParams.get("maxPrice")) || 999999;

    const filtered = PRODUCTS_DATA.filter((p) => {
      const matchesQuery = !query || p.title.toLowerCase().includes(query) || (p.brandName && p.brandName.toLowerCase().includes(query));
      const matchesCategory = !category || p.categoryId?.toLowerCase() === category;
      const matchesBrand = !brand || p.brandName?.toLowerCase() === brand;
      const currentPrice = p.discountPrice || p.price;
      const matchesPrice = currentPrice >= minPrice && currentPrice <= maxPrice;

      return matchesQuery && matchesCategory && matchesBrand && matchesPrice;
    });

    return NextResponse.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
