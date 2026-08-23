import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { enforceRateLimit, resetRateLimit, getClientIp } from "@/lib/rateLimit";

function getEmailHashKey(email: string): string {
  const hash = crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
  return `em_${hash.slice(0, 20)}`;
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // 1. IP Rate Limiting
    const ipLimit = await enforceRateLimit(request, {
      namespace: "reset_pwd_ip",
      identifier: clientIp,
      limit: 10,
      windowSeconds: 15 * 60,
      customMessage: "ძალიან ბევრი მცდელობა თქვენი IP მისამართიდან. გთხოვთ სცადოთ 15 წუთის შემდეგ.",
    });
    if (!ipLimit.success && ipLimit.response) return ipLimit.response;

    const body = await request.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { success: false, error: "ელფოსტა, კოდი და ახალი პაროლი აუცილებელია" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();
    const cleanNewPassword = newPassword.toString().trim();

    if (cleanNewPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "ახალი პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს" },
        { status: 400 }
      );
    }

    const emailKey = getEmailHashKey(cleanEmail);

    // 2. Fetch latest active verification record
    const activeRecord = await prisma.otpVerification.findFirst({
      where: {
        phone: emailKey,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!activeRecord) {
      return NextResponse.json(
        { success: false, error: "აღდგენის კოდი არასწორია ან ვადაგასულია. გთხოვთ მოითხოვოთ ახალი კოდი." },
        { status: 400 }
      );
    }

    // Brute-force protection: max 5 attempts per code
    if (activeRecord.attempts >= 5) {
      await prisma.otpVerification.update({
        where: { id: activeRecord.id },
        data: { used: true },
      });
      return NextResponse.json(
        { success: false, error: "კოდის შეყვანის მცდელობების ლიმიტი ამოიწურა. გთხოვთ მოითხოვოთ ახალი კოდი." },
        { status: 400 }
      );
    }

    // Increment attempts
    await prisma.otpVerification.update({
      where: { id: activeRecord.id },
      data: { attempts: { increment: 1 } },
    });

    // Check code match
    const isMatch = await bcrypt.compare(cleanCode, activeRecord.hashedCode);
    if (!isMatch) {
      const remaining = Math.max(0, 4 - activeRecord.attempts);
      return NextResponse.json(
        { success: false, error: `არასწორი კოდი. დარჩენილია ${remaining} მცდელობა.` },
        { status: 400 }
      );
    }

    // Mark code as consumed
    await prisma.otpVerification.update({
      where: { id: activeRecord.id },
      data: { used: true },
    });

    // Clear rate limits
    resetRateLimit(`forgot_pwd_email:${cleanEmail}`);
    resetRateLimit(`forgot_pwd_ip:${clientIp}`);

    // Hash new password
    const hashedPassword = await bcrypt.hash(cleanNewPassword, 10);

    // Update in User table if exists
    await prisma.user.updateMany({
      where: { email: cleanEmail },
      data: { password: hashedPassword },
    });

    // Update in AdminUser table if exists
    await prisma.adminUser.updateMany({
      where: { email: cleanEmail },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "პაროლი წარმატებით შეიცვალა. შეგიძლიათ გაიაროთ ავტორიზაცია ახალი პაროლით.",
    });
  } catch (error: any) {
    console.error("POST /api/auth/reset-password error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "პაროლის შეცვლის შეცდომა" },
      { status: 500 }
    );
  }
}
