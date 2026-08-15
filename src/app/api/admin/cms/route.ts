import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrismaClient();
    const pages = await prisma.cMSPage.findMany({
      orderBy: { title: "asc" },
    });
    return NextResponse.json({ success: true, data: pages });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrismaClient();
    const body = await request.json();
    const { id, title, slug, content } = body;

    if (!title || !slug) {
      return NextResponse.json({ success: false, message: "Title and slug are required" }, { status: 400 });
    }

    if (id) {
      const updated = await prisma.cMSPage.update({
        where: { id },
        data: { title, slug, content, lastUpdated: new Date() },
      });
      return NextResponse.json({ success: true, data: updated });
    } else {
      const created = await prisma.cMSPage.create({
        data: { title, slug, content: content || "" },
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

    await prisma.cMSPage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
