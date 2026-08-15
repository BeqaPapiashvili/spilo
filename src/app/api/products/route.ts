import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("search") || "";
    const categoryParam = searchParams.get("category");
    const brandParam = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const inStock = searchParams.get("inStock") === "true";
    const onlyDiscounted = searchParams.get("discount") === "true";
    const isFeatured = searchParams.get("featured") === "true";
    const isFlashDeal = searchParams.get("flash") === "true";
    const sort = searchParams.get("sort") || "default";

    // Build Prisma Where Clause
    const where: any = {};

    if (query.trim()) {
      where.OR = [
        { title: { contains: query.trim() } },
        { description: { contains: query.trim() } },
        { sku: { contains: query.trim() } },
      ];
    }

    if (categoryParam) {
      const categories = categoryParam.split(",").filter(Boolean);
      if (categories.length > 0) {
        where.category = {
          slug: { in: categories },
        };
      }
    }

    if (brandParam) {
      const brands = brandParam.split(",").filter(Boolean);
      if (brands.length > 0) {
        where.brand = {
          slug: { in: brands },
        };
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (inStock) {
      where.stock = { gt: 0 };
    }

    if (onlyDiscounted) {
      where.discountPrice = { not: null };
    }

    if (isFeatured) {
      where.isFeatured = true;
    }

    if (isFlashDeal) {
      where.isFlashDeal = true;
    }

    // Build Sorting
    let orderBy: any = { createdAt: "desc" };

    if (sort === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sort === "discount") {
      orderBy = { discountPercentage: "desc" };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        brand: true,
      },
    });

    // Format products for frontend consumption
    const formattedProducts = products.map((p: any) => {
      let imageList: string[] = [];
      try {
        imageList = typeof p.images === "string" ? JSON.parse(p.images) : (p.images as string[]);
      } catch {
        imageList = ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"];
      }

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        sku: p.sku,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice || undefined,
        discountPercentage: p.discountPercentage || undefined,
        monthlyInstallment: p.monthlyInstallment || undefined,
        stock: p.stock,
        categoryId: p.categoryId,
        categoryName: p.category?.name,
        brandId: p.brandId,
        brandName: p.brand?.name,
        image: imageList[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
        images: imageList,
        specs: p.specs || undefined,
        isFeatured: p.isFeatured,
        isFlashDeal: p.isFlashDeal,
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedProducts.length,
      data: formattedProducts,
    });
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products from MySQL" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newProduct = await prisma.product.create({
      data: {
        title: body.title,
        slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        sku: body.sku || `SP-${Date.now()}`,
        description: body.description || "",
        price: Number(body.price),
        discountPrice: body.discountPrice ? Number(body.discountPrice) : null,
        discountPercentage: body.discountPercentage ? Number(body.discountPercentage) : null,
        monthlyInstallment: body.monthlyInstallment ? Number(body.monthlyInstallment) : null,
        stock: body.stock !== undefined ? Number(body.stock) : 10,
        categoryId: body.categoryId,
        brandId: body.brandId,
        images: Array.isArray(body.images) ? body.images : [body.image || ""],
        specs: body.specs || null,
        isFeatured: Boolean(body.isFeatured),
        isFlashDeal: Boolean(body.isFlashDeal),
      },
    });

    return NextResponse.json({ success: true, data: newProduct });
  } catch (error: any) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
