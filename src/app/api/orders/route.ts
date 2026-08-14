import { NextResponse } from "next/server";

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

    const orderId = `SP-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      status: "მუშავდება",
      items,
      customer,
      paymentMethod: paymentMethod || "ბარათით გადახდა",
      totalAmount,
      address,
    };

    return NextResponse.json({
      success: true,
      order: newOrder,
      message: "შეკვეთა წარმატებით დარეგისტრირდა",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
