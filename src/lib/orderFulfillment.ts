import { prisma } from "@/lib/prisma";
import { incrementCouponUsage } from "@/lib/couponApply";

type StockItem = { productId: string; quantity: number };

export async function restoreStock(tx: any, items: StockItem[]): Promise<void> {
  for (const item of items) {
    if (!item.productId || !item.quantity) continue;
    await tx.product
      .update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
      .catch(() => null);
  }
}

export async function clearUserCart(tx: any, userId: string): Promise<void> {
  const cart = await tx.cart.findUnique({ where: { userId } });
  if (cart) {
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
}

export async function settlePaidOrder(
  tx: any,
  order: { userId: string | null; couponCode: string | null }
): Promise<void> {
  if (order.couponCode) {
    const coupon = await tx.coupon.findFirst({ where: { code: order.couponCode } });
    if (coupon?.id) {
      await incrementCouponUsage(tx, coupon.id);
    }
  }
  if (order.userId) {
    await clearUserCart(tx, order.userId);
  }
}

export async function releaseUnpaidOrder(orderId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order || order.paymentStatus === "PAID" || order.status === "CANCELLED") {
      return;
    }
    await restoreStock(tx, order.items);
    await tx.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED", paymentStatus: "FAILED" },
    });
    await tx.payment.updateMany({
      where: { orderId: order.id, status: "PENDING" },
      data: { status: "FAILED" },
    });
  });
}
