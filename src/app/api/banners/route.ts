import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: banners.length,
      data: banners,
    });
  } catch (error: any) {
    console.error("GET /api/banners error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, image, link } = body;

    if (!title || !image) {
      return NextResponse.json(
        { success: false, error: "სათაური და სურათი აუცილებელია" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        image,
        link: link || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: banner,
      message: "ბანერი შეიქმნა MySQL ბაზაში",
    });
  } catch (error: any) {
    console.error("POST /api/banners error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "ბანერის შექმნა ვერ მოხერხდა" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ბანერის ID აუცილებელია" },
        { status: 400 }
      );
    }

    await prisma.banner.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "ბანერი წაიშალა MySQL ბაზიდან",
    });
  } catch (error: any) {
    console.error("DELETE /api/banners error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "ბანერის წაშლა ვერ მოხერხდა" },
      { status: 500 }
    );
  }
}
