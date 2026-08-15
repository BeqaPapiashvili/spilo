import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrismaClient();
    const zones = await prisma.deliveryZone.findMany({
      orderBy: { title: "asc" },
    });
    return NextResponse.json({ success: true, data: zones });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrismaClient();
    const body = await request.json();
    const { id, title, price, estimatedDays, isActive = true } = body;

    if (!title || price === undefined || !estimatedDays) {
      return NextResponse.json({ success: false, message: "Title, price and estimatedDays required" }, { status: 400 });
    }

    if (id) {
      const updated = await prisma.deliveryZone.update({
        where: { id },
        data: { title, price: Number(price), estimatedDays, isActive: Boolean(isActive) },
      });
      return NextResponse.json({ success: true, data: updated });
    } else {
      const created = await prisma.deliveryZone.create({
        data: { title, price: Number(price), estimatedDays, isActive: Boolean(isActive) },
      });
      return NextResponse.json({ success: true, data: created });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
