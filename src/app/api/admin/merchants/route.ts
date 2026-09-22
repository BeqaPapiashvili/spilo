import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/jwt";
import { MERCHANT_ROLE } from "@/lib/merchant";
import { recordAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const merchants = await prisma.user.findMany({
      where: { role: MERCHANT_ROLE },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        store: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ success: true, data: merchants });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "პარტნიორები ვერ ჩაიტვირთა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const storeId = String(body.storeId || "").trim();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "").trim();

    if (!storeId) {
      return NextResponse.json({ success: false, error: "აირჩიეთ მაღაზია" }, { status: 400 });
    }
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "სახელი, ელფოსტა და პაროლი აუცილებელია" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "პაროლი მინიმუმ 6 სიმბოლო უნდა იყოს" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return NextResponse.json({ success: false, error: "მაღაზია ვერ მოიძებნა" }, { status: 404 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.role !== MERCHANT_ROLE) {
      return NextResponse.json({ success: false, error: "ეს ელფოსტა უკვე გამოიყენება" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: { name, password: hashed, role: MERCHANT_ROLE, storeId },
        })
      : await prisma.user.create({
          data: { name, email, password: hashed, role: MERCHANT_ROLE, storeId },
        });

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "MERCHANT_CREATE",
      entity: "User",
      target: email,
      details: "პარტნიორი შეიქმნა მაღაზიისთვის " + store.name,
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, storeId },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "შექმნა ვერ მოხერხდა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
