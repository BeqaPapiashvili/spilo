import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, code, action } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    if (action === "send") {
      // Mock / Connector for SMS.ge / Magti SMS API
      const generatedCode = "1234"; // Default dev OTP code

      return NextResponse.json({
        success: true,
        message: `4-ნიშნა კოდი გაიგზავნა ნომერზე: ${phone}`,
        // in development, we return devCode for quick testing:
        devCode: generatedCode,
      });
    }

    if (action === "verify") {
      if (code === "1234" || code === "9999") {
        return NextResponse.json({
          success: true,
          verified: true,
          token: `token_${Date.now()}`,
          message: "ავტორიზაცია წარმატებით დასრულდა",
        });
      }

      return NextResponse.json(
        { success: false, verified: false, error: "არასწორი ერთჯერადი SMS კოდი" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "OTP processing error" },
      { status: 500 }
    );
  }
}
