import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant";

export async function PUT(request: Request) {
  try {
    const { session, errorResponse } = await requireMerchantSession(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const current = String(body.currentPassword || "");
    const next = String(body.newPassword || "").trim();
    if (next.length < 6) {
      return NextResponse.json({ success: false, error: "ახალი პაროლი მინიმუმ 6 სიმბოლო უნდა იყოს" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session?.userId || "" } });
    if (!user?.password) {
      return NextResponse.json({ success: false, error: "ანგარიში ვერ მოიძებნა" }, { status: 404 });
    }

    const ok = user.password.startsWith("$2")
      ? await bcrypt.compare(current, user.password)
      : user.password === current;
    if (!ok) {
      return NextResponse.json({ success: false, error: "მიმდინარე პაროლი არასწორია" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(next, 10) },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "პაროლი ვერ შეიცვალა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
