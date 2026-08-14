import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error: any) {
    console.error("GET /api/coupons error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, discount, validUntil, isActive } = body;

    if (!code || discount === undefined) {
      return NextResponse.json(
        { success: false, error: "კუპონის კოდი და ფასდაკლების ოდენობა აუცილებელია" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        discount: Number(discount),
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      data: coupon,
      message: "კუპონი შეიქმნა MySQL ბაზაში",
    });
  } catch (error: any) {
    console.error("POST /api/coupons error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "კუპონის შექმნა ვერ მოხერხდა" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "კუპონის ID აუცილებელია" },
        { status: 400 }
      );
    }

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "კუპონი წაიშალა MySQL ბაზიდან",
    });
  } catch (error: any) {
    console.error("DELETE /api/coupons error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "კუპონის წაშლა ვერ მოხერხდა" },
      { status: 500 }
    );
  }
}
