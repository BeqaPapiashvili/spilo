import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant";
import { recordAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { storeId, errorResponse } = await requireMerchantSession(request);
    if (errorResponse) return errorResponse;

    const products = await prisma.product.findMany({
      where: { storeId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        sku: true,
        price: true,
        costPrice: true,
        discountPrice: true,
        stock: true,
        status: true,
        images: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: products.map((product) => ({
        ...product,
        image: Array.isArray(product.images) ? product.images[0] : null,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "პროდუქტები ვერ ჩაიტვირთა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { session, storeId, errorResponse } = await requireMerchantSession(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const id = String(body.id || "").trim();
    const stock = Math.floor(Number(body.stock));
    if (!id || !Number.isFinite(stock) || stock < 0) {
      return NextResponse.json({ success: false, error: "მარაგი არასწორია" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id, storeId },
      select: { id: true, title: true, sku: true, stock: true },
    });
    if (!product) {
      return NextResponse.json({ success: false, error: "პროდუქტი ვერ მოიძებნა" }, { status: 404 });
    }

    const nextStock = stock;
    const updated = await prisma.product.update({
      where: { id: product.id },
      data: { stock: nextStock },
      select: { id: true, stock: true, title: true, sku: true },
    });

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "MERCHANT_STOCK_UPDATE",
      entity: "Product",
      target: updated.sku || updated.id,
      details: `${updated.title}: ${product.stock} -> ${updated.stock}`,
    });

    revalidatePath("/catalog");
    revalidatePath(`/product/${updated.id}`);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "მარაგი ვერ განახლდა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
