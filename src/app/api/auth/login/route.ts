import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, setAuthCookie } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
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
    const targetEmail = cleanInput.includes("@") ? cleanInput : `${cleanInput}@spilo.ge`;
    const submittedPassword = password.trim();

    // 1. Search in User table first
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanInput },
          { email: targetEmail },
        ],
      },
    });

    // 2. If user not in User table, search in AdminUser table and sync
    if (!user) {
      const admin = await prisma.adminUser.findFirst({
        where: {
          OR: [
            { email: cleanInput },
            { email: targetEmail },
          ],
        },
      });

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

    // Verify password strictly using bcrypt compare (backdoors removed)
    const storedPassword = user.password || "";
    let isPasswordValid = false;

    if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")) {
      isPasswordValid = await bcrypt.compare(submittedPassword, storedPassword);
    } else if (storedPassword && storedPassword === submittedPassword) {
      isPasswordValid = true;
      // Auto-migrate legacy plain text password to bcrypt hash
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
      token,
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
      adminToken: isAdminRole ? token : null,
      message: "ავტორიზაცია წარმატებით დასრულდა",
    });

    // Set signed JWT in secure HTTP-only cookie
    setAuthCookie(response, token);

    return response;
  } catch (error: any) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "ავტორიზაციის შეცდომა" },
      { status: 500 }
    );
  }
}
