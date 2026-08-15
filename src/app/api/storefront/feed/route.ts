import { NextResponse } from "next/server";
import { resolveStorefrontFeed } from "@/lib/storefrontFeed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const feed = await resolveStorefrontFeed();
    return NextResponse.json({
      success: true,
      count: feed.length,
      data: feed,
    });
  } catch (error: any) {
    console.error("GET /api/storefront/feed error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to resolve storefront feed", data: [] },
      { status: 500 }
    );
  }
}
