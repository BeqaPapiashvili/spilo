import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ITEM_STATUS, MERCHANT_ORDER_STATUSES, requireMerchantSession } from "@/lib/merchant";
import { FULFILLMENT_BY_ORDER, merchantLineTotal, merchantUnitCost } from "@/lib/merchantLabels";
import { recordAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { storeId, errorResponse } = await requireMerchantSession(request);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
        items: { some: { storeId } },
      },
      include: {
        items: { include: { product: { select: { costPrice: true } } } },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "შეკვეთა ვერ მოიძებნა" }, { status: 404 });
    }

    const ownItems = order.items.filter((item) => item.storeId === storeId);
    const ownsAll = order.items.every((item) => item.storeId === storeId);

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        contactPhone: order.contactPhone,
        shippingAddress: order.shippingAddress,
        deliveryMethod: order.deliveryMethod,
        deliveryDate: order.deliveryDate,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        personType: order.personType,
        idNumber: order.idNumber,
        status: order.status,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        ownsAll,
        otherStoreItemCount: order.items.length - ownItems.length,
        items: ownItems.map((item) => {
          const unit = merchantUnitCost(item.costPrice ?? item.product?.costPrice);
          return {
            id: item.id,
            title: item.title,
            sku: item.sku,
            quantity: item.quantity,
            price: unit,
            lineTotal: merchantLineTotal(item.costPrice ?? item.product?.costPrice, item.quantity),
            image: item.image,
            selectedVariants: item.selectedVariants,
            fulfillmentStatus: item.fulfillmentStatus,
          };
        }),
        total: Number(
          ownItems
            .reduce((sum, item) => sum + merchantLineTotal(item.costPrice ?? item.product?.costPrice, item.quantity), 0)
            .toFixed(2)
        ),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "შეკვეთა ვერ ჩაიტვირთა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, storeId, errorResponse } = await requireMerchantSession(request);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const body = await request.json();
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
        items: { some: { storeId } },
      },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "შეკვეთა ვერ მოიძებნა" }, { status: 404 });
    }

    if (order.status === "CANCELLED") {
      return NextResponse.json({ success: false, error: "გაუქმებული შეკვეთის შეცვლა შეუძლებელია" }, { status: 400 });
    }

    const nextStatus = String(body.status || body.fulfillmentStatus || "").toUpperCase();
    const mappedOrder = (MERCHANT_ORDER_STATUSES as readonly string[]).includes(nextStatus)
      ? nextStatus
      : "";
    const mappedItem = mappedOrder
      ? FULFILLMENT_BY_ORDER[mappedOrder]
      : Object.values(ITEM_STATUS).includes(nextStatus as (typeof ITEM_STATUS)[keyof typeof ITEM_STATUS])
        ? nextStatus
        : "";

    if (!mappedOrder && !mappedItem) {
      return NextResponse.json({ success: false, error: "ეს სტატუსი დაუშვებელია" }, { status: 400 });
    }

    const ownsAll = order.items.every((item) => item.storeId === storeId);
    if (mappedOrder && ownsAll) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: mappedOrder as OrderStatus },
      });
    }

    if (mappedItem) {
      await prisma.orderItem.updateMany({
        where: { storeId, orderId: order.id },
        data: { fulfillmentStatus: mappedItem },
      });
    }

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "MERCHANT_ORDER_UPDATE",
      entity: "Order",
      target: order.orderNumber,
      details: "პარტნიორმა განაახლა შეკვეთა",
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "განახლება ვერ მოხერხდა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
