import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, method, returnUrl } = body;

    if (!amount || !method) {
      return NextResponse.json(
        { success: false, error: "Amount and payment method are required" },
        { status: 400 }
      );
    }

    const transactionId = `TXN-${Date.now()}`;

    // Handling by Georgian Payment Gateway Providers:
    // TBC Checkout / BOG iPay / Payze / COD
    if (method === "tbc" || method === "bog" || method === "payze") {
      return NextResponse.json({
        success: true,
        transactionId,
        provider: method.toUpperCase(),
        redirectUrl: `/checkout/success?orderId=${orderId || transactionId}&status=paid&provider=${method}`,
        message: `${method.toUpperCase()} გადახდის სესია წარმატებით შეიქმნა`,
      });
    }

    // Cash on delivery or Installment application
    return NextResponse.json({
      success: true,
      transactionId,
      provider: method,
      redirectUrl: `/checkout/success?orderId=${orderId || transactionId}&status=pending`,
      message: "შეკვეთა მიღებულია",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Payment initiation failed" },
      { status: 500 }
    );
  }
}
