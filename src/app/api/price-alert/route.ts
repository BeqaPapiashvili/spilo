import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, userId, email, targetPrice } = body;

    if (!productId || !email || targetPrice === undefined) {
      return NextResponse.json({ success: false, error: "Product ID, email, and target price are required" }, { status: 400 });
    }

    const alert = await prisma.priceAlert.create({
      data: {
        productId,
        userId: userId || null,
        email: email.trim().toLowerCase(),
        targetPrice: Number(targetPrice),
      },
    });

    return NextResponse.json({
      success: true,
      data: alert,
      message: "ფასის დაკლების შეტყობინება გააქტიურებულია",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
