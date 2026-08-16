import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      const pages = await prisma.cMSPage.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          lastUpdated: true,
        },
        orderBy: { title: "asc" },
      });
      return NextResponse.json({ success: true, count: pages.length, data: pages });
    }

    const page = await prisma.cMSPage.findUnique({
      where: { slug },
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: "გვერდი ვერ მოიძებნა" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: page });
  } catch (error: any) {
    console.error("GET /api/cms error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch CMS page" },
      { status: 500 }
    );
  }
}
