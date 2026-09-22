import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/jwt";
import { MERCHANT_ROLE } from "@/lib/merchant";
import { recordAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;
    const { id } = await params;
    const merchants = await prisma.user.findMany({
      where: { storeId: id, role: MERCHANT_ROLE },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: merchants });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "პარტნიორები ვერ ჩაიტვირთა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;
    const { id } = await params;
    const store = await prisma.store.findUnique({ where: { id } });
    if (!store) {
      return NextResponse.json({ success: false, error: "მაღაზია ვერ მოიძებნა" }, { status: 404 });
    }

    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "").trim();
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "სახელი, ელფოსტა და პაროლი აუცილებელია" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "პაროლი მინიმუმ 6 სიმბოლო უნდა იყოს" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.role !== MERCHANT_ROLE) {
      return NextResponse.json({ success: false, error: "ეს ელფოსტა უკვე გამოიყენება" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: { name, password: hashed, role: MERCHANT_ROLE, storeId: id },
        })
      : await prisma.user.create({
          data: { name, email, password: hashed, role: MERCHANT_ROLE, storeId: id },
        });

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "MERCHANT_CREATE",
      entity: "User",
      target: email,
      details: `პარტნიორი შეიქმნა მაღაზიისთვის ${store.name}`,
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "შექმნა ვერ მოხერხდა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;
    const { id } = await params;
    const body = await request.json();
    const merchantId = String(body.id || "").trim();
    const password = String(body.password || "").trim();
    if (!merchantId || password.length < 6) {
      return NextResponse.json({ success: false, error: "ახალი პაროლი მინიმუმ 6 სიმბოლო უნდა იყოს" }, { status: 400 });
    }

    const merchant = await prisma.user.findFirst({
      where: { id: merchantId, storeId: id, role: MERCHANT_ROLE },
    });
    if (!merchant) {
      return NextResponse.json({ success: false, error: "პარტნიორი ვერ მოიძებნა" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: merchant.id },
      data: { password: await bcrypt.hash(password, 10) },
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "პაროლი ვერ შეიცვალა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;
    const { id } = await params;
    const merchantId = new URL(request.url).searchParams.get("id") || "";
    const merchant = await prisma.user.findFirst({
      where: { id: merchantId, storeId: id, role: MERCHANT_ROLE },
    });
    if (!merchant) {
      return NextResponse.json({ success: false, error: "პარტნიორი ვერ მოიძებნა" }, { status: 404 });
    }
    await prisma.user.update({
      where: { id: merchant.id },
      data: { role: "CUSTOMER", storeId: null },
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "წაშლა ვერ მოხერხდა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
