import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, setAuthCookie, clearAuthCookie, requireAdminSession } from "@/lib/jwt";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function GET(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    return NextResponse.json({
      success: true,
      admin: {
        id: session?.userId,
        name: session?.name || "Admin",
        email: session?.email || "",
        role: session?.role,
        status: "ACTIVE",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "სესიის შემოწმება ვერ მოხერხდა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const rate = await enforceRateLimit(request, {
      namespace: "admin_login",
      limit: 8,
      windowSeconds: 15 * 60,
      customMessage: "ძალიან ბევრი ავტორიზაციის მცდელობა. გთხოვთ სცადოთ 15 წუთის შემდეგ.",
    });
    if (!rate.success && rate.response) return rate.response;

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "გთხოვთ მიუთითოთ ელ-ფოსტა და პაროლი" },
        { status: 400 }
      );
    }

    const cleanInput = email.trim().toLowerCase();
    const targetEmail = cleanInput.includes("@") ? cleanInput : `${cleanInput}@spilo.ge`;
    const submittedPassword = password.trim();

    // 1. Check User table
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanInput },
          { email: targetEmail },
        ],
      },
    });

    // 2. Check AdminUser table if not in User table
    let admin = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { email: cleanInput },
          { email: targetEmail },
        ],
      },
    });

    if (!user && !admin) {
      return NextResponse.json(
        { success: false, error: "ადმინისტრატორი ამ მონაცემებით ვერ მოიძებნა" },
        { status: 404 }
      );
    }

    // Role check: Only administrative roles are allowed into admin panel
    const activeRole = user?.role || admin?.role || "CUSTOMER";
    const allowedAdminRoles = ["SUPER_ADMIN", "STORE_MANAGER", "SUPPORT_AGENT", "CATALOG_MANAGER", "ADMIN"];
    
    if (activeRole === "MERCHANT") {
      return NextResponse.json(
        { success: false, error: "პარტნიორის შესასვლელი: /merchant/login" },
        { status: 403 }
      );
    }

    if (!allowedAdminRoles.includes(activeRole)) {
      return NextResponse.json(
        { success: false, error: "თქვენ არ გაქვთ ადმინ პანელში შესვლის უფლება" },
        { status: 403 }
      );
    }

    // Password verification with strict bcrypt comparison (no backdoor bypass)
    const storedPassword = user?.password || admin?.password || "";
    let isPasswordValid = false;

    if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")) {
      isPasswordValid = await bcrypt.compare(submittedPassword, storedPassword);
    } else if (storedPassword && storedPassword === submittedPassword) {
      isPasswordValid = true;
      // Auto-migrate legacy plain text to secure bcrypt hash
      const newHash = await bcrypt.hash(submittedPassword, 10);
      if (user?.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { password: newHash },
        }).catch(() => {});
      }
      if (admin?.id) {
        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { password: newHash },
        }).catch(() => {});
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "არასწორი პაროლი" },
        { status: 401 }
      );
    }

    const userId = user?.id || admin?.id || "admin";
    const userName = user?.name || admin?.name || "Admin User";
    const userEmail = user?.email || admin?.email || targetEmail;

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          adminEmail: userEmail,
          action: "ADMIN_LOGIN",
          target: "Admin Panel Dashboard",
        },
      });
    } catch {
      // Ignore audit log error
    }

    const sessionPayload = {
      userId,
      name: userName,
      email: userEmail,
      role: activeRole,
    };

    // Generate cryptographically signed JWT token
    const token = await signToken(sessionPayload);

    const adminPayload = {
      id: userId,
      name: userName,
      email: userEmail,
      role: activeRole,
      status: "ACTIVE",
    };

    const response = NextResponse.json({
      success: true,
      admin: adminPayload,
      user: {
        id: userId,
        name: userName,
        email: userEmail,
        phone: user?.phone || "",
        role: activeRole,
      },
      message: "ავტორიზაცია წარმატებით დასრულდა",
    });

    // Set secure HTTP-only cookie
    setAuthCookie(response, token, "admin");

    return response;
  } catch (error: any) {
    console.error("POST /api/admin/auth error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "ავტორიზაციის შეცდომა" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  clearAuthCookie(response, "admin");
  return response;
}
