import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    const mapped = coupons.map((c) => ({
      id: c.id,
      code: c.code,
      discountType: (c.discountType as "percentage" | "fixed") || "percentage",
      discountValue: c.discountValue !== null && c.discountValue !== undefined ? c.discountValue : (c.discount || 0),
      discount: c.discount !== null && c.discount !== undefined ? c.discount : (c.discountValue || 0),
      minOrderAmount: c.minOrderAmount || 0,
      startDate: c.startDate || "2026-01-01",
      endDate: c.endDate || "2026-12-31",
      usedCount: c.usedCount || 0,
      status: (c.status as "ACTIVE" | "EXPIRED" | "DISABLED") || (c.isActive ? "ACTIVE" : "DISABLED"),
      validUntil: c.validUntil,
      isActive: c.isActive,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      count: mapped.length,
      data: mapped,
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
    const id = body.id;
    const code = (body.code || "COUPON").trim().toUpperCase();
    const discountVal = body.discountValue !== undefined ? Number(body.discountValue) : (body.discount !== undefined ? Number(body.discount) : 0);
    const discountType = body.discountType || "percentage";
    const minOrderAmount = body.minOrderAmount !== undefined ? Number(body.minOrderAmount) : 0;
    const startDate = body.startDate || "2026-01-01";
    const endDate = body.endDate || "2026-12-31";
    const usedCount = body.usedCount !== undefined ? Number(body.usedCount) : 0;
    const status = body.status || "ACTIVE";
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : status === "ACTIVE";
    const validUntil = body.validUntil ? new Date(body.validUntil) : null;

    let coupon;

    if (id) {
      coupon = await prisma.coupon.upsert({
        where: { id },
        update: {
          code,
          discount: discountVal,
          discountValue: discountVal,
          discountType,
          minOrderAmount,
          startDate,
          endDate,
          usedCount,
          status,
          isActive,
          validUntil,
        },
        create: {
          id,
          code,
          discount: discountVal,
          discountValue: discountVal,
          discountType,
          minOrderAmount,
          startDate,
          endDate,
          usedCount,
          status,
          isActive,
          validUntil,
        },
      });
    } else {
      coupon = await prisma.coupon.upsert({
        where: { code },
        update: {
          discount: discountVal,
          discountValue: discountVal,
          discountType,
          minOrderAmount,
          startDate,
          endDate,
          usedCount,
          status,
          isActive,
          validUntil,
        },
        create: {
          code,
          discount: discountVal,
          discountValue: discountVal,
          discountType,
          minOrderAmount,
          startDate,
          endDate,
          usedCount,
          status,
          isActive,
          validUntil,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        usedCount: coupon.usedCount,
        status: coupon.status,
        isActive: coupon.isActive,
      },
      message: "კუპონი შეიქმნა / განახლდა MySQL ბაზაში",
    });
  } catch (error: any) {
    console.error("POST /api/coupons error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "კუპონის შენახვა ვერ მოხერხდა" },
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
