import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      count: brands.length,
      data: brands,
    });
  } catch (error: any) {
    console.error("GET /api/brands error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, logo } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "ბრენდის დასახელება აუცილებელია" },
        { status: 400 }
      );
    }

    const cleanSlug = slug || name.toLowerCase().replace(/\s+/g, "-");

    const brand = await prisma.brand.create({
      data: {
        name,
        slug: cleanSlug,
        logo: logo || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: brand,
      message: "ბრენდი შეიქმნა MySQL ბაზაში",
    });
  } catch (error: any) {
    console.error("POST /api/brands error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "ბრენდის შექმნა ვერ მოხერხდა" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, slug, logo } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ბრენდის ID აუცილებელია" },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(logo !== undefined && { logo }),
      },
    });

    return NextResponse.json({
      success: true,
      data: brand,
      message: "ბრენდი განახლდა MySQL ბაზაში",
    });
  } catch (error: any) {
    console.error("PUT /api/brands error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "ბრენდის განახლება ვერ მოხერხდა" },
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
        { success: false, error: "ბრენდის ID აუცილებელია" },
        { status: 400 }
      );
    }

    await prisma.brand.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "ბრენდი წაიშალა MySQL ბაზიდან",
    });
  } catch (error: any) {
    console.error("DELETE /api/brands error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "ბრენდის წაშლა ვერ მოხერხდა" },
      { status: 500 }
    );
  }
}
