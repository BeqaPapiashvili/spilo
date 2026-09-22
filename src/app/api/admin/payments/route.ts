import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/jwt";
import { recordAuditLog } from "@/lib/audit";
import { refundPayment, voidPayment } from "@/lib/unitedPayment";

async function loadPaidPayment(orderId: string) {
  const order = await prisma.order.findFirst({
    where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
    include: { payments: { orderBy: { createdAt: "desc" as const } } },
  });
  if (!order) return { ok: false as const, error: "შეკვეთა ვერ მოიძებნა", status: 404 as const };
  const payment = order.payments.find((p) => p.status === "PAID") || order.payments[0];
  if (!payment) return { ok: false as const, error: "გადახდა ვერ მოიძებნა", status: 404 as const };
  return { ok: true as const, order, payment };
}

export async function POST(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => ({}));
    const orderId = String(body.orderId || "").trim();
    const action = String(body.action || "refund").toLowerCase();
    const amount = body.amount != null ? Number(body.amount) : undefined;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "შეკვეთის ID აუცილებელია" }, { status: 400 });
    }

    const loaded = await loadPaidPayment(orderId);
    if (!loaded.ok) {
      return NextResponse.json({ success: false, error: loaded.error }, { status: loaded.status });
    }
    const { order, payment } = loaded;

    if (action === "void") {
      const raw = await voidPayment({
        virtualPosOrderId: payment.virtualPosOrderId || undefined,
        otherTrxCode: payment.otherTrxCode,
      });
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "VOIDED", resultCode: raw.Data?.ResultCode || raw.ResultCode, rawResponse: JSON.stringify(raw) },
      });
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "VOIDED" },
      });
      await recordAuditLog({
        userId: session?.userId,
        adminEmail: session?.email,
        adminName: session?.name,
        action: "PAYMENT_VOID",
        entity: "Payment",
        target: `#${order.orderNumber}`,
        details: `United Payment ტრანზაქცია გაუქმდა`,
      });
      return NextResponse.json({ success: true, message: "ტრანზაქცია გაუქმდა" });
    }

    const raw = await refundPayment({
      virtualPosOrderId: payment.virtualPosOrderId || undefined,
      otherTrxCode: payment.otherTrxCode,
      amount,
    });
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: amount && amount > 0 && amount < payment.amount ? "PARTIAL_REFUND" : "REFUNDED",
        refundRequestId: raw.Data?.RefundRequestId || null,
        rawResponse: JSON.stringify(raw),
      },
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: amount && amount > 0 && amount < payment.amount ? "PARTIAL_REFUND" : "REFUNDED" },
    });
    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "PAYMENT_REFUND",
      entity: "Payment",
      target: `#${order.orderNumber}`,
      details: `United Payment დაბრუნება${amount ? `: ${amount} ₾` : " (სრული)"}`,
    });
    return NextResponse.json({ success: true, message: "დაბრუნების მოთხოვნა გაიგზავნა", refundRequestId: raw.Data?.RefundRequestId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "გადახდის ოპერაცია ვერ შესრულდა";
    console.error("POST /api/admin/payments error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const { errorResponse } = await requireAdminSession(request);
  if (errorResponse) return errorResponse;

  return NextResponse.json({
    success: true,
    configured: Boolean(
      process.env.UNITED_PAYMENT_DEALER_CODE &&
        process.env.UNITED_PAYMENT_USERNAME &&
        process.env.UNITED_PAYMENT_PASSWORD
    ),
    dealerCode: process.env.UNITED_PAYMENT_DEALER_CODE || null,
    bankCode: Number(process.env.UNITED_PAYMENT_BANK_CODE || 1),
    testMode: true,
    provider: "United Payment",
  });
}
