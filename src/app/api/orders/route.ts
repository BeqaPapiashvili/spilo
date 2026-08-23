import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/jwt";
import { ADMIN_ROLES } from "@/lib/permissions";
import { OrderStatus } from "@prisma/client";
import { recordAuditLog } from "@/lib/audit";
import { sendOrderConfirmationEmail } from "@/lib/email";

/**
 * GET /api/orders
 * Admin: View all orders or filter by query parameters
 * Customer: View only own orders bound to session
 */
export async function GET(request: Request) {
  try {
    const session = await getAuthSession(request);
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const status = searchParams.get("status");

    const isAdmin = session?.role && ADMIN_ROLES.includes(session.role);

    if (!session && !phone) {
      return NextResponse.json(
        { success: false, error: "ავტორიზაცია აუცილებელია (Unauthorized)" },
        { status: 401 }
      );
    }

    let where: any = {};

    if (isAdmin) {
      if (phone) where.contactPhone = phone;
      if (status) where.status = status;
    } else if (session?.userId) {
      where.userId = session.userId;
    } else if (phone) {
      where.contactPhone = phone;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: any) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "შეკვეთების წამოღება ვერ მოხერხდა" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Atomic order creation, product validation, stock availability checks, and stock decrements inside prisma.$transaction
 */
export async function POST(request: Request) {
  try {
    const session = await getAuthSession(request);
    const body = await request.json();
    const { items, customer, paymentMethod, totalAmount, address, couponCode } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "კალათა ცარიელია — შეკვეთის გაფორმება შეუძლებელია" },
        { status: 400 }
      );
    }

    if (!customer || !totalAmount) {
      return NextResponse.json(
        { success: false, error: "საკონტაქტო მონაცემები ან ჯამური თანხა არასწორია" },
        { status: 400 }
      );
    }

    const phone = (customer.phone || customer.contactPhone || "").trim();
    const name = (customer.name || customer.customerName || "მომხმარებელი").trim();
    const shippingAddress = (address || customer.address || "თბილისი, საქართველო").trim();

    // 1. Resolve User ID (prefer active session, fallback to guest phone upsert)
    let userId: string | null = session?.userId || null;
    if (!userId && phone) {
      const user = await prisma.user.upsert({
        where: { phone },
        update: { name: name || undefined },
        create: {
          phone,
          name,
          role: "CUSTOMER",
        },
      });
      userId = user.id;
    }

    // Generate unique order number (e.g. SP-849201)
    const orderNumber = `SP-${Date.now().toString().slice(-6)}`;

    // 2. Execute entire order placement and stock decrement inside an atomic Prisma Transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      // Step A: Fetch and validate all products from MySQL database
      const productIds = items.map((i: any) => i.id || i.productId).filter(Boolean);
      
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      // Verify every order item exists in the database
      for (const item of items) {
        const pId = item.id || item.productId;
        const dbProduct = productMap.get(pId);

        if (!dbProduct) {
          throw new Error(`პროდუქტი "${item.title || pId}" ვერ მოიძებნა ბაზაში. გთხოვთ წაშალოთ კალათიდან და სცადოთ ხელახლა.`);
        }

        // Validate stock availability
        const requestedQuantity = Number(item.quantity) || 1;
        if (dbProduct.stock < requestedQuantity) {
          throw new Error(
            `პროდუქტი "${dbProduct.title}" არ არის საკმარისი რაოდენობით საწყობში (დარჩენილია ${dbProduct.stock} ცალი, მოთხოვნილია ${requestedQuantity}).`
          );
        }
      }

      // Step B: Atomically decrement stock for each product
      for (const item of items) {
        const pId = item.id || item.productId;
        const requestedQuantity = Number(item.quantity) || 1;
        await tx.product.update({
          where: { id: pId },
          data: {
            stock: {
              decrement: requestedQuantity,
            },
          },
        });
      }

      // Step C: Validate and increment coupon usage if applied
      if (couponCode && typeof couponCode === "string" && couponCode.trim()) {
        const cleanCoupon = couponCode.trim().toUpperCase();
        const couponRecord = await tx.coupon.findFirst({
          where: {
            code: cleanCoupon,
            isActive: true,
          },
        });

        if (couponRecord) {
          await tx.coupon.update({
            where: { id: couponRecord.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }

      // Step D: Create Order and OrderItems atomically
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          customerName: name,
          contactPhone: phone,
          shippingAddress,
          paymentMethod: paymentMethod || "ბარათით გადახდა",
          paymentStatus: "PAID",
          status: "PENDING",
          totalAmount: Number(totalAmount),
          items: {
            create: items.map((item: any) => {
              const pId = item.id || item.productId;
              const dbProduct = productMap.get(pId)!;
              return {
                productId: dbProduct.id,
                title: dbProduct.title || item.title,
                quantity: Number(item.quantity) || 1,
                price: Number(item.discountPrice || item.price || dbProduct.discountPrice || dbProduct.price),
                image: dbProduct.images && Array.isArray(dbProduct.images) && dbProduct.images.length > 0
                  ? (dbProduct.images[0] as string)
                  : item.image || null,
              };
            }),
          },
        },
        include: {
          items: true,
        },
      });

      // Step E: Clear cart for the user if exists
      if (userId) {
        const userCart = await tx.cart.findUnique({ where: { userId } });
        if (userCart) {
          await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
        }
      }

      return createdOrder;
    });

    // Dispatch transactional order confirmation email asynchronously
    const targetEmail = (customer.email || session?.email || "").trim();
    if (targetEmail && targetEmail.includes("@")) {
      sendOrderConfirmationEmail({
        to: targetEmail,
        name,
        orderNumber: newOrder.orderNumber,
        totalAmount: newOrder.totalAmount,
        paymentMethod: newOrder.paymentMethod,
        items: newOrder.items.map((i: any) => ({
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
        items: newOrder.items,
        customer: { name, phone },
        paymentMethod: newOrder.paymentMethod,
        totalAmount: newOrder.totalAmount,
        address: newOrder.shippingAddress,
      },
      message: "შეკვეთა წარმატებით დარეგისტრირდა და მარაგები განახლდა",
    });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "შეკვეთის გაფორმება ვერ მოხერხდა" },
      { status: 400 }
    );
  }
}

