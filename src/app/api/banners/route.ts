import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: "desc" },
    });

    const mapped = banners.map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle || "",
      ctaText: b.ctaText || "ნახვა",
      ctaLink: b.ctaLink || b.link || "/catalog",
      link: b.link || b.ctaLink || "/catalog",
      image: b.image || b.imageDesktop || "/placeholder.png",
      imageDesktop: b.imageDesktop || b.image || "/placeholder.png",
      position: (b.position as "HERO" | "MID_PAGE" | "CATEGORY" | "SIDEBAR") || "HERO",
      priority: b.priority || 1,
      isActive: b.isActive ?? true,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      count: mapped.length,
      data: mapped,
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
    const id = body.id;
    const title = body.title || "ბანერი";
    const subtitle = body.subtitle || null;
    const ctaText = body.ctaText || "ნახვა";
    const ctaLink = body.ctaLink || body.link || "/catalog";
    const link = body.link || body.ctaLink || "/catalog";
    const image = body.image || body.imageDesktop || "/placeholder.png";
    const imageDesktop = body.imageDesktop || body.image || "/placeholder.png";
    const position = body.position || "HERO";
    const priority = body.priority !== undefined ? Number(body.priority) : 1;
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : true;

    let banner;

    if (id) {
      banner = await prisma.banner.upsert({
        where: { id },
        update: {
          title,
          subtitle,
          ctaText,
          ctaLink,
          link,
          image,
          imageDesktop,
          position,
          priority,
          isActive,
        },
        create: {
          id,
          title,
          subtitle,
          ctaText,
          ctaLink,
          link,
          image,
          imageDesktop,
          position,
          priority,
          isActive,
        },
      });
    } else {
      banner = await prisma.banner.create({
        data: {
          title,
          subtitle,
          ctaText,
          ctaLink,
          link,
          image,
          imageDesktop,
          position,
          priority,
          isActive,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: banner.id,
        title: banner.title,
        subtitle: banner.subtitle || "",
        ctaText: banner.ctaText || "ნახვა",
        ctaLink: banner.ctaLink || banner.link || "/catalog",
        imageDesktop: banner.imageDesktop || banner.image,
        position: banner.position,
        priority: banner.priority,
        isActive: banner.isActive,
      },
      message: "ბანერი შეიქმნა / განახლდა MySQL ბაზაში",
    });
  } catch (error: any) {
    console.error("POST /api/banners error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "ბანერის შენახვა ვერ მოხერხდა" },
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
