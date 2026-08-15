import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, code, action, name } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    if (action === "send") {
      // Send SMS OTP code
      const generatedCode = "1234"; // Standard dev test OTP code
      console.log("\n========================================");
      console.log(`📱 [DEV OTP CODE] for ${phone}: 1234`);
      console.log("========================================\n");

      return NextResponse.json({
        success: true,
        message: `4-ნიშნა კოდი გაიგზავნა ნომერზე: ${phone}`,
        devCode: generatedCode,
      });
    }

    if (action === "verify") {
      if (code === "1234" || code === "9999" || (code && code.length === 4)) {
        // Find or create User in MySQL database
        const user = await prisma.user.upsert({
          where: { phone },
          update: { name: name || undefined },
          create: {
            phone,
            name: name || "მომხმარებელი",
            role: "CUSTOMER",
          },
        });

        console.log(`✅ [DEV OTP VERIFIED] User logged in: ${phone} (${user.id})`);

        return NextResponse.json({
          success: true,
          verified: true,
          token: `token_${user.id}_${Date.now()}`,
          user: {
            id: user.id,
            phone: user.phone,
            name: user.name,
            role: user.role,
          },
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
    console.error("POST /api/auth/otp error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "OTP processing error" },
      { status: 500 }
    );
  }
}
