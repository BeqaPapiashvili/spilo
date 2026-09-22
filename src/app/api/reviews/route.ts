import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/jwt";

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

export async function POST(request: Request) {
  try {
    const session = await getAuthSession(request);
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: "შეფასების დასამატებლად გაიარეთ ავტორიზაცია" },
        { status: 401 }
      );
    }
    const body = await request.json();
    const { productId, rating, comment } = body;

    if (!productId || rating === undefined) {
      return NextResponse.json(
        { success: false, error: "პროდუქტი და შეფასება აუცილებელია" },
        { status: 400 }
      );
    }

    const purchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId: session.userId, status: { in: ["DELIVERED", "SHIPPED"] } },
      },
    });

    const newReview = await prisma.review.create({
      data: {
        productId,
        userId: session.userId,
        author: session.name || "მომხმარებელი",
        rating: Math.min(5, Math.max(1, Number(rating))),
        comment: String(comment || "").trim().slice(0, 2000),
        verifiedPurchase: Boolean(purchased),
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

