import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { identityWhere, jsonWithIdentity, resolveIdentity } from "@/lib/identity";

export async function GET(request: Request) {
  try {
    const identity = await resolveIdentity(request);
    const prisma = getPrismaClient();
    const items = await prisma.wishlistItem.findMany({
      where: identityWhere(identity),
    });
    return jsonWithIdentity({ success: true, items }, identity);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "სურვილების სია ვერ ჩაიტვირთა";
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

    const existing = await prisma.wishlistItem.findFirst({
      where: { productId, ...identityWhere(identity) },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return jsonWithIdentity({ success: true, isAdded: false }, identity);
    }

    const created = await prisma.wishlistItem.create({
      data: {
        productId,
        userId: identity.userId,
        sessionId: identity.sessionId,
      },
    });
    return jsonWithIdentity({ success: true, isAdded: true, item: created }, identity);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "სურვილების სია ვერ განახლდა";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
