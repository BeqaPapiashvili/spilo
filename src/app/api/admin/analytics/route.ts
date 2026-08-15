import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrismaClient();

    const [totalOrders, totalProducts, totalCustomers, orders] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.findMany({
        select: {
          totalAmount: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const paidOrdersCount = orders.filter((o) => o.paymentStatus === "PAID").length;

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        totalProducts,
        totalCustomers,
        totalRevenue,
        paidOrdersCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      stats: {
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        paidOrdersCount: 0,
      },
    });
  }
}
