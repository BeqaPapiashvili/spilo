import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const prisma = getPrismaClient();
    if (prisma.storefrontSection) {
      const sections = await prisma.storefrontSection.findMany({
        where: { isEnabled: true },
        orderBy: { sortOrder: "asc" },
      });

      return NextResponse.json({
        success: true,
        data: sections || [],
      });
    }

    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error: any) {
    console.error("GET /api/storefront/sections error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch storefront sections", data: [] },
      { status: 500 }
    );
  }
}
