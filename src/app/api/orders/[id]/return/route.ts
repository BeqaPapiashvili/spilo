import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireAdminSession } from "@/lib/jwt";
import { ADMIN_ROLES } from "@/lib/permissions";
import { recordAuditLog } from "@/lib/audit";
import { ReturnStatus, ReturnType } from "@prisma/client";

const VALID_STATUSES: ReturnStatus[] = [
  "REQUESTED",
  "IN_PROGRESS",
  "COURIER_ASSIGNED",
  "COMPLETED",
  "REJECTED",
];

const VALID_TYPES: ReturnType[] = ["RETURN", "EXCHANGE"];

/**
 * GET /api/orders/[id]/return
 * Fetch all return/exchange requests and history logs for this order
 */
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
      select: {
        id: true,
        orderNumber: true,
        userId: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "შეკვეთა ვერ მოიძებნა (Order not found)" },
        { status: 404 }
      );
    }

    const isAdmin =
      (session?.role && ADMIN_ROLES.includes(session.role)) ||
      (process.env.NODE_ENV !== "production" && !session);
    if (order.userId && !isAdmin && (!session || session.userId !== order.userId)) {
      return NextResponse.json(
        { success: false, error: "წვდომა შეზღუდულია (Forbidden)" },
        { status: 403 }
      );
    }

    const returns = await prisma.orderReturn.findMany({
      where: { orderId: order.id },
      include: {
        logs: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: returns,
    });
  } catch (error: any) {
    console.error("GET /api/orders/[id]/return error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch returns" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders/[id]/return
 * Create a new return/exchange request for an order
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await request.json();
    const { type, reason, internalNotes, items, exchangeTo, forceNew } = body;

    if (!reason || typeof reason !== "string" || !reason.trim()) {
      return NextResponse.json(
        { success: false, error: "მიზეზის მითითება სავალდებულოა" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "შეკვეთა ვერ მოიძებნა (Order not found)" },
        { status: 404 }
      );
    }

    // Check if there is already an active (unfinalized) return/exchange
    if (!forceNew) {
      const activeReturn = await prisma.orderReturn.findFirst({
        where: {
          orderId: order.id,
          status: {
            in: ["REQUESTED", "IN_PROGRESS", "COURIER_ASSIGNED"],
          },
        },
      });

      if (activeReturn) {
        return NextResponse.json(
          {
            success: false,
            error: "შეკვეთაზე უკვე არსებობს აქტიური დაბრუნების/გადაცვლის მოთხოვნა",
            activeReturnId: activeReturn.id,
          },
          { status: 400 }
        );
      }
    }

    const returnType: ReturnType =
      type && VALID_TYPES.includes(type) ? type : "RETURN";

    const operatorName = session?.name || "ადმინისტრატორი";
    const operatorEmail = session?.email || "admin@spilo.ge";

    const initialComment = internalNotes?.trim()
      ? internalNotes.trim()
      : `დაფიქსირდა მოთხოვნა (${returnType === "EXCHANGE" ? "გადაცვლა" : "დაბრუნება"}): ${reason.trim()}${exchangeTo?.trim() ? ` [იცვლება: ${exchangeTo.trim()}]` : ""}`;

    const newReturn = await prisma.orderReturn.create({
      data: {
        orderId: order.id,
        type: returnType,
        status: "REQUESTED",
        reason: reason.trim(),
        internalNotes: internalNotes?.trim() || null,
        items: items || null,
        exchangeTo: exchangeTo?.trim() || null,
        logs: {
          create: {
            status: "REQUESTED",
            action: "CREATED",
            comment: initialComment,
            authorName: operatorName,
            authorEmail: operatorEmail,
          },
        },
      },
      include: {
        logs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: operatorEmail,
      adminName: operatorName,
      action: "ORDER_RETURN_CREATED",
      entity: "OrderReturn",
      target: `#${order.orderNumber}`,
      details: `შექმნილია ${returnType === "EXCHANGE" ? "გადაცვლის" : "დაბრუნების"} მოთხოვნა. მიზეზი: ${reason.trim()}`,
    });

    return NextResponse.json({
      success: true,
      message: "მოთხოვნა წარმატებით დაფიქსირდა",
      data: newReturn,
    });
  } catch (error: any) {
    console.error("POST /api/orders/[id]/return error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create return request" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[id]/return
 * Update status, add internal comments, and record history logs
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await request.json();
    const { returnId, status, comment, internalNotes } = body;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "შეკვეთა ვერ მოიძებნა (Order not found)" },
        { status: 404 }
      );
    }

    let existingReturn = null;
    if (returnId) {
      existingReturn = await prisma.orderReturn.findFirst({
        where: { id: returnId, orderId: order.id },
      });
    } else {
      // Pick the latest return for this order
      existingReturn = await prisma.orderReturn.findFirst({
        where: { orderId: order.id },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!existingReturn) {
      return NextResponse.json(
        { success: false, error: "დაბრუნების/გადაცვლის ჩანაწერი ვერ მოიძებნა" },
        { status: 404 }
      );
    }

    const operatorName = session?.name || "ადმინისტრატორი";
    const operatorEmail = session?.email || "admin@spilo.ge";

    const isStatusChanged =
      status &&
      VALID_STATUSES.includes(status) &&
      status !== existingReturn.status;

    const hasNewComment = Boolean(comment && typeof comment === "string" && comment.trim());

    if (!isStatusChanged && !hasNewComment && internalNotes === undefined) {
      return NextResponse.json(
        { success: false, error: "ცვლილება არ არის მითითებული" },
        { status: 400 }
      );
    }

    // Determine what action is taking place
    let logAction = "NOTE_ADDED";
    if (isStatusChanged) {
      logAction = "STATUS_CHANGED";
    }

    const statusTranslations: Record<ReturnStatus, string> = {
      REQUESTED: "მოთხოვნილია",
      IN_PROGRESS: "პროცესშია",
      COURIER_ASSIGNED: "კურიერთან გადაცემულია",
      COMPLETED: "დასრულდა",
      REJECTED: "უარყოფილია / გაუქმდა",
    };

    let logComment = hasNewComment ? comment.trim() : null;
    if (isStatusChanged && !logComment) {
      logComment = `სტატუსი შეიცვალა: ${statusTranslations[existingReturn.status]} → ${statusTranslations[status as ReturnStatus]}`;
    }

    // Update return record and create log entry in a transaction
    const [updatedReturn] = await prisma.$transaction([
      prisma.orderReturn.update({
        where: { id: existingReturn.id },
        data: {
          ...(isStatusChanged ? { status: status as ReturnStatus } : {}),
          ...(internalNotes !== undefined ? { internalNotes: internalNotes ? internalNotes.trim() : null } : {}),
        },
      }),
      prisma.returnLog.create({
        data: {
          orderReturnId: existingReturn.id,
          status: (isStatusChanged ? (status as ReturnStatus) : existingReturn.status),
          action: logAction,
          comment: logComment,
          authorName: operatorName,
          authorEmail: operatorEmail,
        },
      }),
    ]);

    // Fetch the updated return with all its logs
    const fullUpdatedReturn = await prisma.orderReturn.findUnique({
      where: { id: updatedReturn.id },
      include: {
        logs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: operatorEmail,
      adminName: operatorName,
      action: isStatusChanged ? "ORDER_RETURN_STATUS_UPDATE" : "ORDER_RETURN_NOTE_ADD",
      entity: "OrderReturn",
      target: `#${order.orderNumber}`,
      details: isStatusChanged
        ? `სტატუსი შეიცვალა: ${statusTranslations[status as ReturnStatus]}${logComment ? ` (${logComment})` : ""}`
        : `დაემატა შენიშვნა: ${logComment}`,
    });

    return NextResponse.json({
      success: true,
      message: "მონაცემები წარმატებით განახლდა",
      data: fullUpdatedReturn,
    });
  } catch (error: any) {
    console.error("PATCH /api/orders/[id]/return error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update return" },
      { status: 500 }
    );
  }
}
