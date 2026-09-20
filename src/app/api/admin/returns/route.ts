import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/jwt";

/**
 * GET /api/admin/returns
 * Fetch all order returns & exchanges across all orders
 */
export async function GET(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    let where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (type && type !== "ALL") {
      where.type = type;
    }

    const returns = await prisma.orderReturn.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            contactPhone: true,
            customerEmail: true,
            shippingAddress: true,
            totalAmount: true,
            items: true,
          },
        },
        logs: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: returns.length,
      data: returns,
    });
  } catch (error: any) {
    console.error("GET /api/admin/returns error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch returns" },
      { status: 500 }
    );
  }
}
