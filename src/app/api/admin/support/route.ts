import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/jwt";
import {
  MAX_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
  clampText,
  formatChatTime,
  isTypingFresh,
  mapSupportMessage,
  markSupportAdminSeen,
} from "@/lib/supportChat";

const TICKET_STATUSES = new Set(["OPEN", "CLOSED", "RESOLVED"]);
const MAX_TICKETS = 200;

type TicketWithMessages = NonNullable<
  Awaited<ReturnType<typeof prisma.supportTicket.findFirst<{ include: { messages: true } }>>>
>;

function serializeTicket(t: TicketWithMessages) {
  return {
    id: t.id,
    customerId: t.customerId || "",
    customerName: t.userName,
    customerPhone: t.userPhone,
    customerEmail: t.userEmail || "",
    userName: t.userName,
    userPhone: t.userPhone,
    userEmail: t.userEmail || "",
    topic: t.topic || "ონლაინ კონსულტაცია",
    status: t.status as "OPEN" | "CLOSED" | "RESOLVED",
    isUserTyping: isTypingFresh(t.isUserTyping, t.updatedAt),
    isAdminTyping: isTypingFresh(t.isAdminTyping, t.updatedAt),
    typingAdminName: isTypingFresh(t.isAdminTyping, t.updatedAt) ? t.typingAdminName || "" : "",
    assignedToName: t.assignedToName || "",
    time: formatChatTime(t.updatedAt),
    messages: t.messages.map(mapSupportMessage),
    unreadCount: t.messages.filter((m) => m.senderRole === "user" && !m.isRead).length,
    updatedAt: t.updatedAt,
    createdAt: t.createdAt,
  };
}

function loadTicket(id: string) {
  return prisma.supportTicket.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function GET(request: Request) {
  try {
    const { errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;
    markSupportAdminSeen();

    const tickets = await prisma.supportTicket.findMany({
      include: { messages: { orderBy: { createdAt: "asc" } } },
      orderBy: { updatedAt: "desc" },
      take: MAX_TICKETS,
    });

    return NextResponse.json({ success: true, data: tickets.map(serializeTicket) });
  } catch (error: unknown) {
    console.error("GET /api/admin/support error:", error);
    const message = error instanceof Error ? error.message : "Failed to load tickets";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;
    markSupportAdminSeen();

    const body = await request.json().catch(() => ({}));
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json({ success: false, message: "Ticket id is required" }, { status: 400 });
    }

    const replyText = typeof body.replyText === "string" ? body.replyText.trim() : "";
    if (replyText.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { success: false, message: `Reply is too long (max ${MAX_MESSAGE_LENGTH})` },
        { status: 400 }
      );
    }
    if (body.status !== undefined && !TICKET_STATUSES.has(body.status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({ where: { id }, select: { id: true, status: true } });
    if (!ticket) {
      return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });
    }

    const nextStatus: string = body.status || ticket.status;
    if (replyText && nextStatus !== "OPEN") {
      return NextResponse.json(
        { success: false, message: "ჩატი დახურულია. პასუხისთვის ჯერ გახსენით." },
        { status: 409 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (typeof body.isAdminTyping === "boolean") updateData.isAdminTyping = body.isAdminTyping;
    if (body.typingAdminName !== undefined) updateData.typingAdminName = clampText(body.typingAdminName, MAX_NAME_LENGTH);
    if (body.assignedToName !== undefined) updateData.assignedToName = clampText(body.assignedToName, MAX_NAME_LENGTH);
    if (replyText) {
      updateData.isAdminTyping = false;
      updateData.typingAdminName = "";
    }

    const senderName =
      clampText(body.adminName, MAX_NAME_LENGTH) || session?.name || "ოპერატორი";

    await prisma.$transaction(async (tx) => {
      if (body.markRead === true) {
        await tx.supportMessage.updateMany({
          where: { ticketId: id, senderRole: "user", isRead: false },
          data: { isRead: true },
        });
      }
      if (replyText) {
        await tx.supportMessage.create({
          data: { ticketId: id, senderRole: "admin", senderName, text: replyText, isRead: false },
        });
      }
      if (Object.keys(updateData).length > 0) {
        await tx.supportTicket.update({ where: { id }, data: updateData });
      }
    });

    const fullTicket = await loadTicket(id);
    if (!fullTicket) {
      return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: serializeTicket(fullTicket) });
  } catch (error: unknown) {
    console.error("Support POST Error:", error);
    const message = error instanceof Error ? error.message : "Support update failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.supportMessage.deleteMany({ where: { ticketId: id } });
      await tx.supportTicket.deleteMany({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Support ticket delete error:", error);
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