/**
 * PUT /api/orders
 * Status update by Admin with stock restoration on cancellation
 */
export async function PUT(request: Request) {
  try {
    const session = await getAuthSession(request);
    const isAdmin = session?.role && ADMIN_ROLES.includes(session.role);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "წვდომა შეზღუდულია: მხოლოდ ადმინისტრატორს შეუძლია შეკვეთის სტატუსის შეცვლა (Forbidden)" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    const statusMap: Record<string, OrderStatus> = {
      "მუშავდება": "PROCESSING",
      "PROCESSING": "PROCESSING",
      "გზაშია": "SHIPPED",
      "SHIPPED": "SHIPPED",
      "ჩაბარებულია": "DELIVERED",
      "DELIVERED": "DELIVERED",
      "გაუქმებულია": "CANCELLED",
      "CANCELLED": "CANCELLED",
      "PENDING": "PENDING",
    };

    const targetStatus = statusMap[status] || "PROCESSING";

    let existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    }).catch(() => null);

    if (!existingOrder) {
      existingOrder = await prisma.order.findFirst({
        where: { orderNumber: id },
        include: { items: true },
      });
    }

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "შეკვეთა ვერ მოიძებნა ბაზაში" },
        { status: 404 }
      );
    }

    const previousStatus = existingOrder.status;

    // Transactionally update status and restore stock if cancelling
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // If moving to CANCELLED from non-cancelled status, restore stock
      if (targetStatus === "CANCELLED" && previousStatus !== "CANCELLED") {
        for (const item of existingOrder!.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          }).catch(() => {});
        }
      }

      // If re-activating a CANCELLED order, re-decrement stock
      if (previousStatus === "CANCELLED" && targetStatus !== "CANCELLED") {
        for (const item of existingOrder!.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          }).catch(() => {});
        }
      }

      return await tx.order.update({
        where: { id: existingOrder!.id },
        data: { status: targetStatus },
        include: { items: true },
      });
    });

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "ORDER_STATUS_UPDATE",
      entity: "Order",
      target: `#${updatedOrder.orderNumber}`,
      details: `შეკვეთის სტატუსი შეიცვალა: ${previousStatus} → ${targetStatus}`,
    });

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "შეკვეთის სტატუსი წარმატებით განახლდა",
    });
  } catch (error: any) {
    console.error("PUT /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders
 * Safe order deletion by admin with order item cleanup
 */
export async function DELETE(request: Request) {
  try {
    const session = await getAuthSession(request);
    const isAdmin = session?.role && ADMIN_ROLES.includes(session.role);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "წვდომა შეზღუდულია: მხოლოდ ადმინისტრატორს შეუძლია შეკვეთის წაშლა" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "შეკვეთის ID აუცილებელია" },
        { status: 400 }
      );
    }

    let existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    }).catch(() => null);

    if (!existingOrder) {
      existingOrder = await prisma.order.findFirst({
        where: { orderNumber: id },
        include: { items: true },
      });
    }

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "შეკვეთა ვერ მოიძებნა" },
        { status: 404 }
      );
    }

    const targetId = existingOrder.id;
    const orderNum = existingOrder.orderNumber;

    await prisma.$transaction(async (tx) => {
      // Delete order items
      await tx.orderItem.deleteMany({
        where: { orderId: targetId },
      });

      // Delete order
      await tx.order.delete({
        where: { id: targetId },
      });
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
  } catch (error: any) {
    console.error("DELETE /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete order" },
      { status: 500 }
    );
  }
}
