import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { createdAt: "asc" },
    });

    const parsedCategories = categories.map((cat: any) => {
      let children = cat.children || [];
      if (cat.childrenJson) {
        try {
          children = JSON.parse(cat.childrenJson);
        } catch {
          // fallback
        }
      }
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        children,
      };
    });

    return NextResponse.json({
      success: true,
      count: parsedCategories.length,
      data: parsedCategories,
    });
  } catch (error: any) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, icon, children } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "კატეგორიის დასახელება აუცილებელია" },
        { status: 400 }
      );
    }

    const cleanSlug = slug || name.toLowerCase().replace(/\s+/g, "-");

    const category = await prisma.category.create({
      data: {
        name,
        slug: cleanSlug,
        icon: icon || "Sparkles",
        childrenJson: children ? JSON.stringify(children) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: "კატეგორია წარმატებით შეიქმნა MySQL ბაზაში",
    });
  } catch (error: any) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "კატეგორიის შექმნა ვერ მოხერხდა" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, slug, icon, children } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "კატეგორიის ID აუცილებელია" },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(icon && { icon }),
        ...(children !== undefined && { childrenJson: JSON.stringify(children) }),
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: "კატეგორია განახლდა MySQL ბაზაში",
    });
  } catch (error: any) {
    console.error("PUT /api/categories error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "კატეგორიის განახლება ვერ მოხერხდა" },
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
        { success: false, error: "კატეგორიის ID აუცილებელია" },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "კატეგორია წაიშალა MySQL ბაზიდან",
    });
  } catch (error: any) {
    console.error("DELETE /api/categories error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "კატეგორიის წაშლა ვერ მოხერხდა" },
      { status: 500 }
    );
  }
}
