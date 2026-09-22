import { prisma } from "@/lib/prisma";

type CouponClient = {
  coupon: {
    findFirst: (args: {
      where: { code: string };
    }) => Promise<{
      id: string;
      code: string;
      isActive: boolean;
      status: string;
      validUntil: Date | null;
      endDate: string | null;
      usageLimit: number | null;
      usedCount: number;
      minOrderAmount: number | null;
      discountValue: number | null;
      discount: number | null;
      discountType: string | null;
      storeId?: string | null;
    } | null>;
    update: (args: {
      where: { id: string };
      data: { usedCount: { increment: number } };
    }) => Promise<unknown>;
  };
};

export type AppliedCoupon = {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  finalTotal: number;
};

export function computeDiscountAmount(
  subtotal: number,
  discountType: string,
  discountValue: number
): number {
  const type = (discountType || "percentage").toLowerCase();
  let amount =
    type === "percentage" || type === "percent"
      ? (subtotal * discountValue) / 100
      : discountValue;
  amount = Math.min(subtotal, Math.max(0, amount));
  return Number(amount.toFixed(2));
}

type CouponLine = {
  storeId?: string | null;
  price: number;
  quantity: number;
};

export async function resolveCouponDiscount(
  code: string | null | undefined,
  subtotal: number,
  client: CouponClient = prisma,
  lines: CouponLine[] = []
): Promise<{ ok: true; coupon: AppliedCoupon } | { ok: false; error: string }> {
  if (!code || typeof code !== "string" || !code.trim()) {
    return {
      ok: true,
      coupon: {
        id: "",
        code: "",
        discountType: "percentage",
        discountValue: 0,
        discountAmount: 0,
        finalTotal: Number(subtotal.toFixed(2)),
      },
    };
  }

  const cleanCode = code.trim().toUpperCase();
  const coupon = await client.coupon.findFirst({ where: { code: cleanCode } });

  if (!coupon) {
    return { ok: false, error: `პრომო კოდი "${cleanCode}" არ არსებობს` };
  }

  if (!coupon.isActive || coupon.status === "DISABLED" || coupon.status === "EXPIRED") {
    return { ok: false, error: `პრომო კოდი "${cleanCode}" არააქტიურია ან გაუქმებულია` };
  }

  const now = new Date();
  if (coupon.validUntil && new Date(coupon.validUntil) < now) {
    return { ok: false, error: `პრომო კოდს "${cleanCode}" მოქმედების ვადა ამოეწურა` };
  }

  if (coupon.endDate) {
    const endTimestamp = new Date(coupon.endDate);
    if (!Number.isNaN(endTimestamp.getTime()) && endTimestamp < now) {
      return { ok: false, error: `პრომო კოდს "${cleanCode}" მოქმედების ვადა ამოეწურა` };
    }
  }

  if (
    coupon.usageLimit !== null &&
    coupon.usageLimit !== undefined &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    return { ok: false, error: "ამ პრომო კოდის გამოყენების ლიმიტი ამოწურულია" };
  }

  let eligibleTotal = subtotal;
  if (coupon.storeId) {
    eligibleTotal = lines.reduce((sum, line) => {
      if (line.storeId !== coupon.storeId) return sum;
      return sum + Number(line.price) * Math.max(1, Number(line.quantity) || 1);
    }, 0);
    if (eligibleTotal <= 0) {
      return {
        ok: false,
        error: `ეს პრომო კოდი მხოლოდ კონკრეტული მაღაზიის პროდუქტებზე მოქმედებს`,
      };
    }
  }

  const minAmount = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
  if (minAmount > 0 && eligibleTotal < minAmount) {
    return {
      ok: false,
      error: `პრომო კოდის გასააქტიურებლად მინიმალური შეკვეთის თანხაა ${minAmount.toFixed(2)} ₾`,
    };
  }

  const discountValue =
    coupon.discountValue !== null && coupon.discountValue !== undefined
      ? Number(coupon.discountValue)
      : Number(coupon.discount || 0);
  const discountType = coupon.discountType || "percentage";
  const discountAmount = computeDiscountAmount(eligibleTotal, discountType, discountValue);

  return {
    ok: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountType,
      discountValue,
      discountAmount,
      finalTotal: Number(Math.max(0, subtotal - discountAmount).toFixed(2)),
    },
  };
}

export async function incrementCouponUsage(client: CouponClient, couponId: string): Promise<void> {
  if (!couponId) return;
  await client.coupon.update({
    where: { id: couponId },
    data: { usedCount: { increment: 1 } },
  });
}
