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

    const items = await prisma.recentlyViewed.findMany({
      where: userId ? { userId } : { sessionId },
      orderBy: { updatedAt: "desc" },
      take: 10,
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

    const existing = await prisma.recentlyViewed.findFirst({
      where: {
        productId,
        ...(userId ? { userId } : { sessionId }),
      },
    });

    if (existing) {
      await prisma.recentlyViewed.update({
        where: { id: existing.id },
        data: { updatedAt: new Date() },
      });
    } else {
      await prisma.recentlyViewed.create({
        data: { userId, sessionId, productId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
