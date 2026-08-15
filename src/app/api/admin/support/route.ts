import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrismaClient();
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { updatedAt: "desc" },
    });

    // Map fields so both customerName/customerPhone and userName/userPhone exist along with customerId & typing status
    const mapped = tickets.map((t) => ({
      id: t.id,
      customerId: t.customerId || "",
      customerName: t.userName,
      customerPhone: t.userPhone,
      customerEmail: t.userEmail || "",
      userName: t.userName,
      userPhone: t.userPhone,
      userEmail: t.userEmail || "",
      topic: "ონლაინ კონსულტაცია",
      status: t.status as "OPEN" | "CLOSED" | "RESOLVED",
      isUserTyping: Boolean(t.isUserTyping),
      isAdminTyping: Boolean(t.isAdminTyping),
      typingAdminName: t.typingAdminName || "",
      assignedToName: t.assignedToName || "",
      time: new Date(t.updatedAt).toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
      messages: Array.isArray(t.messages) ? t.messages : [],
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrismaClient();
    const body = await request.json();

    // Accept both field naming conventions: { userName, userPhone } and { customerName, customerPhone }
    const id = body.id;
    const customerId = body.customerId || "";
    const userName = body.userName || body.customerName;
    const userPhone = body.userPhone || body.customerPhone;
    const userEmail = body.userEmail || body.customerEmail || "";
    const { status, messages, isUserTyping, isAdminTyping, typingAdminName, assignedToName } = body;

    let result;

    if (id) {
      const updateData: any = {};
      if (customerId) updateData.customerId = customerId;
      if (userName) updateData.userName = userName;
      if (userPhone) updateData.userPhone = userPhone;
      if (userEmail !== undefined) updateData.userEmail = userEmail || "";
      if (status) updateData.status = status;
      if (typeof isUserTyping === "boolean") updateData.isUserTyping = isUserTyping;
      if (typeof isAdminTyping === "boolean") updateData.isAdminTyping = isAdminTyping;
      if (typingAdminName !== undefined) updateData.typingAdminName = typingAdminName || "";
      if (assignedToName !== undefined) updateData.assignedToName = assignedToName || "";
      if (messages !== undefined && Array.isArray(messages)) updateData.messages = messages;

      try {
        result = await prisma.supportTicket.upsert({
          where: { id },
          update: updateData,
          create: {
            id, // Preserves client-generated id (e.g. tkt-178680...)
            customerId: customerId || "",
            userName: userName || "სტუმარი",
            userPhone: userPhone || "+995 5XX XX XX XX",
            userEmail: userEmail || "",
            status: status || "OPEN",
            isUserTyping: Boolean(isUserTyping),
            isAdminTyping: Boolean(isAdminTyping),
            typingAdminName: typingAdminName || "",
            assignedToName: assignedToName || "",
            messages: Array.isArray(messages) ? messages : [],
          },
        });
      } catch (err: any) {
        if (err?.message?.includes("Unknown argument")) {
          delete updateData.typingAdminName;
          delete updateData.assignedToName;
          result = await prisma.supportTicket.upsert({
            where: { id },
            update: updateData,
            create: {
              id,
              customerId: customerId || "",
              userName: userName || "სტუმარი",
              userPhone: userPhone || "+995 5XX XX XX XX",
              userEmail: userEmail || "",
              status: status || "OPEN",
              isUserTyping: Boolean(isUserTyping),
              isAdminTyping: Boolean(isAdminTyping),
              messages: Array.isArray(messages) ? messages : [],
            },
          });
        } else {
          throw err;
        }
      }
    } else {
      if (!userName || !userPhone) {
        return NextResponse.json({ success: false, message: "Name and phone required" }, { status: 400 });
      }

      try {
        result = await prisma.supportTicket.create({
          data: {
            customerId: customerId || "",
            userName,
            userPhone,
            userEmail: userEmail || "",
            status: status || "OPEN",
            isUserTyping: Boolean(isUserTyping),
            isAdminTyping: Boolean(isAdminTyping),
            typingAdminName: typingAdminName || "",
            assignedToName: assignedToName || "",
            messages: Array.isArray(messages) ? messages : [],
          },
        });
      } catch (err: any) {
        if (err?.message?.includes("Unknown argument")) {
          result = await prisma.supportTicket.create({
            data: {
              customerId: customerId || "",
              userName,
              userPhone,
              userEmail: userEmail || "",
              status: status || "OPEN",
              isUserTyping: Boolean(isUserTyping),
              isAdminTyping: Boolean(isAdminTyping),
              messages: Array.isArray(messages) ? messages : [],
            },
          });
        } else {
          throw err;
        }
      }
    }

    const mappedResult = {
      id: result.id,
      customerId: result.customerId || "",
      customerName: result.userName,
      customerPhone: result.userPhone,
      customerEmail: result.userEmail || "",
      userName: result.userName,
      userPhone: result.userPhone,
      userEmail: result.userEmail || "",
      topic: "ონლაინ კონსულტაცია",
      status: result.status,
      isUserTyping: Boolean(result.isUserTyping),
      isAdminTyping: Boolean(result.isAdminTyping),
      typingAdminName: result.typingAdminName || "",
      assignedToName: result.assignedToName || "",
      time: new Date(result.updatedAt).toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
      messages: Array.isArray(result.messages) ? result.messages : [],
    };

    return NextResponse.json({ success: true, data: mappedResult });
  } catch (error: any) {
    console.error("Support POST Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const prisma = getPrismaClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    await prisma.supportTicket.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
