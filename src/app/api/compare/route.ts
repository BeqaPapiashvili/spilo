import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const prisma = getPrismaClient() as any;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    if (!userId && !sessionId || !prisma.compareItem) {
      return NextResponse.json({ success: true, items: [] });
    }

    const items = await prisma.compareItem.findMany({
      where: userId ? { userId } : { sessionId },
    });

    if (Array.isArray(items) && items.length > 0) {
      const productIds = items.map((i: any) => i.productId).filter(Boolean);
      const existingProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true },
      });
      const existingIds = new Set(existingProducts.map((p: any) => p.id));
      const validItems = items.filter((i: any) => existingIds.has(i.productId));
      return NextResponse.json({ success: true, items: validItems });
    }

    return NextResponse.json({ success: true, items: [] });
  } catch (error: any) {
    return NextResponse.json({ success: true, items: [] });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrismaClient() as any;
    const body = await request.json();
    const { userId, sessionId, productId } = body;

    if (!productId) {
      return NextResponse.json({ success: false, message: "productId required" }, { status: 400 });
    }

    if (!prisma.compareItem) {
      return NextResponse.json({ success: true, isAdded: true });
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

export async function DELETE(request: Request) {
  try {
    const prisma = getPrismaClient() as any;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");
    const productId = searchParams.get("productId");

    if (!userId && !sessionId || !prisma.compareItem) {
      return NextResponse.json({ success: true });
    }

    if (productId) {
      await prisma.compareItem.deleteMany({
        where: {
          productId,
          ...(userId ? { userId } : { sessionId }),
        },
      });
    } else {
      await prisma.compareItem.deleteMany({
        where: userId ? { userId } : { sessionId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
