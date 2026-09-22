import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { identityWhere, jsonWithIdentity, resolveIdentity } from "@/lib/identity";

export async function GET(request: Request) {
  try {
    const identity = await resolveIdentity(request);
    const prisma = getPrismaClient();

    const items = await prisma.compareItem.findMany({
      where: identityWhere(identity),
    });

    if (items.length === 0) {
      return jsonWithIdentity({ success: true, items: [] }, identity);
    }

    const productIds = items.map((i) => i.productId).filter(Boolean);
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true },
    });
    const existingIds = new Set(existingProducts.map((p) => p.id));
    const validItems = items.filter((i) => existingIds.has(i.productId));
    return jsonWithIdentity({ success: true, items: validItems }, identity);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "შედარების სია ვერ ჩაიტვირთა";
    return NextResponse.json({ success: false, error: message, items: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const identity = await resolveIdentity(request);
    const prisma = getPrismaClient();
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return jsonWithIdentity({ success: false, message: "პროდუქტის ID აუცილებელია" }, identity, {
        status: 400,
      });
    }

    const existing = await prisma.compareItem.findFirst({
      where: { productId, ...identityWhere(identity) },
    });

    if (existing) {
      await prisma.compareItem.delete({ where: { id: existing.id } });
      return jsonWithIdentity({ success: true, isAdded: false }, identity);
    }

    const created = await prisma.compareItem.create({
      data: {
        productId,
        userId: identity.userId,
        sessionId: identity.sessionId,
      },
    });
    return jsonWithIdentity({ success: true, isAdded: true, item: created }, identity);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "შედარების სია ვერ განახლდა";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const identity = await resolveIdentity(request);
    const prisma = getPrismaClient();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const scope = identityWhere(identity);

    if (productId) {
      await prisma.compareItem.deleteMany({ where: { productId, ...scope } });
    } else {
      await prisma.compareItem.deleteMany({ where: scope });
    }

    return jsonWithIdentity({ success: true }, identity);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "წაშლა ვერ მოხერხდა";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
