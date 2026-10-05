import { NextResponse } from "next/server";
import { geocodeQuery } from "@/lib/mapGeocode";
import { requireMerchantSession } from "@/lib/merchant";
import { enforceRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { session, errorResponse } = await requireMerchantSession(request);
  if (errorResponse) return errorResponse;

  const rate = await enforceRateLimit(request, {
    namespace: "merchant_geocode",
    identifier: session?.userId,
    limit: 120,
    windowSeconds: 60,
  });
  if (!rate.success && rate.response) return rate.response;

  const query = (new URL(request.url).searchParams.get("q") || "").trim().slice(0, 200);
  if (query.length < 2) return NextResponse.json({ success: true, result: null });

  const result = await geocodeQuery(query);
  return NextResponse.json({ success: true, result });
}
