import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const store = await prisma.store.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!store) {
      return NextResponse.json({ success: false, error: "მაღაზია ვერ მოიძებნა" }, { status: 404 });
    }

    const items = await prisma.orderItem.findMany({
      where: { storeId: id },
      select: {
        quantity: true,
        price: true,
        title: true,
        productId: true,
        order: { select: { id: true, status: true } },
      },
    });

    const paidItems = items.filter((item) => item.order.status !== "CANCELLED");
    const revenue = paidItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const units = paidItems.reduce((sum, item) => sum + item.quantity, 0);
    const orderIds = new Set(paidItems.map((item) => item.order.id));

    const byProduct = new Map<string, { title: string; units: number; revenue: number }>();
    for (const item of paidItems) {
      const current = byProduct.get(item.productId) || { title: item.title, units: 0, revenue: 0 };
      current.units += item.quantity;
      current.revenue += item.price * item.quantity;
      byProduct.set(item.productId, current);
    }

    const topProducts = [...byProduct.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const lowStock = await prisma.product.findMany({
      where: { storeId: id, stock: { lte: 3 } },
      select: { id: true, title: true, stock: true },
      orderBy: { stock: "asc" },
      take: 8,
    });

    return NextResponse.json({
      success: true,
      data: {
        productCount: store._count.products,
        orderCount: orderIds.size,
        unitsSold: units,
        revenue: Number(revenue.toFixed(2)),
        topProducts,
        lowStock,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "სტატისტიკა ვერ ჩაიტვირთა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
