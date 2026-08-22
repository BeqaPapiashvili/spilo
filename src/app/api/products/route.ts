import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("search") || "";
    const idsParam = searchParams.get("ids");
    const categoryParam = searchParams.get("category");
    const brandParam = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const inStock = searchParams.get("inStock") === "true";
    const onlyDiscounted = searchParams.get("discount") === "true";
    const isFeatured = searchParams.get("featured") === "true";
    const isFlashDeal = searchParams.get("flash") === "true";
    const sort = searchParams.get("sort") || "default";

    // Optional pagination params (only applied if limit is provided)
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.max(1, Number(limitParam)) : undefined;
    const pageParam = searchParams.get("page");
    const page = pageParam ? Math.max(1, Number(pageParam)) : 1;

    // Build Prisma Where Clause using AND composition
    const andConditions: any[] = [];

    if (idsParam) {
      const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
      if (ids.length > 0) {
        andConditions.push({ id: { in: ids } });
      }
    }

    if (query.trim()) {
      const q = query.trim();
      andConditions.push({
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { sku: { contains: q } },
          { brand: { name: { contains: q } } },
          { category: { name: { contains: q } } },
        ],
      });
    }

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

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceCond: any = {};
      if (minPrice !== undefined) priceCond.gte = minPrice;
      if (maxPrice !== undefined) priceCond.lte = maxPrice;
      andConditions.push({ price: priceCond });
    }

    if (inStock) {
      andConditions.push({ stock: { gt: 0 } });
    }

    if (onlyDiscounted) {
      andConditions.push({ discountPrice: { not: null } });
    }

    if (isFeatured) {
      andConditions.push({ isFeatured: true });
    }

    if (isFlashDeal) {
      andConditions.push({ isFlashDeal: true });
    }

    const where: any = andConditions.length > 0 ? { AND: andConditions } : {};

    // Build Sorting
    let orderBy: any = { createdAt: "desc" };

    if (sort === "price_asc" || sort === "price-asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price_desc" || sort === "price-desc") {
      orderBy = { price: "desc" };
    } else if (sort === "discount") {
      orderBy = { discountPercentage: "desc" };
    } else if (sort === "rating") {
      orderBy = { rating: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    }

    let totalCount = 0;
    let findOptions: any = {
      where,
      orderBy,
      include: {
        category: true,
        brand: true,
      },
    };

    if (limit !== undefined) {
      totalCount = await prisma.product.count({ where });
      findOptions.skip = (page - 1) * limit;
      findOptions.take = limit;
    }

    const products = await prisma.product.findMany(findOptions);

    if (limit === undefined) {
      totalCount = products.length;
    }

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
        rating: p.rating || 5,
        reviewCount: p.reviewCount || 0,
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedProducts.length,
      total: totalCount,
      page: limit !== undefined ? page : 1,
      totalPages: limit !== undefined ? Math.ceil(totalCount / limit) : 1,
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

import { requireAdminSession } from "@/lib/jwt";
import { recordAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

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

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "PRODUCT_CREATE",
      entity: "Product",
      target: `${newProduct.title} (${newProduct.sku})`,
      details: `შეიქმნა ახალი პროდუქტი: ფასი ${newProduct.price} ₾, მარაგი: ${newProduct.stock}`,
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

