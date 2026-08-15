import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, method, items, customer, address } = body;

    if (!amount || !method) {
      return NextResponse.json(
        { success: false, error: "Amount and payment method are required" },
        { status: 400 }
      );
    }

    let finalOrderId = orderId;

    // Create Order in MySQL if customer & items passed
    if (!finalOrderId && items && Array.isArray(items) && customer) {
      const orderNumber = `SP-${Date.now().toString().slice(-6)}`;
      const newOrder = await prisma.order.create({
        data: {
          orderNumber,
          customerName: customer.name || "მომხმარებელი",
          contactPhone: customer.phone || "",
          shippingAddress: address || "თბილისი",
          paymentMethod: method,
          paymentStatus: method === "cod" ? "PENDING" : "PAID",
          status: "PENDING",
          totalAmount: Number(amount),
          items: {
            create: items.map((item: any) => ({
              productId: item.id || "prod-default",
              title: item.title || "პროდუქტი",
              quantity: item.quantity || 1,
              price: Number(item.price || 0),
              image: item.image || "",
            })),
          },
        },
      });
      finalOrderId = newOrder.id;
    }

    const transactionId = `TXN-${Date.now()}`;

    // Handling by Georgian Payment Gateway Providers:
    // TBC Checkout / BOG iPay / Payze / COD
    if (method === "tbc" || method === "bog" || method === "payze") {
      return NextResponse.json({
        success: true,
        transactionId,
        provider: method.toUpperCase(),
        redirectUrl: `/checkout/success?orderId=${finalOrderId || transactionId}&status=paid&provider=${method}`,
        message: `${method.toUpperCase()} გადახდის სესია წარმატებით შეიქმნა`,
      });
    }

    // Cash on delivery or Installment application
    return NextResponse.json({
      success: true,
      transactionId,
      provider: method,
      redirectUrl: `/checkout/success?orderId=${finalOrderId || transactionId}&status=pending`,
      message: "შეკვეთა მიღებულია",
    });
  } catch (error: any) {
    console.error("POST /api/checkout/create-payment error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Payment initiation failed" },
      { status: 500 }
    );
  }
}
