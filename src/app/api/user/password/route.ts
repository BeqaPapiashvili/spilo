import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, currentPassword, newPassword } = body;

    if (!email && !phone) {
      return NextResponse.json(
        { success: false, error: "მომხმარებლის იდენტიფიკატორი მიუთითეთ" },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "ახალი პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს" },
        { status: 400 }
      );
    }

    const whereConditions: any[] = [];
    if (email) whereConditions.push({ email });
    if (phone) whereConditions.push({ phone });

    let user = await prisma.user.findFirst({
      where: { OR: whereConditions },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "მომხმარებელი ვერ მოიძებნა" },
        { status: 404 }
      );
    }

    // Verify current password if user has one set
    if (user.password && currentPassword) {
      const isValid = user.password === currentPassword.trim();
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "მიმდინარე პაროლი არასწორია" },
          { status: 400 }
        );
      }
    }

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPassword.trim() },
    });

    return NextResponse.json({
      success: true,
      message: "პაროლი წარმატებით განახლდა SQL ბაზაში",
    });
  } catch (error: any) {
    console.error("PUT /api/user/password error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "პაროლის შეცვლის შეცდომა" },
      { status: 500 }
    );
  }
}
