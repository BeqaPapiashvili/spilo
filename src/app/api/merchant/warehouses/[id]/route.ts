import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant";
import { recordAuditLog } from "@/lib/audit";
import { readWarehouseInput } from "@/lib/warehouseInput";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, storeId, errorResponse } = await requireMerchantSession(request);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const existing = await prisma.warehouse.findFirst({ where: { id, storeId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "საწყობი ვერ მოიძებნა" }, { status: 404 });
    }

    const input = readWarehouseInput(await request.json());
    if ("error" in input) {
      return NextResponse.json({ success: false, error: input.error }, { status: 400 });
    }

    const warehouse = await prisma.$transaction(async (tx) => {
      let isDefault = input.isDefault;
      if (!isDefault && existing.isDefault) {
        const other = await tx.warehouse.findFirst({
          where: { storeId, id: { not: existing.id } },
          orderBy: { createdAt: "asc" },
        });
        if (!other) isDefault = true;
        else await tx.warehouse.update({ where: { id: other.id }, data: { isDefault: true } });
      }
      if (isDefault) {
        await tx.warehouse.updateMany({
          where: { storeId, id: { not: existing.id } },
          data: { isDefault: false },
        });
      }
      return tx.warehouse.update({
        where: { id: existing.id },
        data: {
          name: input.name,
          address: input.address,
          city: input.city,
          phone: input.phone,
          latitude: input.latitude,
          longitude: input.longitude,
          isDefault,
        },
      });
    });

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "MERCHANT_WAREHOUSE_UPDATE",
      entity: "Warehouse",
      target: warehouse.name,
      details: "პარტნიორმა განაახლა საწყობი",
    });

    return NextResponse.json({ success: true, data: warehouse });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "საწყობი ვერ განახლდა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, storeId, errorResponse } = await requireMerchantSession(request);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const existing = await prisma.warehouse.findFirst({ where: { id, storeId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "საწყობი ვერ მოიძებნა" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      if (existing.isDefault) {
        const other = await tx.warehouse.findFirst({
          where: { storeId, id: { not: existing.id } },
          orderBy: { createdAt: "asc" },
        });
        if (other) await tx.warehouse.update({ where: { id: other.id }, data: { isDefault: true } });
      }
      await tx.warehouse.delete({ where: { id: existing.id } });
    });

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "MERCHANT_WAREHOUSE_DELETE",
      entity: "Warehouse",
      target: existing.name,
      details: "პარტნიორმა წაშალა საწყობი",
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "საწყობი ვერ წაიშალა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
