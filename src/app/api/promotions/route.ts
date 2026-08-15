import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
    });

    const mapped = promotions.map((p) => ({
      id: p.id,
      name: p.name || p.title,
      title: p.title || p.name || "",
      slug: p.slug || (p.title ? p.title.toLowerCase().replace(/\s+/g, "-") : ""),
      description: p.description || p.subtitle || "",
      subtitle: p.subtitle || p.description || "",
      discountType: (p.discountType as "percentage" | "fixed") || "percentage",
      discountValue: p.discountValue !== null && p.discountValue !== undefined ? p.discountValue : (p.discountPercentage || 0),
      discountPercentage: p.discountPercentage || (p.discountValue ? Math.round(p.discountValue) : 0),
      startDate: p.startDate || "2026-08-01",
      endDate: p.endDate || "2026-09-01",
      status: (p.status as "ACTIVE" | "SCHEDULED" | "EXPIRED") || "ACTIVE",
      image: p.image || p.bannerImage || "/placeholder.png",
      bannerImage: p.bannerImage || p.image || "/placeholder.png",
      link: p.link || null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      count: mapped.length,
      data: mapped,
    });
  } catch (error: any) {
    console.error("GET /api/promotions error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch promotions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = body.id;
    const title = body.title || body.name || "აქცია";
    const name = body.name || body.title || "აქცია";
    const slug = body.slug || name.toLowerCase().replace(/\s+/g, "-");
    const description = body.description || body.subtitle || null;
    const subtitle = body.subtitle || body.description || null;
    const image = body.image || body.bannerImage || "/placeholder.png";
    const bannerImage = body.bannerImage || body.image || "/placeholder.png";
    const link = body.link || null;
    const discountType = body.discountType || "percentage";
    const discountVal = body.discountValue !== undefined ? Number(body.discountValue) : (body.discountPercentage ? Number(body.discountPercentage) : 0);
    const discountPct = body.discountPercentage !== undefined ? Number(body.discountPercentage) : (body.discountValue ? Number(body.discountValue) : 0);
    const startDate = body.startDate || new Date().toISOString().split("T")[0];
    const endDate = body.endDate || "2026-12-31";
    const status = body.status || "ACTIVE";

    let promotion;

    if (id) {
      promotion = await prisma.promotion.upsert({
        where: { id },
        update: {
          title,
          name,
          slug,
          description,
          subtitle,
          image,
          bannerImage,
          link,
          discountType,
          discountValue: discountVal,
          discountPercentage: discountPct,
          startDate,
          endDate,
          status,
        },
        create: {
          id,
          title,
          name,
          slug,
          description,
          subtitle,
          image,
          bannerImage,
          link,
          discountType,
          discountValue: discountVal,
          discountPercentage: discountPct,
          startDate,
          endDate,
          status,
        },
      });
    } else {
      promotion = await prisma.promotion.create({
        data: {
          title,
          name,
          slug,
          description,
          subtitle,
          image,
          bannerImage,
          link,
          discountType,
          discountValue: discountVal,
          discountPercentage: discountPct,
          startDate,
          endDate,
          status,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: promotion.id,
        name: promotion.name || promotion.title,
        title: promotion.title,
        slug: promotion.slug,
        description: promotion.description,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        status: promotion.status,
        bannerImage: promotion.bannerImage || promotion.image,
      },
      message: "აქცია შეიქმნა / განახლდა MySQL ბაზაში",
    });
  } catch (error: any) {
    console.error("POST /api/promotions error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "აქციის შენახვა ვერ მოხერხდა" },
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
        { success: false, error: "აქციის ID აუცილებელია" },
        { status: 400 }
      );
    }

    await prisma.promotion.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "აქცია წაიშალა MySQL ბაზიდან",
    });
  } catch (error: any) {
    console.error("DELETE /api/promotions error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "აქციის წაშლა ვერ მოხერხდა" },
      { status: 500 }
    );
  }
}
