import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireAdminSession } from "@/lib/jwt";
import { ADMIN_ROLES } from "@/lib/permissions";
import { recordAuditLog } from "@/lib/audit";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession(request);
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

    // If order has an associated userId, only allow owner or admin
    const isAdmin = session?.role && ADMIN_ROLES.includes(session.role);
    if (order.userId && !isAdmin && (!session || session.userId !== order.userId)) {
      return NextResponse.json(
        { success: false, error: "წვდომა შეზღუდულია (Forbidden)" },
        { status: 403 }
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
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

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

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "ORDER_STATUS_UPDATE",
      entity: "Order",
      target: `#${updatedOrder.orderNumber}`,
      details: `შეკვეთის სტატუსი შეიცვალა: ${status || paymentStatus}`,
    });

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

