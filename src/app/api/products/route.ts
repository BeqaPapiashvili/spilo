import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { expandSearchTerms } from "@/lib/transliteration";
import { getAuthSession, requireAdminSession } from "@/lib/jwt";
import { ADMIN_ROLES } from "@/lib/permissions";
import { recordAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("search") || "";
    const idsParam = searchParams.get("ids");
    const categoryParam = searchParams.get("category");
    const brandParam = searchParams.get("brand");
    const storeParam = searchParams.get("store");
    const colorParam = searchParams.get("color");
    const storageParam = searchParams.get("storage");
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const inStock = searchParams.get("inStock") === "true";
    const onlyDiscounted = searchParams.get("discount") === "true";
    const isFeatured = searchParams.get("featured") === "true";
    const isFlashDeal = searchParams.get("flash") === "true";
    const statusParam = searchParams.get("status");
    const sort = searchParams.get("sort") || "default";
    const session = await getAuthSession(request);
    const isAdmin = Boolean(session?.role && ADMIN_ROLES.includes(session.role));

    const limitParam = searchParams.get("limit");
    const requestedLimit = limitParam ? Math.max(1, Number(limitParam)) : isAdmin ? 200 : 48;
    const maxLimit = isAdmin ? 500 : 60;
    const limit = Math.min(requestedLimit, maxLimit);
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
      const searchTerms = expandSearchTerms(query.trim());
      const queryOrs: any[] = [];
      for (const term of searchTerms) {
        queryOrs.push(
          { title: { contains: term } },
          { description: { contains: term } },
          { sku: { contains: term } },
          { brand: { name: { contains: term } } },
          { category: { name: { contains: term } } }
        );
      }
      if (queryOrs.length > 0) {
        andConditions.push({ OR: queryOrs });
      }
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

    if (storeParam) {
      const stores = storeParam.split(",").map((s) => s.trim()).filter(Boolean);
      if (stores.length > 0) {
        andConditions.push({
          OR: [
            { store: { slug: { in: stores } } },
            { store: { name: { in: stores } } },
            { storeId: { in: stores } },
          ],
        });
      }
    }

    if (colorParam) {
      const colors = colorParam.split(",").map((c) => c.trim()).filter(Boolean);
      if (colors.length > 0) {
        const colorOrs: any[] = [];
        for (const col of colors) {
          colorOrs.push(
            { colorName: { equals: col } },
            { colorName: { contains: col } },
            { title: { contains: col } }
          );
        }
        andConditions.push({ OR: colorOrs });
      }
    }

    if (storageParam) {
      const storages = storageParam.split(",").map((s) => s.trim()).filter(Boolean);
      if (storages.length > 0) {
        const storageOrs: any[] = [];
        for (const st of storages) {
          const cleanSt = st.replace(/\s+/, "");
          storageOrs.push(
            { storage: { equals: st } },
            { storage: { contains: st } },
            { title: { contains: st } },
            { title: { contains: cleanSt } }
          );
        }
        andConditions.push({ OR: storageOrs });
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

    if (statusParam === "ALL" || statusParam === "PENDING_REVIEW") {
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: "წვდომა შეზღუდულია" },
          { status: 403 }
        );
      }
      if (statusParam === "PENDING_REVIEW") {
        andConditions.push({ status: "PENDING_REVIEW" });
      }
    } else if (statusParam === "PUBLISHED") {
      andConditions.push({ OR: [{ status: "PUBLISHED" }, { status: null }] });
    } else {
      andConditions.push({ status: { not: "PENDING_REVIEW" } });
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
      orderBy = { reviews: { _count: "desc" } };
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
        store: true,
        _count: { select: { reviews: true } },
      },
    };

    totalCount = await prisma.product.count({ where });
    findOptions.skip = (page - 1) * limit;
    findOptions.take = limit;

    const products = await prisma.product.findMany(findOptions);

    // Format products for frontend consumption
    const formattedProducts = products.map((p: any) => {
      let imageList: string[] = [];
      try {
        imageList = typeof p.images === "string" ? JSON.parse(p.images) : (Array.isArray(p.images) ? p.images : []);
      } catch {
        imageList = [];
      }
      if (!imageList || imageList.length === 0) {
        imageList = ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"];
      }

      let parsedSpecs = undefined;
      if (p.specs) {
        try {
          parsedSpecs = typeof p.specs === "string" ? JSON.parse(p.specs) : (Array.isArray(p.specs) ? p.specs : undefined);
        } catch {
          parsedSpecs = undefined;
        }
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
        storeId: p.storeId || undefined,
        storeName: p.store?.name,
        storeSlug: p.store?.slug,
        storeLogo: p.store?.logo,
        image: imageList[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
        images: imageList,
        specs: parsedSpecs,
        colorName: p.colorName || undefined,
        storage: p.storage || undefined,
        isFeatured: p.isFeatured,
        isFlashDeal: p.isFlashDeal,
        status: p.status || "PUBLISHED",
        isApproved: p.isApproved !== false,
        rating: p._count?.reviews ? 5 : 0,
        reviewCount: p._count?.reviews || 0,
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedProducts.length,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit) || 1,
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
        costPrice: body.costPrice !== undefined && body.costPrice !== null && body.costPrice !== "" ? Number(body.costPrice) : null,
        discountPrice: body.discountPrice ? Number(body.discountPrice) : null,
        discountPercentage: body.discountPercentage ? Number(body.discountPercentage) : null,
        monthlyInstallment: body.monthlyInstallment ? Number(body.monthlyInstallment) : null,
        stock: body.stock !== undefined ? Number(body.stock) : 10,
        categoryId: body.categoryId,
        brandId: body.brandId,
        storeId: body.storeId || null,
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

