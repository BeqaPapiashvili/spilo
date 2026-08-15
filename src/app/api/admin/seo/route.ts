import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrismaClient();
    const settings = await prisma.seoSetting.findMany({
      orderBy: { pageSlug: "asc" },
    });
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrismaClient();
    const body = await request.json();
    const { pageSlug, metaTitle, metaDescription, metaKeywords } = body;

    if (!pageSlug || !metaTitle) {
      return NextResponse.json({ success: false, message: "pageSlug and metaTitle required" }, { status: 400 });
    }

    const saved = await prisma.seoSetting.upsert({
      where: { pageSlug },
      update: { metaTitle, metaDescription, metaKeywords },
      create: { pageSlug, metaTitle, metaDescription, metaKeywords },
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
