import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrismaClient();
    const items = await prisma.navigationItem.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrismaClient();
    const body = await request.json();
    const { id, label, url, order = 0 } = body;

    if (!label || !url) {
      return NextResponse.json({ success: false, message: "Label and URL are required" }, { status: 400 });
    }

    if (id) {
      const updated = await prisma.navigationItem.update({
        where: { id },
        data: { label, url, order: Number(order) },
      });
      return NextResponse.json({ success: true, data: updated });
    } else {
      const created = await prisma.navigationItem.create({
        data: { label, url, order: Number(order) },
      });
      return NextResponse.json({ success: true, data: created });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const prisma = getPrismaClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    await prisma.navigationItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
