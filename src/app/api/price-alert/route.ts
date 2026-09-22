import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/jwt";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const rate = await enforceRateLimit(request, {
      namespace: "price_alert",
      limit: 8,
      windowSeconds: 15 * 60,
      customMessage: "ძალიან ბევრი მოთხოვნა. გთხოვთ სცადოთ მოგვიანებით.",
    });
    if (!rate.success && rate.response) return rate.response;

    const session = await getAuthSession(request);
    const body = await request.json();
    const { productId, email, targetPrice } = body;
    const resolvedEmail = String(session?.email || email || "").trim().toLowerCase();

    if (!productId || !resolvedEmail.includes("@") || targetPrice === undefined) {
      return NextResponse.json(
        { success: false, error: "პროდუქტი, ელფოსტა და სამიზნე ფასი აუცილებელია" },
        { status: 400 }
      );
    }

    const alert = await prisma.priceAlert.create({
      data: {
        productId,
        userId: session?.userId || null,
        email: resolvedEmail,
        targetPrice: Number(targetPrice),
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: alert.id, productId: alert.productId, targetPrice: alert.targetPrice },
      message: "ფასის დაკლების შეტყობინება გააქტიურებულია",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "შენახვა ვერ მოხერხდა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
