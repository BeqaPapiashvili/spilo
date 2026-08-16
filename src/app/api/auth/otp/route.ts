import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { signToken, setAuthCookie } from "@/lib/jwt";

/**
 * Normalizes Georgian phone numbers (removes spaces, dashes, parentheses, ensures standard 9-digit format).
 */
function normalizePhoneNumber(rawPhone: string): string {
  const digitsOnly = rawPhone.replace(/\D/g, "");
  if (digitsOnly.startsWith("995") && digitsOnly.length === 12) {
    return digitsOnly.substring(3);
  }
  return digitsOnly;
}

/**
 * Dispatches SMS via SMS Office API if configured, or logs instructions.
 */
async function sendSmsViaProvider(phone: string, code: string): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.SMS_OFFICE_API_KEY;
  const senderId = process.env.SMS_SENDER_ID || "Spilo";

  if (!apiKey) {
    console.warn(
      `[SMS NOTICE] SMS_OFFICE_API_KEY is not configured in .env. OTP for 5${phone.slice(-8)} generated securely in database.`
    );
    return { sent: false, reason: "SMS_OFFICE_API_KEY missing" };
  }

  try {
    const fullPhone = phone.startsWith("995") ? phone : `995${phone}`;
    const messageText = `Spilo.ge - თქვენი ერთჯერადი კოდია: ${code}. მოქმედების ვადა: 5 წუთი.`;
    const url = `https://smsoffice.ge/api/v2/send/?key=${encodeURIComponent(apiKey)}&destination=${encodeURIComponent(fullPhone)}&sender=${encodeURIComponent(senderId)}&content=${encodeURIComponent(messageText)}`;

    const res = await fetch(url, { method: "GET" });
    const result = await res.json().catch(() => null);

    if (res.ok && result?.Success) {
      return { sent: true };
    }
    return { sent: false, reason: result?.Message || "SMS gateway rejected request" };
  } catch (error: any) {
    console.error("[SMS Gateway Error]:", error);
    return { sent: false, reason: error.message };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone: rawPhone, code, action, name } = body;

    if (!rawPhone || typeof rawPhone !== "string" || !rawPhone.trim()) {
      return NextResponse.json(
        { success: false, error: "გთხოვთ მიუთითოთ ტელეფონის ნომერი" },
        { status: 400 }
      );
    }

    const phone = normalizePhoneNumber(rawPhone.trim());
    if (phone.length < 9) {
      return NextResponse.json(
        { success: false, error: "გთხოვთ მიუთითოთ სწორი 9-ნიშნა ტელეფონის ნომერი" },
        { status: 400 }
      );
    }

    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // -------------------------------------------------------------
    // ACTION 1: SEND OTP
    // -------------------------------------------------------------
    if (action === "send") {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      // Rate limit check: max 3 OTP requests per phone number in 15 minutes
      const recentOtpCount = await prisma.otpVerification.count({
        where: {
          phone,
          createdAt: { gte: fifteenMinutesAgo },
        },
      });

      if (recentOtpCount >= 3) {
        return NextResponse.json(
          {
            success: false,
            error: "გადაჭარბებულია SMS-ის მოთხოვნის ლიმიტი (მაქსიმუმ 3 მოთხოვნა 15 წუთში). გთხოვთ სცადოთ მოგვიანებით.",
          },
          { status: 429 }
        );
      }

      // Invalidate any previous unconsumed active OTPs for this phone
      await prisma.otpVerification.updateMany({
        where: {
          phone,
          used: false,
        },
        data: {
          used: true,
        },
      });

      // Generate cryptographically random 4-digit code (1000 to 9999)
      const rawCode = crypto.randomInt(1000, 10000).toString();
      const hashedCode = await bcrypt.hash(rawCode, 10);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Store hashed OTP in database
      await prisma.otpVerification.create({
        data: {
          phone,
          hashedCode,
          expiresAt,
          attempts: 0,
          used: false,
          ipAddress: clientIp,
        },
      });

      // Dispatch SMS
      await sendSmsViaProvider(phone, rawCode);

      return NextResponse.json({
        success: true,
        message: `4-ნიშნა ერთჯერადი კოდი გაიგზავნა ნომერზე: ${phone}`,
      });
    }

    // -------------------------------------------------------------
    // ACTION 2: VERIFY OTP
    // -------------------------------------------------------------
    if (action === "verify") {
      if (!code || typeof code !== "string" || code.trim().length !== 4) {
        return NextResponse.json(
          { success: false, verified: false, error: "გთხოვთ მიუთითოთ 4-ნიშნა კოდი" },
          { status: 400 }
        );
      }

      const submittedCode = code.trim();

      // Find the latest active, non-expired, unconsumed OTP
      const activeOtp = await prisma.otpVerification.findFirst({
        where: {
          phone,
          used: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!activeOtp) {
        return NextResponse.json(
          { success: false, verified: false, error: "ერთჯერადი კოდი არ მოიძებნა ან ვადაგასულია. გთხოვთ მოითხოვოთ ახალი კოდი." },
          { status: 400 }
        );
      }

      // Brute-force protection: Max 5 attempts per code
      if (activeOtp.attempts >= 5) {
        await prisma.otpVerification.update({
          where: { id: activeOtp.id },
          data: { used: true },
        });
        return NextResponse.json(
          { success: false, verified: false, error: "კოდის შეყვანის მცდელობების რაოდენობა ამოიწურა. გთხოვთ მოითხოვოთ ახალი კოდი." },
          { status: 400 }
        );
      }

      // Increment attempt counter
      await prisma.otpVerification.update({
        where: { id: activeOtp.id },
        data: { attempts: { increment: 1 } },
      });

      // Verify code against salted hash
      const isMatch = await bcrypt.compare(submittedCode, activeOtp.hashedCode);

      if (!isMatch) {
        const remainingAttempts = Math.max(0, 4 - activeOtp.attempts);
        return NextResponse.json(
          {
            success: false,
            verified: false,
            error: `არასწორი SMS კოდი. დარჩენილია ${remainingAttempts} მცდელობა.`,
          },
          { status: 400 }
        );
      }

      // Mark OTP as used/consumed
      await prisma.otpVerification.update({
        where: { id: activeOtp.id },
        data: { used: true },
      });

      // Find or create customer user
      const user = await prisma.user.upsert({
        where: { phone },
        update: { name: name?.trim() || undefined },
        create: {
          phone,
          name: name?.trim() || "მომხმარებელი",
          role: "CUSTOMER",
        },
      });

      const sessionPayload = {
        userId: user.id,
        name: user.name || "მომხმარებელი",
        email: user.email || `${phone}@spilo.ge`,
        role: user.role,
      };

      const token = await signToken(sessionPayload);

      const response = NextResponse.json({
        success: true,
        verified: true,
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: "ავტორიზაცია წარმატებით დასრულდა",
      });

      // Set HTTP-only secure cookie
      setAuthCookie(response, token);

      return response;
    }

    return NextResponse.json({ success: false, error: "არასწორი მოქმედება (Invalid action)" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/auth/otp error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "OTP დამუშავების შეცდომა" },
      { status: 500 }
    );
  }
}
