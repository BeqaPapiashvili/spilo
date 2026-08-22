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
      imageList = typeof product.images === "string" ? JSON.parse(product.images) : (product.images as string[]);
    } catch {
      imageList = ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"];
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
      specs: product.specs || undefined,
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

    const existing = await prisma.product.findUnique({ where: { id } });

    await prisma.product.delete({
      where: { id },
    });

    if (existing) {
      await recordAuditLog({
        userId: session?.userId,
        adminEmail: session?.email,
        adminName: session?.name,
        action: "PRODUCT_DELETE",
        entity: "Product",
        target: `${existing.title} (${existing.sku})`,
        details: "პროდუქტი წაიშალა მონაცემთა ბაზიდან",
      });
    }

    return NextResponse.json({
      success: true,
      message: "პროდუქტი წარმატებით წაიშალა MySQL ბაზიდან",
    });
  } catch (error: any) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}

