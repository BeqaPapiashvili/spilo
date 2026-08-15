import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const prisma = getPrismaClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    if (!userId && !sessionId) {
      return NextResponse.json({ success: true, items: [] });
    }

    const items = await prisma.compareItem.findMany({
      where: userId ? { userId } : { sessionId },
    });

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    return NextResponse.json({ success: true, items: [] });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrismaClient();
    const body = await request.json();
    const { userId, sessionId, productId } = body;

    if (!productId) {
      return NextResponse.json({ success: false, message: "productId required" }, { status: 400 });
    }

    const existing = await prisma.compareItem.findFirst({
      where: {
        productId,
        ...(userId ? { userId } : { sessionId }),
      },
    });

    if (existing) {
      await prisma.compareItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, isAdded: false });
    } else {
      const created = await prisma.compareItem.create({
        data: { userId, sessionId, productId },
      });
      return NextResponse.json({ success: true, isAdded: true, item: created });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
