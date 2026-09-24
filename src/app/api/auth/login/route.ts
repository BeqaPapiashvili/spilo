import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, setAuthCookie } from "@/lib/jwt";
import { enforceRateLimit, resetRateLimit, getClientIp } from "@/lib/rateLimit";
import { loginEmailCandidates } from "@/lib/loginEmail";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // 1. IP Rate Limiting (max 10 login attempts per 15 minutes per IP)
    const ipLimit = await enforceRateLimit(request, {
      namespace: "login_ip",
      identifier: clientIp,
      limit: 10,
      windowSeconds: 15 * 60,
      customMessage: "ძალიან ბევრი წარუმატებელი მცდელობა თქვენი IP მისამართიდან. გთხოვთ სცადოთ 15 წუთის შემდეგ.",
    });
    if (!ipLimit.success && ipLimit.response) return ipLimit.response;

    const body = await request.json();
    const { email, password } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "გთხოვთ მიუთითოთ ელფოსტის მისამართი" },
        { status: 400 }
      );
    }

    if (!password || !password.trim()) {
      return NextResponse.json(
        { success: false, error: "გთხოვთ მიუთითოთ პაროლი" },
        { status: 400 }
      );
    }

    const cleanInput = email.trim().toLowerCase();
    const emailCandidates = loginEmailCandidates(cleanInput);
    const targetEmail = emailCandidates[0] || cleanInput;
    const submittedPassword = password.trim();

    // 2. Account/Email Rate Limiting (max 5 failed attempts per 15 min per account)
    const emailLimit = await enforceRateLimit(request, {
      namespace: "login_email",
      identifier: cleanInput,
      limit: 5,
      windowSeconds: 15 * 60,
      customMessage: "ანგარიშზე ავტორიზაციის მცდელობების ლიმიტი გადაჭარბებულია. უსაფრთხოების მიზნით ანგარიში დროებით დაბლოკილია. გთხოვთ სცადოთ 15 წუთის შემდეგ.",
    });
    if (!emailLimit.success && emailLimit.response) return emailLimit.response;

    // 3. Search in User table first
    const admin = await prisma.adminUser.findFirst({
      where: { OR: emailCandidates.map((value) => ({ email: value })) },
    });

    let user = await prisma.user.findFirst({
      where: { OR: emailCandidates.map((value) => ({ email: value })) },
    });

    // 4. If user not in User table, search in AdminUser table and sync
    if (!user) {
      if (admin) {
        const hashedAdminPassword = admin.password?.startsWith("$2a$") || admin.password?.startsWith("$2b$")
          ? admin.password
          : await bcrypt.hash(admin.password || submittedPassword, 10);

        user = await prisma.user.upsert({
          where: { email: admin.email },
          update: {
            password: hashedAdminPassword,
            role: admin.role,
            name: admin.name,
          },
          create: {
            name: admin.name,
            email: admin.email,
            password: hashedAdminPassword,
            role: admin.role,
          },
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "მომხმარებელი ამ ელფოსტით ვერ მოიძებნა" },
        { status: 404 }
      );
    }

    // Verify password strictly using bcrypt compare
    const storedPassword = user.password || "";
    let isPasswordValid = false;

    const matchesPassword = async (stored?: string | null) => {
      if (!stored) return false;
      if (stored.startsWith("$2a$") || stored.startsWith("$2b$")) {
        return bcrypt.compare(submittedPassword, stored);
      }
      return stored === submittedPassword;
    };

    isPasswordValid =
      (await matchesPassword(storedPassword)) || (await matchesPassword(admin?.password));

    if (isPasswordValid && admin?.password && !(admin.password.startsWith("$2a$") || admin.password.startsWith("$2b$"))) {
      const newHash = await bcrypt.hash(submittedPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash },
      }).catch(() => {});
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "არასწორი პაროლი" },
        { status: 400 }
      );
    }

    // Clear rate limit counters upon successful login
    resetRateLimit(`login_email:${cleanInput}`);
    resetRateLimit(`login_ip:${clientIp}`);

    const isAdminRole = ["SUPER_ADMIN", "STORE_MANAGER", "SUPPORT_AGENT", "CATALOG_MANAGER", "ADMIN"].includes(user.role);

    const sessionPayload = {
      userId: user.id,
      name: user.name || targetEmail.split("@")[0],
      email: user.email || targetEmail,
      role: user.role,
    };

    // Sign cryptographic JWT token
    const token = await signToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name || targetEmail.split("@")[0],
        email: user.email,
        phone: user.phone || "",
        role: user.role,
      },
      adminSession: isAdminRole
        ? {
            id: user.id,
            name: user.name || targetEmail.split("@")[0],
            email: user.email || "",
            role: user.role,
          }
        : null,
      message: "ავტორიზაცია წარმატებით დასრულდა",
    });

    // Set signed JWT in secure HTTP-only cookie
    setAuthCookie(response, token);
    if (isAdminRole) {
      setAuthCookie(response, token, "admin");
    }

    return response;
  } catch (error: any) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "ავტორიზაციის შეცდომა" },
      { status: 500 }
    );
  }
}

