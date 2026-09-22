import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/jwt";
import { recordAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const storeId = String(body.storeId || "").trim();
    const action = String(body.action || "assign");
    const productIds = Array.isArray(body.productIds)
      ? body.productIds.map((id: unknown) => String(id || "").trim()).filter(Boolean)
      : [];

    if (!storeId || productIds.length === 0) {
      return NextResponse.json({ success: false, error: "მაღაზია და პროდუქტები აუცილებელია" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { id: true, slug: true, name: true } });
    if (!store) {
      return NextResponse.json({ success: false, error: "მაღაზია ვერ მოიძებნა" }, { status: 404 });
    }

    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { storeId: action === "unassign" ? null : store.id },
    });

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: action === "unassign" ? "STORE_PRODUCTS_UNASSIGN" : "STORE_PRODUCTS_ASSIGN",
      entity: "Store",
      target: `${store.name} (${store.slug})`,
      details: `${productIds.length} products`,
    });

    revalidatePath("/stores");
    revalidatePath(`/stores/${store.slug}`);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "მინიჭება ვერ მოხერხდა";
    console.error("POST /api/admin/stores/assign error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
