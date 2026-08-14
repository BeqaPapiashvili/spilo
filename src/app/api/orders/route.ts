import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    const where: any = {};
    if (phone) {
      where.contactPhone = phone;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
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
      { success: false, error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customer, paymentMethod, totalAmount, address } = body;

    if (!items || !items.length || !customer || !totalAmount) {
      return NextResponse.json(
        { success: false, error: "Missing required order parameters" },
        { status: 400 }
      );
    }

    const orderNumber = `SP-${Date.now().toString().slice(-6)}`;
    const phone = customer.phone || customer.contactPhone || "";
    const name = customer.name || customer.customerName || "მომხმარებელი";

    // 1. Find or create User in MySQL by phone
    let userId: string | undefined = undefined;
    if (phone) {
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

    // 2. Create Order & Items in MySQL
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        customerName: name,
        contactPhone: phone,
        shippingAddress: address || customer.address || "თბილისი, საქართველო",
        paymentMethod: paymentMethod || "ბარათით გადახდა",
        paymentStatus: "PAID",
        status: "PENDING",
        totalAmount: Number(totalAmount),
        items: {
          create: items.map((item: any) => ({
            productId: item.id || item.productId,
            title: item.title,
            quantity: item.quantity,
            price: Number(item.discountPrice || item.price),
            image: item.image || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // 3. Automatically decrement product stock in MySQL database
    for (const item of items) {
      const productId = item.id || item.productId;
      if (productId) {
        try {
          await prisma.product.update({
            where: { id: productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        } catch (stockError) {
          console.warn(`Could not decrement stock for product ${productId}:`, stockError);
        }
      }
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
      message: "შეკვეთა წარმატებით დარეგისტრირდა MySQL ბაზაში",
    });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "შეკვეთის სტატუსი განახლდა MySQL ბაზაში",
    });
  } catch (error: any) {
    console.error("PUT /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}

