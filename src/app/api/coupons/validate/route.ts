import { NextResponse } from "next/server";
import { enforceRateLimit, getClientIp } from "@/lib/rateLimit";
import { resolveCouponDiscount } from "@/lib/couponApply";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    const rateLimitRes = await enforceRateLimit(request, {
      namespace: "coupon_validate_ip",
      identifier: clientIp,
      limit: 15,
      windowSeconds: 15 * 60,
      customMessage: "პრომო კოდის გადამოწმების მცდელობების ლიმიტი გადაჭარბებულია. გთხოვთ სცადოთ 15 წუთის შემდეგ.",
    });
    if (!rateLimitRes.success && rateLimitRes.response) return rateLimitRes.response;

    const body = await request.json();
    const { code, orderTotal = 0, productIds = [], items = [] } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { success: false, valid: false, error: "გთხოვთ მიუთითოთ პრომო კოდი" },
        { status: 400 }
      );
    }

    const rawItems = Array.isArray(items) && items.length > 0
      ? items
      : (Array.isArray(productIds) ? productIds.map((id: unknown) => ({ id, quantity: 1 })) : []);
    const ids = rawItems.map((item: { id?: string }) => String(item.id || "")).filter(Boolean);
    const products = ids.length
      ? await prisma.product.findMany({
          where: { id: { in: ids } },
          select: { id: true, storeId: true, price: true, discountPrice: true },
        })
      : [];
    const qtyById = Object.fromEntries(
      rawItems.map((item: { id?: string; quantity?: number }) => [String(item.id || ""), Math.max(1, Number(item.quantity) || 1)])
    );
    const lines = products.map((product) => ({
      storeId: product.storeId,
      price: product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price,
      quantity: qtyById[product.id] || 1,
    }));

    const result = await resolveCouponDiscount(code, Number(orderTotal) || 0, prisma, lines);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, valid: false, error: result.error },
        { status: result.error.includes("არ არსებობს") ? 404 : 400 }
      );
    }

    if (!result.coupon.code) {
      return NextResponse.json(
        { success: false, valid: false, error: "გთხოვთ მიუთითოთ პრომო კოდი" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      coupon: {
        id: result.coupon.id,
        code: result.coupon.code,
        discountType: result.coupon.discountType,
        discountValue: result.coupon.discountValue,
        discountAmount: result.coupon.discountAmount,
        finalTotal: result.coupon.finalTotal,
      },
      message: `პრომო კოდი "${result.coupon.code}" წარმატებით გააქტიურდა`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "პრომო კოდის გადამოწმება ვერ მოხერხდა";
    console.error("POST /api/coupons/validate error:", error);
    return NextResponse.json({ success: false, valid: false, error: message }, { status: 500 });
  }
}
