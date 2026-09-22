import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant";
import { merchantLineTotal } from "@/lib/merchantLabels";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { storeId, errorResponse } = await requireMerchantSession(request);
    if (errorResponse) return errorResponse;

    const [store, items, products, recent, outOfStockCount] = await Promise.all([
      prisma.store.findUnique({
        where: { id: storeId },
        select: {
          name: true,
          city: true,
          logo: true,
          pickupEnabled: true,
          _count: { select: { products: true } },
        },
      }),
      prisma.orderItem.findMany({
        where: { storeId },
        select: {
          quantity: true,
          costPrice: true,
          title: true,
          productId: true,
          fulfillmentStatus: true,
          product: { select: { costPrice: true } },
          order: { select: { id: true, status: true, createdAt: true } },
        },
      }),
      prisma.product.findMany({
        where: { storeId, stock: { lte: 3 } },
        select: { id: true, title: true, stock: true },
        orderBy: { stock: "asc" },
        take: 8,
      }),
      prisma.order.findMany({
        where: { items: { some: { storeId } } },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          contactPhone: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
          deliveryMethod: true,
          items: {
            where: { storeId },
            select: {
              title: true,
              quantity: true,
              costPrice: true,
              fulfillmentStatus: true,
              product: { select: { costPrice: true } },
            },
          },
        },
      }),
      prisma.product.count({ where: { storeId, stock: { lte: 0 } } }),
    ]);

    const paid = items.filter((item) => item.order.status !== "CANCELLED");
    const lineCost = (item: { costPrice: number | null; product?: { costPrice: number | null } | null; quantity: number }) =>
      merchantLineTotal(item.costPrice ?? item.product?.costPrice, item.quantity);
    const revenue = paid.reduce((sum, item) => sum + lineCost(item), 0);
    const units = paid.reduce((sum, item) => sum + item.quantity, 0);
    const newCount = paid.filter((item) => item.fulfillmentStatus === "PENDING").length;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayPaid = paid.filter((item) => new Date(item.order.createdAt) >= startOfDay);
    const uniqueOrders = new Map<string, string>();
    for (const item of items) uniqueOrders.set(item.order.id, item.order.status);
    const statusCounts = {
      PENDING: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    for (const status of uniqueOrders.values()) {
      if (status in statusCounts) statusCounts[status as keyof typeof statusCounts] += 1;
    }
    const byProduct = new Map<string, { title: string; units: number; revenue: number }>();
    for (const item of paid) {
      const current = byProduct.get(item.productId) || { title: item.title, units: 0, revenue: 0 };
      current.units += item.quantity;
      current.revenue += lineCost(item);
      byProduct.set(item.productId, current);
    }

    return NextResponse.json({
      success: true,
      data: {
        storeName: store?.name || "",
        storeCity: store?.city || "",
        storeLogo: store?.logo || "",
        pickupEnabled: Boolean(store?.pickupEnabled),
        productCount: store?._count.products || 0,
        orderCount: new Set(paid.map((item) => item.order.id)).size,
        unitsSold: units,
        revenue: Number(revenue.toFixed(2)),
        todayRevenue: Number(todayPaid.reduce((sum, item) => sum + lineCost(item), 0).toFixed(2)),
        todayOrders: new Set(todayPaid.map((item) => item.order.id)).size,
        newItems: newCount,
        outOfStockCount,
        statusCounts,
        topProducts: [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
        lowStock: products,
        recentOrders: recent.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          status: order.status,
          createdAt: order.createdAt,
          deliveryMethod: order.deliveryMethod,
          contactPhone: order.contactPhone,
          paymentStatus: order.paymentStatus,
          itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
          firstItem: order.items[0]?.title || "",
          total: Number(order.items.reduce((sum, item) => sum + lineCost(item), 0).toFixed(2)),
        })),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "სტატისტიკა ვერ ჩაიტვირთა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
