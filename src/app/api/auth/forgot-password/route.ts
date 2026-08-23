import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { enforceRateLimit, getClientIp } from "@/lib/rateLimit";
import { sendPasswordResetEmail } from "@/lib/email";

function getEmailHashKey(email: string): string {
  const hash = crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
  return `em_${hash.slice(0, 20)}`;
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // 1. IP Rate Limiting (max 5 reset requests per 15 min per IP)
    const ipLimit = await enforceRateLimit(request, {
      namespace: "forgot_pwd_ip",
      identifier: clientIp,
      limit: 5,
      windowSeconds: 15 * 60,
      customMessage: "ძალიან ბევრი მოთხოვნა თქვენი IP მისამართიდან. გთხოვთ სცადოთ 15 წუთის შემდეგ.",
    });
    if (!ipLimit.success && ipLimit.response) return ipLimit.response;

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.trim() || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "გთხოვთ მიუთითოთ სწორი ელფოსტის მისამართი" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Email Rate Limiting (max 3 reset requests per 15 min per email)
    const emailLimit = await enforceRateLimit(request, {
      namespace: "forgot_pwd_email",
      identifier: cleanEmail,
      limit: 3,
      windowSeconds: 15 * 60,
      customMessage: "პაროლის აღდგენის მოთხოვნების ლიმიტი ამოიწურა. გთხოვთ სცადოთ 15 წუთის შემდეგ.",
    });
    if (!emailLimit.success && emailLimit.response) return emailLimit.response;

    // 3. Find user in User table or AdminUser table
    const user = await prisma.user.findFirst({
      where: { email: cleanEmail },
    });

    const adminUser = !user
      ? await prisma.adminUser.findFirst({ where: { email: cleanEmail } })
      : null;

    if (!user && !adminUser) {
      // Return ambiguous success to prevent email enumeration attacks
      return NextResponse.json({
        success: true,
        message: "თუ მითითებული ელფოსტით ანგარიში არსებობს, პაროლის აღდგენის კოდი გაიგზავნა.",
      });
    }

    const recipientName = user?.name || adminUser?.name || "მომხმარებელი";
    const emailKey = getEmailHashKey(cleanEmail);

    // Invalidate previous unconsumed reset tokens for this email
    await prisma.otpVerification.updateMany({
      where: {
        phone: emailKey,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Generate secure 6-digit verification code (100000 - 999999)
    const rawCode = crypto.randomInt(100000, 1000000).toString();
    const hashedCode = await bcrypt.hash(rawCode, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    // Store in OtpVerification table
    await prisma.otpVerification.create({
      data: {
        phone: emailKey,
        hashedCode,
        expiresAt,
        attempts: 0,
        used: false,
        ipAddress: clientIp,
      },
    });

    // Send reset instructions via transactional email
    const emailResult = await sendPasswordResetEmail({
      to: cleanEmail,
      name: recipientName,
      code: rawCode,
    });

    const isDevMode = !process.env.RESEND_API_KEY && !process.env.BREVO_API_KEY && !process.env.SMTP_HOST;

    return NextResponse.json({
      success: true,
      devCode: isDevMode ? rawCode : undefined,
      message: isDevMode
        ? `პაროლის აღდგენის კოდია: ${rawCode} (მეილის რეალურად მისაღებად ჩაამატეთ RESEND_API_KEY .env-ში)`
        : "პაროლის აღდგენის 6-ნიშნა კოდი გაიგზავნა მითითებულ ელფოსტაზე.",
    });
  } catch (error: any) {
    console.error("POST /api/auth/forgot-password error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "პაროლის აღდგენის მოთხოვნის შეცდომა" },
      { status: 500 }
    );
  }
}
