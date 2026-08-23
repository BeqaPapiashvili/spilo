import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const mapped = tickets.map((t) => {
      const mappedMessages = t.messages.map((m) => ({
        id: m.id,
        sender: m.senderRole as "user" | "admin" | "bot",
        text: m.text,
        time: new Date(m.createdAt).toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
        adminName: m.senderName || undefined,
        read: m.isRead,
        attachment: m.attachment as any,
        createdAt: m.createdAt,
      }));

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
        isUserTyping: Boolean(t.isUserTyping),
        isAdminTyping: Boolean(t.isAdminTyping),
        typingAdminName: t.typingAdminName || "",
        assignedToName: t.assignedToName || "",
        time: new Date(t.updatedAt).toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
        messages: mappedMessages,
        updatedAt: t.updatedAt,
        createdAt: t.createdAt,
      };
    });

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    console.error("GET /api/admin/support error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const id = body.id;
    const customerId = body.customerId || "";
    const userName = body.userName || body.customerName;
    const userPhone = body.userPhone || body.customerPhone;
    const userEmail = body.userEmail || body.customerEmail || "";
    const { status, isUserTyping, isAdminTyping, typingAdminName, assignedToName, replyText, adminName } = body;

    let targetTicketId = id;

    if (id) {
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (customerId) updateData.customerId = customerId;
      if (userName) updateData.userName = userName;
      if (userPhone) updateData.userPhone = userPhone;
      if (userEmail !== undefined) updateData.userEmail = userEmail || "";
      if (status) updateData.status = status;
      if (typeof isUserTyping === "boolean") updateData.isUserTyping = isUserTyping;
      if (typeof isAdminTyping === "boolean") updateData.isAdminTyping = isAdminTyping;
      if (typingAdminName !== undefined) updateData.typingAdminName = typingAdminName || "";
      if (assignedToName !== undefined) updateData.assignedToName = assignedToName || "";

      await prisma.$transaction(async (tx) => {
        if (replyText) {
          await tx.supportMessage.create({
            data: {
              ticketId: id,
              senderRole: "admin",
              senderName: adminName || typingAdminName || "ოპერატორი",
              text: replyText,
              isRead: true,
            },
          });
        }

        await tx.supportTicket.update({
          where: { id },
          data: updateData,
        });
      });
    } else {
      const newTicket = await prisma.$transaction(async (tx) => {
        const created = await tx.supportTicket.create({
          data: {
            customerId: customerId || `guest-${Date.now()}`,
            userName: userName || "სტუმარი",
            userPhone: userPhone || "+995 5XX XX XX XX",
            userEmail: userEmail || "",
            status: status || "OPEN",
            isUserTyping: Boolean(isUserTyping),
            isAdminTyping: Boolean(isAdminTyping),
            typingAdminName: typingAdminName || "",
            assignedToName: assignedToName || "",
          },
        });

        if (replyText) {
          await tx.supportMessage.create({
            data: {
              ticketId: created.id,
              senderRole: "admin",
              senderName: adminName || typingAdminName || "ოპერატორი",
              text: replyText,
              isRead: true,
            },
          });
        }

        return created;
      });

      targetTicketId = newTicket.id;
    }

    const fullTicket = await prisma.supportTicket.findUnique({
      where: { id: targetTicketId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!fullTicket) {
      return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });
    }

    const mappedMessages = fullTicket.messages.map((m) => ({
      id: m.id,
      sender: m.senderRole as "user" | "admin" | "bot",
      text: m.text,
      time: new Date(m.createdAt).toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
      adminName: m.senderName || undefined,
      read: m.isRead,
      attachment: m.attachment as any,
      createdAt: m.createdAt,
    }));

    const mappedResult = {
      id: fullTicket.id,
      customerId: fullTicket.customerId || "",
      customerName: fullTicket.userName,
      customerPhone: fullTicket.userPhone,
      customerEmail: fullTicket.userEmail || "",
      userName: fullTicket.userName,
      userPhone: fullTicket.userPhone,
      userEmail: fullTicket.userEmail || "",
      topic: fullTicket.topic || "ონლაინ კონსულტაცია",
      status: fullTicket.status,
      isUserTyping: Boolean(fullTicket.isUserTyping),
      isAdminTyping: Boolean(fullTicket.isAdminTyping),
      typingAdminName: fullTicket.typingAdminName || "",
      assignedToName: fullTicket.assignedToName || "",
      time: new Date(fullTicket.updatedAt).toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
      messages: mappedMessages,
    };

    return NextResponse.json({ success: true, data: mappedResult });
  } catch (error: any) {
    console.error("Support POST Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.supportMessage.deleteMany({ where: { ticketId: id } });
      await tx.supportTicket.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Support ticket delete error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
