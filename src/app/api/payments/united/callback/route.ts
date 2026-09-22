import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { verifyThreeDHash } from "@/lib/unitedPayment";

async function readCallbackFields(request: Request): Promise<Record<string, string>> {
  const url = new URL(request.url);
  const fields: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    fields[key] = value;
  });

  if (request.method === "POST") {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await request.json().catch(() => ({}));
      Object.entries(json || {}).forEach(([key, value]) => {
        if (value != null) fields[key] = String(value);
      });
    } else {
      const form = await request.formData().catch(() => null);
      if (form) {
        form.forEach((value, key) => {
          fields[key] = String(value);
        });
      }
    }
  }

  return fields;
}

function pick(fields: Record<string, string>, names: string[]): string {
  for (const name of names) {
    if (fields[name]) return fields[name];
  }
  const lower = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k.toLowerCase(), v]));
  for (const name of names) {
    if (lower[name.toLowerCase()]) return lower[name.toLowerCase()];
  }
  return "";
}

function appOrigin(request: Request): string {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (host?.includes("localhost") || host?.startsWith("127.") || host?.startsWith("192.168.") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002").replace(/\/$/, "");
}

async function finalizePayment(request: Request) {
  const fields = await readCallbackFields(request);
  const origin = appOrigin(request);

  const otherTrxCode = pick(fields, ["OtherTrxCode", "otherTrxCode", "trx", "MyTrxId"]);
  const hashValue = pick(fields, ["hashValue", "HashValue"]);
  const trxCode = pick(fields, ["trxCode", "TrxCode", "VirtualPosOrderId"]);
  const resultCode = pick(fields, ["resultCode", "ResultCode"]);
  const resultMessage = pick(fields, ["resultMessage", "ResultMessage"]);

  const payment = otherTrxCode
    ? await prisma.payment.findUnique({
        where: { otherTrxCode },
        include: { order: { include: { items: true } } },
      })
    : null;

  if (!payment) {
    return NextResponse.redirect(`${origin}/checkout/failed?reason=not_found`);
  }

  const orderNumber = payment.order.orderNumber;
  const successUrl = `${origin}/checkout/success?orderId=${encodeURIComponent(orderNumber)}`;
  const failUrl = `${origin}/checkout/failed?orderId=${encodeURIComponent(orderNumber)}`;

  if (payment.status === "PAID" || payment.order.paymentStatus === "PAID") {
    return NextResponse.redirect(successUrl);
  }

  const hashResult = verifyThreeDHash(payment.codeForHash || "", hashValue);
  const paid = hashResult === "SUCCESS";
  const status = paid ? "PAID" : hashResult === "FAIL" ? "FAILED" : "FAILED";

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status,
        virtualPosOrderId: trxCode || payment.virtualPosOrderId,
        resultCode: resultCode || hashResult,
        resultMessage: resultMessage || (hashResult === "INVALID" ? "hash mismatch" : resultMessage),
        rawCallback: JSON.stringify(fields),
      },
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: paid ? "PAID" : "FAILED" },
    });
  });

  if (paid && payment.order.customerEmail?.includes("@")) {
    sendOrderConfirmationEmail({
      to: payment.order.customerEmail,
      name: payment.order.customerName,
      orderNumber: payment.order.orderNumber,
      totalAmount: payment.order.totalAmount,
      paymentMethod: payment.order.paymentMethod,
      items: payment.order.items.map((i) => ({
        title: i.title,
        quantity: i.quantity,
        price: i.price,
      })),
      shippingAddress: payment.order.shippingAddress,
    }).catch((err) => console.warn("[Payment email] ", err));
  }

  return NextResponse.redirect(paid ? successUrl : failUrl);
}

export async function GET(request: Request) {
  return finalizePayment(request);
}

export async function POST(request: Request) {
  return finalizePayment(request);
}
