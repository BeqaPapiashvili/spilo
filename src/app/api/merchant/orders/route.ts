import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant";
import { merchantLineTotal } from "@/lib/merchantLabels";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { storeId, errorResponse } = await requireMerchantSession(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") || "").trim();
    const q = (searchParams.get("q") || "").trim();

    const orders = await prisma.order.findMany({
      where: {
        items: { some: { storeId } },
        ...(status ? { status: status as "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" } : {}),
        ...(q
          ? {
              OR: [
                { orderNumber: { contains: q } },
                { customerName: { contains: q } },
                { contactPhone: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 80,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerEmail: true,
        contactPhone: true,
        shippingAddress: true,
        notes: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        deliveryMethod: true,
        deliveryDate: true,
        createdAt: true,
        updatedAt: true,
        items: {
          where: { storeId },
          select: {
            id: true,
            title: true,
            sku: true,
            quantity: true,
            costPrice: true,
            selectedVariants: true,
            product: { select: { costPrice: true } },
            image: true,
            fulfillmentStatus: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: orders.map((order) => ({
        ...order,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        total: Number(
          order.items
            .reduce((sum, item) => sum + merchantLineTotal(item.costPrice ?? item.product?.costPrice, item.quantity), 0)
            .toFixed(2)
        ),
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "შეკვეთები ვერ ჩაიტვირთა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
