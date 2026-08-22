import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/jwt";
import { ADMIN_ROLES } from "@/lib/permissions";

export async function GET(request: Request) {
  try {
    const session = await getAuthSession(request);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: "ავტორიზაცია აუცილებელია (Unauthorized)" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("userId");

    const isAdmin = session.role && ADMIN_ROLES.includes(session.role);
    const targetUserId = (isAdmin && requestedUserId) ? requestedUserId : session.userId;

    const addresses = await prisma.address.findMany({
      where: { userId: targetUserId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: addresses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession(request);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: "ავტორიზაცია აუცილებელია (Unauthorized)" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, title, city, street, apartment, postalCode, isDefault } = body;

    if (!street) {
      return NextResponse.json({ success: false, error: "ქუჩის მისამართი აუცილებელია" }, { status: 400 });
    }

    const effectiveUserId = session.userId;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: effectiveUserId },
        data: { isDefault: false },
      });
    }

    if (id) {
      // Ensure the address belongs to this user (or admin)
      const existing = await prisma.address.findUnique({ where: { id } });
      const isAdmin = session.role && ADMIN_ROLES.includes(session.role);

      if (!existing || (!isAdmin && existing.userId !== effectiveUserId)) {
        return NextResponse.json(
          { success: false, error: "მისამართი ვერ მოიძებნა ან წვდომა შეზღუდულია" },
          { status: 403 }
        );
      }

      const updated = await prisma.address.update({
        where: { id },
        data: {
          title: title || "მისამართი",
          city: city || "თბილისი",
          street: street.trim(),
          apartment: apartment || null,
          postalCode: postalCode || null,
          isDefault: Boolean(isDefault),
        },
      });
      return NextResponse.json({ success: true, data: updated });
    } else {
      const created = await prisma.address.create({
        data: {
          userId: effectiveUserId,
          title: title || "მისამართი",
          city: city || "თბილისი",
          street: street.trim(),
          apartment: apartment || null,
          postalCode: postalCode || null,
          isDefault: Boolean(isDefault),
        },
      });
      return NextResponse.json({ success: true, data: created });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAuthSession(request);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: "ავტორიზაცია აუცილებელია (Unauthorized)" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Address ID is required" }, { status: 400 });
    }

    const existing = await prisma.address.findUnique({ where: { id } });
    const isAdmin = session.role && ADMIN_ROLES.includes(session.role);

    if (!existing || (!isAdmin && existing.userId !== session.userId)) {
      return NextResponse.json(
        { success: false, error: "მისამართი ვერ მოიძებნა ან წვდომა შეზღუდულია" },
        { status: 403 }
      );
    }

    await prisma.address.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "მისამართი წაიშალა" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

