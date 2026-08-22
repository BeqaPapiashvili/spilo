import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    const where: any = {};
    if (productId) where.productId = productId;

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { getAuthSession } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession(request);
    const body = await request.json();
    const { productId, author, rating, comment } = body;

    if (!productId || (!author && !session?.name) || rating === undefined) {
      return NextResponse.json({ success: false, error: "Product ID, author, and rating are required" }, { status: 400 });
    }

    const resolvedAuthor = session?.name || author.trim();
    const resolvedUserId = session?.userId || null;

    const newReview = await prisma.review.create({
      data: {
        productId,
        userId: resolvedUserId,
        author: resolvedAuthor,
        rating: Math.min(5, Math.max(1, Number(rating))),
        comment: (comment || "").trim(),
        verifiedPurchase: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newReview,
      message: "შეფასება წარმატებით დაემატა",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

