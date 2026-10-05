import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant";
import { recordAuditLog } from "@/lib/audit";
import { readWarehouseInput } from "@/lib/warehouseInput";

export const dynamic = "force-dynamic";

const MAX_WAREHOUSES = 30;

export async function GET(request: Request) {
  try {
    const { storeId, errorResponse } = await requireMerchantSession(request);
    if (errorResponse) return errorResponse;

    const warehouses = await prisma.warehouse.findMany({
      where: { storeId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ success: true, data: warehouses });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "საწყობები ვერ ჩაიტვირთა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { session, storeId, errorResponse } = await requireMerchantSession(request);
    if (errorResponse) return errorResponse;

    const input = readWarehouseInput(await request.json());
    if ("error" in input) {
      return NextResponse.json({ success: false, error: input.error }, { status: 400 });
    }

    const warehouse = await prisma.$transaction(async (tx) => {
      const count = await tx.warehouse.count({ where: { storeId } });
      if (count >= MAX_WAREHOUSES) {
        throw new Error("საწყობების ლიმიტი შევსებულია");
      }
      const makeDefault = input.isDefault || count === 0;
      if (makeDefault) {
        await tx.warehouse.updateMany({ where: { storeId }, data: { isDefault: false } });
      }
      return tx.warehouse.create({
        data: {
          storeId,
          name: input.name,
          address: input.address,
          city: input.city,
          phone: input.phone,
          latitude: input.latitude,
          longitude: input.longitude,
          isDefault: makeDefault,
        },
      });
    });

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "MERCHANT_WAREHOUSE_CREATE",
      entity: "Warehouse",
      target: warehouse.name,
      details: "პარტნიორმა დაამატა საწყობი",
    });

    return NextResponse.json({ success: true, data: warehouse });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "საწყობი ვერ დაემატა";
    const status = message === "საწყობების ლიმიტი შევსებულია" ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
