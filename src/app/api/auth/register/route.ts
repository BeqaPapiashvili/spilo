import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { enforceRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // Rate limit: max 5 registrations per 15 minutes per IP
    const rateLimitRes = await enforceRateLimit(request, {
      namespace: "register_ip",
      identifier: clientIp,
      limit: 5,
      windowSeconds: 15 * 60,
      customMessage: "რეგისტრაციის მცდელობების ლიმიტი გადაჭარბებულია. გთხოვთ სცადოთ 15 წუთის შემდეგ.",
    });
    if (!rateLimitRes.success && rateLimitRes.response) return rateLimitRes.response;

    const body = await request.json();

    const { name, email, password } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "გთხოვთ მიუთითოთ სახელი და გვარი" },
        { status: 400 }
      );
    }

    if (!email || !email.trim() || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "გთხოვთ მიუთითოთ სწორი ელფოსტის მისამართი" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: cleanEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "მომხმარებელი ამ ელფოსტით უკვე არსებობს" },
        { status: 400 }
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || "",
        role: newUser.role,
      },
      message: "რეგისტრაცია წარმატებით დასრულდა",
    });
  } catch (error: any) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "რეგისტრაციის შეცდომა" },
      { status: 500 }
    );
  }
}
