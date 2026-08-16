import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
      },
      include: {
        items: true,
      },
    });

    try {
      const { recordAuditLog } = await import("@/lib/audit");
      await recordAuditLog({
        action: "ORDER_STATUS_UPDATE",
        entity: "Order",
        target: `#${updatedOrder.orderNumber}`,
        details: `შეკვეთის სტატუსი შეიცვალა: ${status || paymentStatus}`,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: `შეკვეთის #${id} სტატუსი განახლდა: ${status || paymentStatus}`,
    });
  } catch (error: any) {
    console.error("PUT /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
