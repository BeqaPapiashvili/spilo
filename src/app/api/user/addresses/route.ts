import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: addresses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, userId, title, city, street, apartment, postalCode, isDefault } = body;

    if (!userId || !street) {
      return NextResponse.json({ success: false, error: "User ID and street are required" }, { status: 400 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    if (id) {
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
          userId,
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Address ID is required" }, { status: 400 });
    }

    await prisma.address.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "მისამართი წაიშალა" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
