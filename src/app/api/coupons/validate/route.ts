import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/coupons/validate
 * Validates coupon code against MySQL Prisma database:
 * - Checks existence and uppercase match
 * - Checks isActive and status === 'ACTIVE'
 * - Checks validUntil / endDate expiration timestamps
 * - Checks minOrderAmount threshold
 * - Checks usedCount against usage limits
 * - Computes authoritative server-side discount amount & final total
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, orderTotal = 0 } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { success: false, valid: false, error: "გთხოვთ მიუთითოთ პრომო კოდი" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const currentTotal = Number(orderTotal) || 0;

    // 1. Fetch coupon from MySQL database
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: cleanCode,
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, valid: false, error: `პრომო კოდი "${cleanCode}" არ არსებობს` },
        { status: 404 }
      );
    }

    // 2. Validate active status
    if (!coupon.isActive || coupon.status === "DISABLED" || coupon.status === "EXPIRED") {
      return NextResponse.json(
        { success: false, valid: false, error: `პრომო კოდი "${cleanCode}" არააქტიურია ან გაუქმებულია` },
        { status: 400 }
      );
    }

    // 3. Validate expiration timestamp
    const now = new Date();
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return NextResponse.json(
        { success: false, valid: false, error: `პრომო კოდს "${cleanCode}" მოქმედების ვადა ამოეწურა` },
        { status: 400 }
      );
    }

    if (coupon.endDate) {
      const endTimestamp = new Date(coupon.endDate);
      if (!isNaN(endTimestamp.getTime()) && endTimestamp < now) {
        return NextResponse.json(
          { success: false, valid: false, error: `პრომო კოდს "${cleanCode}" მოქმედების ვადა ამოეწურა` },
          { status: 400 }
        );
      }
    }

    // 4. Validate usage limit
    if (
      coupon.usageLimit !== null &&
      coupon.usageLimit !== undefined &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: "ამ პრომო კოდის გამოყენების ლიმიტი ამოწურულია",
        },
        { status: 400 }
      );
    }

    // 5. Validate minimum order amount
    const minAmount = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
    if (minAmount > 0 && currentTotal < minAmount) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: `პრომო კოდის გასააქტიურებლად მინიმალური შეკვეთის თანხაა ${minAmount.toFixed(2)} ₾ (თქვენი ჯამია ${currentTotal.toFixed(2)} ₾)`,
        },
        { status: 400 }
      );
    }

    // 5. Calculate authoritative server-side discount
    const discountVal =
      coupon.discountValue !== null && coupon.discountValue !== undefined
        ? Number(coupon.discountValue)
        : coupon.discount !== null && coupon.discount !== undefined
        ? Number(coupon.discount)
        : 0;

    const discountType = (coupon.discountType || "percentage").toLowerCase();
    let discountAmount = 0;

    if (discountType === "percentage" || discountType === "percent") {
      discountAmount = (currentTotal * discountVal) / 100;
    } else {
      // Fixed discount
      discountAmount = discountVal;
    }

    // Ensure discount never exceeds total order amount
    discountAmount = Math.min(currentTotal, Math.max(0, discountAmount));
    const finalTotal = Math.max(0, currentTotal - discountAmount);

    return NextResponse.json({
      success: true,
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType,
        discountValue: discountVal,
        discountAmount: Number(discountAmount.toFixed(2)),
        finalTotal: Number(finalTotal.toFixed(2)),
        minOrderAmount: minAmount,
      },
      message: `პრომო კოდი "${coupon.code}" წარმატებით გააქტიურდა (-${
        discountType === "percentage" || discountType === "percent"
          ? `${discountVal}%`
          : `${discountVal} ₾`
      })`,
    });
  } catch (error: any) {
    console.error("POST /api/coupons/validate error:", error);
    return NextResponse.json(
      { success: false, valid: false, error: error.message || "პრომო კოდის გადამოწმება ვერ მოხერხდა" },
      { status: 500 }
    );
  }
}
