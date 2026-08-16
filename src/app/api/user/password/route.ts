import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getAuthSession } from "@/lib/jwt";

export async function PUT(request: Request) {
  try {
    // 1. Enforce verified session (IDOR prevention)
    const session = await getAuthSession(request);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: "ავტორიზაცია აუცილებელია (Unauthorized)" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // 2. Strict validation: currentPassword and newPassword are both strictly required
    if (!currentPassword || typeof currentPassword !== "string" || !currentPassword.trim()) {
      return NextResponse.json(
        { success: false, error: "გთხოვთ მიუთითოთ მიმდინარე პაროლი" },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: "ახალი პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს" },
        { status: 400 }
      );
    }

    // 3. Lookup authenticated user strictly by session userId
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "მომხმარებელი ვერ მოიძებნა" },
        { status: 404 }
      );
    }

    // 4. Verify current password with bcrypt (or legacy migration if applicable)
    const storedPassword = user.password || "";
    let isCurrentPasswordValid = false;

    if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")) {
      isCurrentPasswordValid = await bcrypt.compare(currentPassword.trim(), storedPassword);
    } else if (storedPassword && storedPassword === currentPassword.trim()) {
      isCurrentPasswordValid = true;
    }

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: "მიმდინარე პაროლი არასწორია" },
        { status: 400 }
      );
    }

    // 5. Hash new password with bcrypt — NEVER store plain text
    const hashedNewPassword = await bcrypt.hash(newPassword.trim(), 10);

    // 6. Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    // 7. Sync AdminUser if this user has an associated admin record
    if (user.email) {
      await prisma.adminUser.updateMany({
        where: { email: user.email },
        data: { password: hashedNewPassword },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "პაროლი წარმატებით შეიცვალა",
    });
  } catch (error: any) {
    console.error("PUT /api/user/password error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "პაროლის შეცვლის შეცდომა" },
      { status: 500 }
    );
  }
}
