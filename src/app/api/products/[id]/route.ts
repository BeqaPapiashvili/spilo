import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        brand: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "პროდუქტი ვერ მოიძებნა" },
        { status: 404 }
      );
    }

    let imageList: string[] = [];
    try {
      imageList = typeof product.images === "string" ? JSON.parse(product.images) : (Array.isArray(product.images) ? product.images : []);
    } catch {
      imageList = [];
    }
    if (!imageList || imageList.length === 0) {
      imageList = ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"];
    }

    let parsedSpecs = undefined;
    if (product.specs) {
      try {
        parsedSpecs = typeof product.specs === "string" ? JSON.parse(product.specs) : (Array.isArray(product.specs) ? product.specs : undefined);
      } catch {
        parsedSpecs = undefined;
      }
    }

    const formatted = {
      id: product.id,
      title: product.title,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || undefined,
      discountPercentage: product.discountPercentage || undefined,
      monthlyInstallment: product.monthlyInstallment || undefined,
      stock: product.stock,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
      brandId: product.brandId,
      brandName: product.brand?.name,
      image: imageList[0] || "",
      images: imageList,
      specs: parsedSpecs,
      isFeatured: product.isFeatured,
      isFlashDeal: product.isFlashDeal,
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}

import { requireAdminSession } from "@/lib/jwt";
import { recordAuditLog } from "@/lib/audit";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        slug: body.slug !== undefined ? body.slug : undefined,
        sku: body.sku !== undefined ? body.sku : undefined,
        description: body.description !== undefined ? body.description : undefined,
        price: body.price !== undefined ? Number(body.price) : undefined,
        discountPrice: body.discountPrice !== undefined ? (body.discountPrice ? Number(body.discountPrice) : null) : undefined,
        discountPercentage: body.discountPercentage !== undefined ? (body.discountPercentage ? Number(body.discountPercentage) : null) : undefined,
        monthlyInstallment: body.monthlyInstallment !== undefined ? (body.monthlyInstallment ? Number(body.monthlyInstallment) : null) : undefined,
        stock: body.stock !== undefined ? Number(body.stock) : undefined,
        categoryId: body.categoryId !== undefined ? body.categoryId : undefined,
        brandId: body.brandId !== undefined ? body.brandId : undefined,
        images: body.images !== undefined ? (Array.isArray(body.images) ? body.images : [body.images]) : undefined,
        specs: body.specs !== undefined ? body.specs : undefined,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined,
        isFlashDeal: body.isFlashDeal !== undefined ? Boolean(body.isFlashDeal) : undefined,
      },
    });

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "PRODUCT_UPDATE",
      entity: "Product",
      target: `${updated.title} (${updated.sku})`,
      details: `განახლდა პროდუქტი: ფასი ${updated.price} ₾, მარაგი: ${updated.stock}`,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const { id } = await params;

    // Find product by id OR slug
    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: `პროდუქტი ID-ით ან Slug-ით '${id}' ვერ მოიძებნა` },
        { status: 404 }
      );
    }

    const targetId = existing.id;

    // Execute atomic deletion with foreign key cascading cleanup
    await prisma.$transaction(async (tx) => {
      // 1. Delete associated cart items
      await tx.cartItem.deleteMany({
        where: { productId: targetId },
      });

      // 2. Delete associated reviews
      await tx.review.deleteMany({
        where: { productId: targetId },
      });

      // 3. Delete associated product variants
      await tx.productVariant.deleteMany({
        where: { productId: targetId },
      });

      // 4. Delete associated price alerts
      await tx.priceAlert.deleteMany({
        where: { productId: targetId },
      });

      // 5. Delete associated order items
      await tx.orderItem.deleteMany({
        where: { productId: targetId },
      });

      // 6. Delete the product itself
      await tx.product.delete({
        where: { id: targetId },
      });
    });

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "PRODUCT_DELETE",
      entity: "Product",
      target: `${existing.title} (${existing.sku})`,
      details: `პროდუქტი წარმატებით წაიშალა მონაცემთა ბაზიდან (ID: ${targetId})`,
    });

    return NextResponse.json({
      success: true,
      message: `პროდუქტი '${existing.title}' წარმატებით წაიშალა მონაცემთა ბაზიდან`,
    });
  } catch (error: any) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}

