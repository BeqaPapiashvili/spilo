import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");
    const activeOnly = searchParams.get("activeOnly") === "true";

    const where: any = {};
    if (position) where.position = position;
    if (activeOnly) where.isActive = true;

    const banners = await prisma.banner.findMany({
      where,
      orderBy: { priority: "asc" },
    });

    const mapped = banners.map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle || "",
      ctaText: b.ctaText || "ნახვა",
      ctaLink: b.ctaLink || b.link || "/catalog",
      link: b.link || b.ctaLink || "/catalog",
      image: b.image || b.imageDesktop || "",
      imageDesktop: b.imageDesktop || b.image || "",
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

import { requireAdminSession } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();

    // Check if bulk reorder array is passed: { reorder: [{ id, priority }] }
    if (body.reorder && Array.isArray(body.reorder)) {
      await prisma.$transaction(
        body.reorder.map((item: { id: string; priority: number }) =>
          prisma.banner.update({
            where: { id: item.id },
            data: { priority: Number(item.priority) },
          })
        )
      );

      await recordAuditLog({
        userId: session?.userId,
        adminEmail: session?.email,
        adminName: session?.name,
        action: "BANNER_REORDER",
        entity: "Banner",
        target: "ბანერების რიგი",
        details: "ბანერების თანმიმდევრობა განახლდა",
      });

      return NextResponse.json({
        success: true,
        message: "ბანერების თანმიმდევრობა განახლდა",
      });
    }

    const id = body.id;
    const title = body.title || "ბანერი";
    const subtitle = body.subtitle || null;
    const ctaText = body.ctaText || "ნახვა";
    const ctaLink = body.ctaLink || body.link || "/catalog";
    const link = body.link || body.ctaLink || "/catalog";
    const image = body.image || body.imageDesktop || "";
    const imageDesktop = body.imageDesktop || body.image || "";
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

      await recordAuditLog({
        userId: session?.userId,
        adminEmail: session?.email,
        adminName: session?.name,
        action: "BANNER_UPDATE",
        entity: "Banner",
        target: `${banner.title} (${banner.id})`,
        details: `განახლდა ბანერი: პოზიცია ${position}, პრიორიტეტი ${priority}, სტატუსი: ${isActive ? "აქტიური" : "არააქტიური"}`,
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

      await recordAuditLog({
        userId: session?.userId,
        adminEmail: session?.email,
        adminName: session?.name,
        action: "BANNER_CREATE",
        entity: "Banner",
        target: `${banner.title} (${banner.id})`,
        details: `შეიქმნა ახალი ბანერი: პოზიცია ${position}`,
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
      message: "ბანერი წარმატებით შეინახა",
    });
  } catch (error: any) {
    console.error("POST /api/banners error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "ბანერის შენახვა ვერ მოხერხდა" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return POST(request);
}

export async function DELETE(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ბანერის ID აუცილებელია" },
        { status: 400 }
      );
    }

    const existing = await prisma.banner.findUnique({ where: { id } });

    await prisma.banner.delete({
      where: { id },
    });

    if (existing) {
      await recordAuditLog({
        userId: session?.userId,
        adminEmail: session?.email,
        adminName: session?.name,
        action: "BANNER_DELETE",
        entity: "Banner",
        target: `${existing.title} (${existing.id})`,
        details: "ბანერი წაიშალა მონაცემთა ბაზიდან",
      });
    }

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

