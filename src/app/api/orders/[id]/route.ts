import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireAdminSession } from "@/lib/jwt";
import { ADMIN_ROLES, canMutateOrders } from "@/lib/permissions";
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
        payments: { orderBy: { createdAt: "desc" } },
        returns: {
          include: {
            logs: {
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const isAdmin = Boolean(session?.role && ADMIN_ROLES.includes(session.role));
    const isOwner = Boolean(session?.userId && order.userId === session.userId);
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, error: "წვდომა შეზღუდულია" },
        { status: 403 }
      );
    }

    const safeOrder = isAdmin
      ? order
      : {
          ...order,
          user: order.user
            ? { id: order.user.id, name: order.user.name, email: order.user.email, phone: order.user.phone }
            : null,
          items: order.items.map(({ costPrice: _cost, ...item }) => item),
        };

    return NextResponse.json({
      success: true,
      data: safeOrder,
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
    if (!canMutateOrders(session?.role || "")) {
      return NextResponse.json({ success: false, error: "შეკვეთის შეცვლა ამ როლს არ შეუძლია" }, { status: 403 });
    }

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

