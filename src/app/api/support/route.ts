import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonWithIdentity, resolveIdentity } from "@/lib/identity";

function mapMessages(messages: Array<{
  id: string;
  senderRole: string;
  text: string;
  createdAt: Date;
  senderName: string | null;
  isRead: boolean;
  attachment: unknown;
}>) {
  return messages.map((m) => ({
    id: m.id,
    sender: m.senderRole as "user" | "admin" | "bot",
    text: m.text,
    time: new Date(m.createdAt).toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
    adminName: m.senderName || undefined,
    read: m.isRead,
    attachment: m.attachment,
    createdAt: m.createdAt,
  }));
}

export async function GET(request: Request) {
  try {
    const identity = await resolveIdentity(request);

    const ticket = await prisma.supportTicket.findFirst({
      where: identity.userId
        ? { userId: identity.userId }
        : { customerId: identity.sessionId || "" },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!ticket) {
      return jsonWithIdentity({ success: true, data: null }, identity);
    }

    return jsonWithIdentity(
      {
        success: true,
        data: {
          id: ticket.id,
          customerId: ticket.customerId,
          userName: ticket.userName,
          userPhone: ticket.userPhone,
          userEmail: ticket.userEmail,
          status: ticket.status,
          isUserTyping: ticket.isUserTyping,
          isAdminTyping: ticket.isAdminTyping,
          typingAdminName: ticket.typingAdminName,
          assignedToName: ticket.assignedToName,
          messages: mapMessages(ticket.messages),
          updatedAt: ticket.updatedAt,
        },
      },
      identity
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "საჩივრის წამოღება ვერ მოხერხდა";
    console.error("GET /api/support error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userName,
      userPhone,
      userEmail,
      messageText,
      attachment,
      isUserTyping,
    } = body;

    const identity = await resolveIdentity(request);
    const userId = identity.userId || undefined;
    const scopedCustomerId = identity.userId ? identity.userId : identity.sessionId;

    const ticket = await prisma.supportTicket.findFirst({
      where: identity.userId
        ? { userId: identity.userId }
        : { customerId: scopedCustomerId || "" },
      include: { messages: { orderBy: { createdAt: "asc" } } },
      orderBy: { updatedAt: "desc" },
    });

    // 1. Existing ticket: Atomic message insert & ticket update
    if (ticket) {
      const updateData: any = {
        status: "OPEN", // Re-open ticket on customer message
        updatedAt: new Date(),
      };

      if (userName) updateData.userName = userName;
      if (userPhone) updateData.userPhone = userPhone;
      if (userEmail !== undefined) updateData.userEmail = userEmail;
      if (userId && !ticket.userId) updateData.userId = userId;
      if (typeof isUserTyping === "boolean") updateData.isUserTyping = isUserTyping;

      await prisma.$transaction(async (tx) => {
        if (messageText || attachment) {
          await tx.supportMessage.create({
            data: {
              ticketId: ticket.id,
              senderRole: "user",
              senderName: userName || ticket.userName,
              text: messageText || "",
              attachment: attachment || null,
              isRead: false,
            },
          });
        }

        await tx.supportTicket.update({
          where: { id: ticket.id },
          data: updateData,
        });
      });

      const updatedTicket = await prisma.supportTicket.findUnique({
        where: { id: ticket.id },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });

      const mappedMessages = (updatedTicket?.messages || []).map((m) => ({
        id: m.id,
        sender: m.senderRole as "user" | "admin" | "bot",
        text: m.text,
        time: new Date(m.createdAt).toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
        adminName: m.senderName || undefined,
        read: m.isRead,
        attachment: m.attachment as any,
        createdAt: m.createdAt,
      }));

      return jsonWithIdentity({
        success: true,
        data: {
          ...updatedTicket,
          messages: mappedMessages,
        },
      }, identity);
    }

    // 2. New ticket: Atomic creation with initial message in a single transaction
    const newTicket = await prisma.$transaction(async (tx) => {
      const createdTicket = await tx.supportTicket.create({
        data: {
          userId: userId || null,
          customerId: scopedCustomerId || `guest-${crypto.randomUUID()}`,
          userName: userName || "სტუმარი",
          userPhone: userPhone || "+995 5XX XX XX XX",
          userEmail: userEmail || "",
          status: "OPEN",
          isUserTyping: Boolean(isUserTyping),
        },
      });

      if (messageText || attachment) {
        await tx.supportMessage.create({
          data: {
            ticketId: createdTicket.id,
            senderRole: "user",
            senderName: userName || "სტუმარი",
            text: messageText || "",
            attachment: attachment || null,
            isRead: false,
          },
        });
      }

      return createdTicket;
    });

    const fullTicket = await prisma.supportTicket.findUnique({
      where: { id: newTicket.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    const mappedMessages = (fullTicket?.messages || []).map((m) => ({
      id: m.id,
      sender: m.senderRole as "user" | "admin" | "bot",
      text: m.text,
      time: new Date(m.createdAt).toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
      adminName: m.senderName || undefined,
      read: m.isRead,
      attachment: m.attachment as any,
      createdAt: m.createdAt,
    }));

    return jsonWithIdentity({
      success: true,
      data: {
        ...fullTicket,
        messages: mappedMessages,
      },
    }, identity);
  } catch (error: any) {
    console.error("POST /api/support error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
