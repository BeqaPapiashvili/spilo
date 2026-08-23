import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { enforceRateLimit, getClientIp } from "@/lib/rateLimit";
import { signToken, setAuthCookie } from "@/lib/jwt";

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

    const { name, email, phone, password, agreeTerms, subscribeOffers } = body;

    // 1. Validate Full Name
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "გთხოვთ მიუთითოთ სახელი და გვარი" },
        { status: 400 }
      );
    }

    // 2. Validate Email
    if (!email || !email.trim() || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "გთხოვთ მიუთითოთ სწორი ელფოსტის მისამართი" },
        { status: 400 }
      );
    }

    // 3. Validate Phone Number (Georgian format check)
    const rawPhone = (phone || "").toString().replace(/\D/g, ""); // digits only
    // Support 9 digits (e.g. 599123456) or 12 digits (995599123456)
    let cleanPhone = rawPhone;
    if (cleanPhone.startsWith("995") && cleanPhone.length === 12) {
      cleanPhone = cleanPhone.slice(3);
    }

    if (!cleanPhone || cleanPhone.length !== 9 || !cleanPhone.startsWith("5")) {
      return NextResponse.json(
        { success: false, error: "გთხოვთ მიუთითოთ სწორი 9-ნიშნა მობილურის ნომერი (მაგ: 599 12 34 56)" },
        { status: 400 }
      );
    }

    // 4. Validate Password
    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს" },
        { status: 400 }
      );
    }

    // 5. Validate Terms Agreement
    if (agreeTerms !== true) {
      return NextResponse.json(
        { success: false, error: "რეგისტრაციის გასაგრძელებლად დაეთანხმეთ წესებსა და კონფიდენციალურობის პოლიტიკას" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const nameParts = cleanName.split(/\s+/);
    const firstName = nameParts[0] || cleanName;
    const lastName = nameParts.slice(1).join(" ") || "";

    // 6. Check if email already registered
    const existingByEmail = await prisma.user.findFirst({
      where: { email: cleanEmail },
    });

    if (existingByEmail) {
      return NextResponse.json(
        { success: false, error: "მომხმარებელი ამ ელფოსტით უკვე არსებობს" },
        { status: 400 }
      );
    }

    // 7. Check if phone already registered
    const existingByPhone = await prisma.user.findFirst({
      where: { phone: cleanPhone },
    });

    if (existingByPhone) {
      return NextResponse.json(
        { success: false, error: "მომხმარებელი ამ ტელეფონის ნომრით უკვე არსებობს" },
        { status: 400 }
      );
    }

    // 8. Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    // 9. Create user in database
    const newUser = await prisma.user.create({
      data: {
        name: cleanName,
        firstName,
        lastName,
        email: cleanEmail,
        phone: cleanPhone,
        password: hashedPassword,
        smsNotify: subscribeOffers !== false,
        emailNotify: subscribeOffers !== false,
        role: "CUSTOMER",
      },
    });

    // 10. Create signed JWT token session
    const sessionPayload = {
      userId: newUser.id,
      name: newUser.name || cleanName,
      email: newUser.email || cleanEmail,
      role: newUser.role,
    };

    const token = await signToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
      message: "რეგისტრაცია წარმატებით დასრულდა",
    });

    // Set secure HTTP-only auth cookie
    setAuthCookie(response, token);

    return response;
  } catch (error: any) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "რეგისტრაციის შეცდომა" },
      { status: 500 }
    );
  }
}
