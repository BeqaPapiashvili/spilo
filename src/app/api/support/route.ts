import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonWithIdentity, resolveIdentity } from "@/lib/identity";
import { enforceRateLimit } from "@/lib/rateLimit";
import {
  MAX_EMAIL_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PHONE_LENGTH,
  clampText,
  isSupportAdminOnline,
  isTypingFresh,
  mapSupportMessage,
  sanitizeAttachment,
} from "@/lib/supportChat";

const RATE_LIMIT_MESSAGE = "ძალიან ბევრი შეტყობინება. გთხოვთ სცადოთ მოგვიანებით.";

function findTicket(identity: { userId?: string | null; sessionId?: string | null }) {
  return prisma.supportTicket.findFirst({
    where: identity.userId
      ? { userId: identity.userId }
      : { customerId: identity.sessionId || "" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });
}

type TicketWithMessages = NonNullable<Awaited<ReturnType<typeof findTicket>>>;

function serializeTicket(ticket: TicketWithMessages) {
  return {
    id: ticket.id,
    customerId: ticket.customerId,
    userName: ticket.userName,
    userPhone: ticket.userPhone,
    userEmail: ticket.userEmail,
    status: ticket.status,
    isUserTyping: isTypingFresh(ticket.isUserTyping, ticket.updatedAt),
    isAdminTyping: isTypingFresh(ticket.isAdminTyping, ticket.updatedAt),
    typingAdminName: ticket.typingAdminName,
    assignedToName: ticket.assignedToName,
    messages: ticket.messages.map(mapSupportMessage),
    unreadAdminCount: ticket.messages.filter((m) => m.senderRole === "admin" && !m.isRead).length,
    updatedAt: ticket.updatedAt,
    adminOnline: isSupportAdminOnline(),
  };
}

export async function GET(request: Request) {
  try {
    const identity = await resolveIdentity(request);
    let ticket = await findTicket(identity);

    const markRead = new URL(request.url).searchParams.get("markRead") === "1";
    if (ticket && markRead && ticket.messages.some((m) => m.senderRole === "admin" && !m.isRead)) {
      await prisma.supportMessage.updateMany({
        where: { ticketId: ticket.id, senderRole: "admin", isRead: false },
        data: { isRead: true },
      });
      ticket = await findTicket(identity);
    }

    return jsonWithIdentity(
      {
        success: true,
        data: ticket ? serializeTicket(ticket) : null,
        adminOnline: isSupportAdminOnline(),
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
    const body = await request.json().catch(() => ({}));
    const identity = await resolveIdentity(request);
    const userId = identity.userId || undefined;
    const scopedCustomerId = identity.userId ? identity.userId : identity.sessionId;
    const rateIdentifier = identity.userId || identity.sessionId || undefined;

    if (body.endChat === true) {
      const current = await findTicket(identity);
      if (current && current.status === "OPEN") {
        await prisma.$transaction([
          prisma.supportMessage.create({
            data: {
              ticketId: current.id,
              senderRole: "bot",
              senderName: "system",
              text: "საუბარი დაასრულა მომხმარებელმა",
              isRead: false,
            },
          }),
          prisma.supportTicket.update({
            where: { id: current.id },
            data: { status: "CLOSED", isUserTyping: false, isAdminTyping: false, typingAdminName: "" },
          }),
        ]);
      }
      return jsonWithIdentity({ success: true, data: null }, identity);
    }

    const rawText = typeof body.messageText === "string" ? body.messageText.trim() : "";
    if (rawText.length > MAX_MESSAGE_LENGTH) {
      return jsonWithIdentity(
        { success: false, error: `შეტყობინება ძალიან გრძელია (მაქს. ${MAX_MESSAGE_LENGTH} სიმბოლო)` },
        identity,
        { status: 400 }
      );
    }

    const attachment = sanitizeAttachment(body.attachment);
    if (attachment === "invalid") {
      return jsonWithIdentity({ success: false, error: "დაუშვებელი მიმაგრებული ფაილი" }, identity, {
        status: 400,
      });
    }

    const userName = clampText(body.userName, MAX_NAME_LENGTH);
    const userPhone = clampText(body.userPhone, MAX_PHONE_LENGTH);
    const userEmail = body.userEmail === undefined ? undefined : clampText(body.userEmail, MAX_EMAIL_LENGTH);
    const isUserTyping = typeof body.isUserTyping === "boolean" ? body.isUserTyping : undefined;
    const hasMessage = Boolean(rawText || attachment);

    if (hasMessage) {
      const rate = await enforceRateLimit(request, {
        namespace: "support_message",
        identifier: rateIdentifier,
        limit: 20,
        windowSeconds: 60,
        customMessage: RATE_LIMIT_MESSAGE,
      });
      if (!rate.success && rate.response) return rate.response;
    }

    const ticket = await findTicket(identity);

    if (ticket) {
      const updateData: Record<string, unknown> = {};
      if (hasMessage) updateData.status = "OPEN";
      if (userName) updateData.userName = userName;
      if (userPhone) updateData.userPhone = userPhone;
      if (userEmail !== undefined) updateData.userEmail = userEmail;
      if (userId && !ticket.userId) updateData.userId = userId;
      if (hasMessage) updateData.isUserTyping = false;
      else if (isUserTyping !== undefined) updateData.isUserTyping = isUserTyping;

      await prisma.$transaction(async (tx) => {
        if (hasMessage) {
          await tx.supportMessage.create({
            data: {
              ticketId: ticket.id,
              senderRole: "user",
              senderName: userName || ticket.userName,
              text: rawText,
              attachment: attachment || undefined,
              isRead: false,
            },
          });
        }
        if (Object.keys(updateData).length > 0) {
          await tx.supportTicket.update({ where: { id: ticket.id }, data: updateData });
        }
      });

      const updatedTicket = await findTicket(identity);
      return jsonWithIdentity(
        { success: true, data: updatedTicket ? serializeTicket(updatedTicket) : null },
        identity
      );
    }

    if (!hasMessage) {
      return jsonWithIdentity({ success: true, data: null }, identity);
    }

    const ticketRate = await enforceRateLimit(request, {
      namespace: "support_new_ticket",
      limit: 5,
      windowSeconds: 60 * 60,
      customMessage: RATE_LIMIT_MESSAGE,
    });
    if (!ticketRate.success && ticketRate.response) return ticketRate.response;

    await prisma.$transaction(async (tx) => {
      const createdTicket = await tx.supportTicket.create({
        data: {
          userId: userId || null,
          customerId: scopedCustomerId || `guest-${crypto.randomUUID()}`,
          userName: userName || "სტუმარი",
          userPhone: userPhone || "+995 5XX XX XX XX",
          userEmail: userEmail || "",
          status: "OPEN",
          isUserTyping: false,
        },
      });

      await tx.supportMessage.create({
        data: {
          ticketId: createdTicket.id,
          senderRole: "user",
          senderName: userName || "სტუმარი",
          text: rawText,
          attachment: attachment || undefined,
          isRead: false,
        },
      });
    });

    const fullTicket = await findTicket(identity);
    return jsonWithIdentity(
      { success: true, data: fullTicket ? serializeTicket(fullTicket) : null },
      identity
    );
  } catch (error: unknown) {
    console.error("POST /api/support error:", error);
    const message = error instanceof Error ? error.message : "შეტყობინების გაგზავნა ვერ მოხერხდა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
