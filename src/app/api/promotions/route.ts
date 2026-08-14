import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: promotions.length,
      data: promotions,
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
    const { title, subtitle, image, link, discountPercentage } = body;

    if (!title || !image) {
      return NextResponse.json(
        { success: false, error: "სათაური და სურათი აუცილებელია" },
        { status: 400 }
      );
    }

    const promotion = await prisma.promotion.create({
      data: {
        title,
        subtitle: subtitle || null,
        image,
        link: link || null,
        discountPercentage: discountPercentage ? Number(discountPercentage) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: promotion,
      message: "აქცია შეიქმნა MySQL ბაზაში",
    });
  } catch (error: any) {
    console.error("POST /api/promotions error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "აქციის შექმნა ვერ მოხერხდა" },
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
