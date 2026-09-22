import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/jwt";
import {
  createThreeDPayment,
  gatewayChargeAmount,
  getClientIp,
  getRequestOrigin,
  isUnitedPaymentConfigured,
  normalizeGsm,
} from "@/lib/unitedPayment";

export async function POST(request: Request) {
  try {
    if (!isUnitedPaymentConfigured()) {
      return NextResponse.json(
        { success: false, error: "United Payment სატესტო ანგარიში ჯერ არ არის კონფიგურირებული." },
        { status: 503 }
      );
    }

    const session = await getAuthSession(request);
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "ავტორიზაცია აუცილებელია" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const orderId = String(body.orderId || body.orderNumber || "").trim();
    const installmentNumber = Math.max(1, Math.min(12, Number(body.installmentNumber || 1)));

    if (!orderId) {
      return NextResponse.json({ success: false, error: "შეკვეთის ID აუცილებელია" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "შეკვეთა ვერ მოიძებნა" }, { status: 404 });
    }
    if (order.userId !== session.userId) {
      return NextResponse.json({ success: false, error: "წვდომა შეზღუდულია" }, { status: 403 });
    }
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ success: false, error: "ეს შეკვეთა უკვე გადახდილია" }, { status: 409 });
    }
    if (order.status === "CANCELLED") {
      return NextResponse.json({ success: false, error: "გაუქმებულ შეკვეთაზე გადახდა შეუძლებელია" }, { status: 409 });
    }

    const origin = getRequestOrigin(request);
    const clientIp = getClientIp(request);
    const buyer = {
      fullName: order.customerName,
      email: order.customerEmail || "",
      gsm: normalizeGsm(order.contactPhone),
      address: order.shippingAddress,
    };

    const usedInstallment = installmentNumber;
    const chargeAmount = gatewayChargeAmount(Number(order.totalAmount), usedInstallment);
    const otherTrxCode = crypto.randomUUID().replace(/-/g, "").toUpperCase();
    const installmentLabel =
      usedInstallment >= 2 ? ` · განვადება ${usedInstallment} თვე` : "";

    const result = await createThreeDPayment({
      amount: chargeAmount,
      clientIp,
      otherTrxCode,
      redirectUrl: `${origin}/api/payments/united/callback?trx=${encodeURIComponent(otherTrxCode)}`,
      installmentNumber: usedInstallment,
      description: `შეკვეთა ${order.orderNumber}${installmentLabel}`,
      buyer,
    });

    await prisma.payment.updateMany({
      where: { orderId: order.id, status: "PENDING" },
      data: { status: "SUPERSEDED" },
    });

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "UNITED_PAYMENT",
        status: "PENDING",
        amount: chargeAmount,
        currency: "GEL",
        installmentNumber: usedInstallment,
        otherTrxCode,
        codeForHash: result.codeForHash,
        threeDUrl: result.url,
        rawResponse: JSON.stringify(result.raw),
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PENDING" },
    });

    return NextResponse.json({
      success: true,
      redirectUrl: result.url,
      paymentId: payment.id,
      orderNumber: order.orderNumber,
      installmentNumber: usedInstallment,
      chargeAmount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "გადახდის დაწყება ვერ მოხერხდა";
    console.error("POST /api/checkout/create-payment error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
