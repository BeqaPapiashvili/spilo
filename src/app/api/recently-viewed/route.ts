import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { identityWhere, jsonWithIdentity, resolveIdentity } from "@/lib/identity";

export async function GET(request: Request) {
  try {
    const identity = await resolveIdentity(request);
    const prisma = getPrismaClient();
    const items = await prisma.recentlyViewed.findMany({
      where: identityWhere(identity),
      orderBy: { updatedAt: "desc" },
      take: 10,
    });
    return jsonWithIdentity({ success: true, items }, identity);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "ისტორია ვერ ჩაიტვირთა";
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

    const existing = await prisma.recentlyViewed.findFirst({
      where: { productId, ...identityWhere(identity) },
    });

    if (existing) {
      await prisma.recentlyViewed.update({
        where: { id: existing.id },
        data: { updatedAt: new Date() },
      });
    } else {
      await prisma.recentlyViewed.create({
        data: {
          productId,
          userId: identity.userId,
          sessionId: identity.sessionId,
        },
      });
    }

    return jsonWithIdentity({ success: true }, identity);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "შენახვა ვერ მოხერხდა";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
