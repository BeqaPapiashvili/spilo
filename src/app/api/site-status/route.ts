import { NextResponse } from "next/server";
import { getSiteStatus } from "@/lib/siteStatus";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getSiteStatus();
  return NextResponse.json(
    { success: true, data: status },
    { headers: { "Cache-Control": "no-store" } }
  );
}
