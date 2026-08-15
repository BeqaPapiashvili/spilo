import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Total Orders & Revenue from MySQL
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const activeOrders = orders.filter((o) => o.status !== "CANCELLED");
    const totalRevenue = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // 2. Total Customers Count
    const totalCustomers = await prisma.user.count({
      where: { role: "CUSTOMER" },
    });

    // 3. Total Products Count
    const totalProducts = await prisma.product.count();

    // 4. Low stock products count (< 5)
    const lowStockCount = await prisma.product.count({
      where: { stock: { lte: 5 } },
    });

    // 5. Recent 5 Orders
    const recentOrders = orders.slice(0, 5).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt.toISOString().split("T")[0],
    }));

    // 6. Top 4 Products
    const topProducts = await prisma.product.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        price: true,
        stock: true,
        images: true,
        category: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders: orders.length,
        totalCustomers,
        totalProducts,
        lowStockCount,
        recentOrders,
        topProducts: topProducts.map((p) => ({
          ...p,
          image: Array.isArray(p.images) ? (p.images[0] as string) : "",
        })),
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
