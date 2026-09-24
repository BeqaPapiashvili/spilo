import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireAdminSession } from "@/lib/jwt";
import { ADMIN_ROLES } from "@/lib/permissions";
import { recordAuditLog } from "@/lib/audit";
import { OrderStatus, Prisma } from "@prisma/client";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { incrementCouponUsage, resolveCouponDiscount } from "@/lib/couponApply";
import { canMutateOrders } from "@/lib/permissions";
import { computeShippingFee, getDeliverySettings } from "@/lib/delivery";
import { isPublicProduct } from "@/lib/productVisibility";
import { restoreStock } from "@/lib/orderFulfillment";

function unitPrice(product: { price: number; discountPrice: number | null }): number {
  if (product.discountPrice !== null && product.discountPrice !== undefined && product.discountPrice > 0) {
    return Number(product.discountPrice);
  }
  return Number(product.price);
}

function makeOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `SP-${stamp}-${rand}`;
}

/**
 * GET /api/orders
 * Admin: all orders. Customer: own orders only. Phone lookup is admin-only.
 */
export async function GET(request: Request) {
  try {
    const session = await getAuthSession(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const phone = searchParams.get("phone");
    const status = searchParams.get("status");

    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: "ავტორიზაცია აუცილებელია" },
        { status: 401 }
      );
    }

    const isAdmin = Boolean(session.role && ADMIN_ROLES.includes(session.role));
    const where: Record<string, unknown> = {};

    if (id) {
      where.OR = [{ id }, { orderNumber: id }];
    }

    if (isAdmin) {
      if (phone) where.contactPhone = phone;
      if (status) where.status = status;
    } else {
      where.userId = session.userId;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                sku: true,
                price: true,
                discountPrice: true,
                ...(isAdmin ? { costPrice: true } : {}),
                category: { select: { name: true } },
                brand: { select: { name: true } },
              },
            },
          },
        },
        payments: { orderBy: { createdAt: "desc" as const } },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        returns: {
          include: {
            logs: {
              orderBy: { createdAt: "desc" as const },
            },
          },
          orderBy: { createdAt: "desc" as const },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "შეკვეთების წამოღება ვერ მოხერხდა";
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession(request);
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: "შეკვეთის გასაფორმებლად გაიარეთ ავტორიზაცია" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, customer, paymentMethod, address, couponCode, deferSettlement } = body;
    const shouldDeferSettlement = Boolean(deferSettlement);
    const deliveryMethod = String(body.deliveryMethod || "delivery");
    const isPickup = deliveryMethod === "pickup";
    const city = String(body.city || "").trim();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "კალათა ცარიელია — შეკვეთის გაფორმება შეუძლებელია" },
        { status: 400 }
      );
    }

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "საკონტაქტო მონაცემები არასწორია" },
        { status: 400 }
      );
    }

    const phone = String(customer.phone || customer.contactPhone || "").trim();
    const name = String(customer.name || customer.customerName || session.name || "მომხმარებელი").trim();
    const shippingAddress = isPickup
      ? String(address || customer.address || "").trim() || "თვითგატანა მაღაზიიდან"
      : String(address || customer.address || "").trim();

    if (!phone || phone.length < 9) {
      return NextResponse.json(
        { success: false, error: "გთხოვთ მიუთითოთ სწორი ტელეფონის ნომერი" },
        { status: 400 }
      );
    }
    if (!isPickup && !shippingAddress) {
      return NextResponse.json(
        { success: false, error: "გთხოვთ მიუთითოთ მიწოდების მისამართი" },
        { status: 400 }
      );
    }

    const userId = session.userId;
    const orderNumber = makeOrderNumber();

    const deliverySettings = await getDeliverySettings();

    const newOrder = await prisma.$transaction(async (tx) => {
      if (shouldDeferSettlement) {
        const existingPending = await tx.order.findFirst({
          where: {
            userId,
            paymentStatus: "PENDING",
            status: { not: "CANCELLED" },
            createdAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
            OR: [
              { paymentMethod: { contains: "ბარათ" } },
              { paymentMethod: { contains: "United" } },
              { paymentMethod: { contains: "განვადება" } },
            ],
          },
          select: { orderNumber: true },
        });
        if (existingPending) {
          throw new Error(
            `თქვენ უკვე გაქვთ გადაუხდელი შეკვეთა ${existingPending.orderNumber}. ჯერ დაასრულეთ წინა გადახდა.`
          );
        }
      }

      const productIds = items
        .map((item: { id?: string; productId?: string }) => item.id || item.productId)
        .filter(Boolean) as string[];

      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
        include: { store: { select: { id: true, name: true } } },
      });
      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      let subtotal = 0;
      const lineItems: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = [];

      for (const item of items) {
        const pId = item.id || item.productId;
        const dbProduct = productMap.get(pId);
        if (!dbProduct) {
          throw new Error(`პროდუქტი "${item.title || pId}" ვერ მოიძებნა ბაზაში.`);
        }
        if (!isPublicProduct(dbProduct)) {
          throw new Error(`პროდუქტი "${dbProduct.title}" ჯერ არ არის დამტკიცებული.`);
        }

        const requestedQuantity = Math.max(1, Number(item.quantity) || 1);
        const decremented = await tx.product.updateMany({
          where: { id: pId, stock: { gte: requestedQuantity } },
          data: { stock: { decrement: requestedQuantity } },
        });
        if (decremented.count !== 1) {
          throw new Error(
            `პროდუქტი "${dbProduct.title}" არ არის საკმარისი რაოდენობით საწყობში (მოთხოვნილია ${requestedQuantity}).`
          );
        }

        const price = unitPrice(dbProduct);
        subtotal += price * requestedQuantity;

        const images = Array.isArray(dbProduct.images) ? (dbProduct.images as string[]) : [];
        lineItems.push({
          productId: dbProduct.id,
          title: dbProduct.title,
          sku: dbProduct.sku || null,
          quantity: requestedQuantity,
          price,
          originalPrice: Number(dbProduct.price),
          discountPrice: dbProduct.discountPrice ? Number(dbProduct.discountPrice) : null,
          costPrice: dbProduct.costPrice || null,
          selectedVariants: (item.selectedVariants as Prisma.InputJsonValue) || Prisma.JsonNull,
          image: images[0] || item.image || null,
          storeId: dbProduct.storeId || null,
          storeName: dbProduct.store?.name || null,
        });
      }

      const couponResult = await resolveCouponDiscount(
        couponCode,
        subtotal,
        tx,
        lineItems.map((line) => ({
          storeId: line.storeId,
          price: line.price,
          quantity: line.quantity,
        }))
      );
      if (!couponResult.ok) {
        throw new Error(couponResult.error);
      }

      if (!shouldDeferSettlement && couponResult.coupon.id) {
        await incrementCouponUsage(tx, couponResult.coupon.id);
      }

      const shippingFee = computeShippingFee({
        deliveryMethod,
        city,
        subtotal,
        settings: deliverySettings,
      });

      const customerEmail =
        String(customer.email || customer.customerEmail || session.email || "").trim() || null;

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          customerName: name,
          customerEmail,
          contactPhone: phone,
          shippingAddress,
          paymentMethod: paymentMethod || "კურიერთან ანგარიშსწორება",
          paymentStatus: "PENDING",
          status: "PENDING",
          deliveryDate: null,
          deliveryMethod,
          personType: customer.personType || "physical",
          idNumber: customer.idNumber || null,
          notes: body.notes || body.comment || null,
          couponCode: couponResult.coupon.code || null,
          discountAmount: couponResult.coupon.discountAmount,
          totalAmount: Number((couponResult.coupon.finalTotal + shippingFee).toFixed(2)),
          items: { create: lineItems },
        },
        include: { items: true },
      });

      const userCart = await tx.cart.findUnique({ where: { userId } });
      if (userCart && !shouldDeferSettlement) {
        await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }

      return createdOrder;
    });

    const targetEmail = (customer.email || session.email || "").trim();
    if (!shouldDeferSettlement && targetEmail.includes("@")) {
      sendOrderConfirmationEmail({
        to: targetEmail,
        name,
        orderNumber: newOrder.orderNumber,
        totalAmount: newOrder.totalAmount,
        paymentMethod: newOrder.paymentMethod,
        items: newOrder.items.map((i) => ({
          title: i.title,
          quantity: i.quantity,
          price: i.price,
        })),
        shippingAddress: newOrder.shippingAddress,
      }).catch((err) => console.warn("[Order Email Background Error]:", err));
    }

    return NextResponse.json({
      success: true,
      order: {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        createdAt: newOrder.createdAt.toISOString(),
        status: "მუშავდება",
        items: newOrder.items.map((item) => {
          const { costPrice, ...safeItem } = item;
          void costPrice;
          return safeItem;
        }),
        customer: { name, phone },
        paymentMethod: newOrder.paymentMethod,
        paymentStatus: newOrder.paymentStatus,
        totalAmount: newOrder.totalAmount,
        address: newOrder.shippingAddress,
      },
      message: shouldDeferSettlement
        ? "შეკვეთა შეიქმნა. გადახდაზე გადამისამართება..."
        : "შეკვეთა წარმატებით დარეგისტრირდა. გადახდა დადასტურდება მოგვიანებით.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "შეკვეთის გაფორმება ვერ მოხერხდა";
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;
    if (!canMutateOrders(session?.role || "")) {
      return NextResponse.json({ success: false, error: "Order update is not allowed for this role" }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, deliveryDate } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "შეკვეთის ID აუცილებელია" }, { status: 400 });
    }

    let existingOrder = await prisma.order
      .findUnique({ where: { id }, include: { items: true } })
      .catch(() => null);

    if (!existingOrder) {
      existingOrder = await prisma.order.findFirst({
        where: { orderNumber: id },
        include: { items: true },
      });
    }

    if (!existingOrder) {
      return NextResponse.json({ success: false, error: "შეკვეთა ვერ მოიძებნა ბაზაში" }, { status: 404 });
    }

    const previousStatus = existingOrder.status;
    let targetStatus = previousStatus;

    if (status) {
      const statusMap: Record<string, OrderStatus> = {
        მუშავდება: "PROCESSING",
        PROCESSING: "PROCESSING",
        გზაშია: "SHIPPED",
        SHIPPED: "SHIPPED",
        ჩაბარებულია: "DELIVERED",
        DELIVERED: "DELIVERED",
        გაუქმებულია: "CANCELLED",
        CANCELLED: "CANCELLED",
        PENDING: "PENDING",
      };
      targetStatus = statusMap[status] || previousStatus;
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (targetStatus === "CANCELLED" && previousStatus !== "CANCELLED") {
        for (const item of existingOrder.items) {
          await tx.product
            .update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            })
            .catch(() => {});
        }
      }

      if (previousStatus === "CANCELLED" && targetStatus !== "CANCELLED") {
        for (const item of existingOrder.items) {
          const decremented = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (decremented.count !== 1) {
            throw new Error(`მარაგი არ არის საკმარისი პროდუქტისთვის ${item.title}`);
          }
        }
      }

      const updateData: { status: OrderStatus; deliveryDate?: Date | null } = { status: targetStatus };
      if (deliveryDate !== undefined) {
        updateData.deliveryDate = deliveryDate ? new Date(deliveryDate) : null;
      }

      return await tx.order.update({
        where: { id: existingOrder.id },
        data: updateData,
        include: { items: true },
      });
    });

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "ORDER_UPDATE",
      entity: "Order",
      target: `#${updatedOrder.orderNumber}`,
      details: `შეკვეთის მონაცემები განახლდა (სტატუსი: ${targetStatus})`,
    });

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "შეკვეთა წარმატებით განახლდა",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "შეკვეთის განახლება ვერ მოხერხდა";
    console.error("PUT /api/orders error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;
    if (!canMutateOrders(session?.role || "")) {
      return NextResponse.json({ success: false, error: "შეკვეთის წაშლა ამ როლს არ შეუძლია" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "შეკვეთის ID აუცილებელია" }, { status: 400 });
    }

    let existingOrder = await prisma.order
      .findUnique({ where: { id }, include: { items: true } })
      .catch(() => null);

    if (!existingOrder) {
      existingOrder = await prisma.order.findFirst({
        where: { orderNumber: id },
        include: { items: true },
      });
    }

    if (!existingOrder) {
      return NextResponse.json({ success: false, error: "შეკვეთა ვერ მოიძებნა" }, { status: 404 });
    }

    const targetId = existingOrder.id;
    const orderNum = existingOrder.orderNumber;

    await prisma.$transaction(async (tx) => {
      if (existingOrder.status !== "CANCELLED") {
        await restoreStock(tx, existingOrder.items);
      }
      await tx.orderItem.deleteMany({ where: { orderId: targetId } });
      await tx.order.delete({ where: { id: targetId } });
    });

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "ORDER_DELETE",
      entity: "Order",
      target: `#${orderNum}`,
      details: `შეკვეთა #${orderNum} წაიშალა მონაცემთა ბაზიდან`,
    });

    return NextResponse.json({
      success: true,
      message: `შეკვეთა #${orderNum} წარმატებით წაიშალა`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "შეკვეთის წაშლა ვერ მოხერხდა";
    console.error("DELETE /api/orders error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
