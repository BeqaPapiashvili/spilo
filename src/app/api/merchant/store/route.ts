import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant";

export const dynamic = "force-dynamic";

function emptyToNull(value: unknown): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

export async function GET(request: Request) {
  try {
    const { storeId, errorResponse } = await requireMerchantSession(request);
    if (errorResponse) return errorResponse;
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    return NextResponse.json({ success: true, data: store });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "მაღაზია ვერ ჩაიტვირთა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { storeId, errorResponse } = await requireMerchantSession(request);
    if (errorResponse) return errorResponse;
    const body = await request.json();

    const store = await prisma.store.update({
      where: { id: storeId },
      data: {
        description: body.description !== undefined ? emptyToNull(body.description) : undefined,
        phone: body.phone !== undefined ? emptyToNull(body.phone) : undefined,
        address: body.address !== undefined ? emptyToNull(body.address) : undefined,
        city: body.city !== undefined ? emptyToNull(body.city) : undefined,
        email: body.email !== undefined ? emptyToNull(body.email) : undefined,
        workingHours: body.workingHours !== undefined ? emptyToNull(body.workingHours) : undefined,
        mapUrl: body.mapUrl !== undefined ? emptyToNull(body.mapUrl) : undefined,
        pickupEnabled: body.pickupEnabled !== undefined ? Boolean(body.pickupEnabled) : undefined,
        pickupNote: body.pickupNote !== undefined ? emptyToNull(body.pickupNote) : undefined,
        facebookUrl: body.facebookUrl !== undefined ? emptyToNull(body.facebookUrl) : undefined,
        instagramUrl: body.instagramUrl !== undefined ? emptyToNull(body.instagramUrl) : undefined,
        websiteUrl: body.websiteUrl !== undefined ? emptyToNull(body.websiteUrl) : undefined,
      },
    });

    revalidatePath("/stores");
    revalidatePath(`/stores/${store.slug}`);
    return NextResponse.json({ success: true, data: store });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "შენახვა ვერ მოხერხდა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
