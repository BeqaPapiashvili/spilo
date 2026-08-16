import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    // Check if user is logged in
    let userId: string | undefined;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
      if (token) {
        const payload = await verifyToken(token);
        if (payload?.userId) userId = payload.userId;
      }
    } catch {}

    const whereConditions: any[] = [];
    if (userId) whereConditions.push({ userId });
    if (customerId) whereConditions.push({ customerId });

    if (whereConditions.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        OR: whereConditions,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!ticket) {
      return NextResponse.json({ success: true, data: null });
    }

    const mappedMessages = ticket.messages.map((m) => ({
      id: m.id,
      sender: m.senderRole as "user" | "admin" | "bot",
      text: m.text,
      time: new Date(m.createdAt).toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
      adminName: m.senderName || undefined,
      read: m.isRead,
      attachment: m.attachment as any,
      createdAt: m.createdAt,
    }));

    return NextResponse.json({
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
        messages: mappedMessages,
        updatedAt: ticket.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("GET /api/support error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      customerId,
      userName,
      userPhone,
      userEmail,
      messageText,
      attachment,
      isUserTyping,
    } = body;

    let userId: string | undefined;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
      if (token) {
        const payload = await verifyToken(token);
        if (payload?.userId) userId = payload.userId;
      }
    } catch {}

    let ticket: any = null;

    if (id) {
      ticket = await prisma.supportTicket.findUnique({
        where: { id },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
    } else if (customerId) {
      ticket = await prisma.supportTicket.findFirst({
        where: { customerId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
        orderBy: { updatedAt: "desc" },
      });
    }

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

      return NextResponse.json({
        success: true,
        data: {
          ...updatedTicket,
          messages: mappedMessages,
        },
      });
    }

    // 2. New ticket: Atomic creation with initial message in a single transaction
    const newTicket = await prisma.$transaction(async (tx) => {
      const createdTicket = await tx.supportTicket.create({
        data: {
          userId: userId || null,
          customerId: customerId || `guest-${Date.now()}`,
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

    return NextResponse.json({
      success: true,
      data: {
        ...fullTicket,
        messages: mappedMessages,
      },
    });
  } catch (error: any) {
    console.error("POST /api/support error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
