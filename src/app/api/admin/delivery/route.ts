import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrismaClient();
    const [zones, settings] = await Promise.all([
      prisma.deliveryZone.findMany({
        orderBy: { title: "asc" },
      }),
      prisma.systemSetting.findMany({
        where: {
          key: {
            in: [
              "freeShippingThreshold",
              "standardDeliveryFee",
              "expressDeliveryFee",
              "regionsDeliveryFee",
            ],
          },
        },
      }),
    ]);

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      data: {
        zones,
        freeShippingThreshold: Number(settingsMap.freeShippingThreshold || 100),
        standardDeliveryFee: Number(settingsMap.standardDeliveryFee || 5),
        expressDeliveryFee: Number(settingsMap.expressDeliveryFee || 15),
        regionsDeliveryFee: Number(settingsMap.regionsDeliveryFee || 10),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrismaClient();
    const body = await request.json();

    // Check if saving flat fees
    if (body.freeShippingThreshold !== undefined || body.standardDeliveryFee !== undefined) {
      const feeKeys = ["freeShippingThreshold", "standardDeliveryFee", "expressDeliveryFee", "regionsDeliveryFee"];
      for (const k of feeKeys) {
        if (body[k] !== undefined) {
          await prisma.systemSetting.upsert({
            where: { key: k },
            update: { value: String(body[k]) },
            create: { key: k, value: String(body[k]) },
          });
        }
      }

      // Also upsert default DeliveryZones if provided or to keep synced
      if (body.standardDeliveryFee !== undefined) {
        await prisma.deliveryZone.upsert({
          where: { id: "zone-tbilisi" },
          update: { price: Number(body.standardDeliveryFee), estimatedDays: "1-2 სამუშაო დღე" },
          create: { id: "zone-tbilisi", title: "თბილისი - სტანდარტული", price: Number(body.standardDeliveryFee), estimatedDays: "1-2 სამუშაო დღე" },
        }).catch(() => {});
      }

      return NextResponse.json({ success: true, message: "მიწოდების ტარიფები შენახულია" });
    }

    const { id, title, price, estimatedDays, isActive = true } = body;

    if (!title || price === undefined || !estimatedDays) {
      return NextResponse.json({ success: false, message: "Title, price and estimatedDays required" }, { status: 400 });
    }

    if (id) {
      const updated = await prisma.deliveryZone.upsert({
        where: { id },
        update: { title, price: Number(price), estimatedDays, isActive: Boolean(isActive) },
        create: { id, title, price: Number(price), estimatedDays, isActive: Boolean(isActive) },
      });
      return NextResponse.json({ success: true, data: updated });
    } else {
      const created = await prisma.deliveryZone.create({
        data: { title, price: Number(price), estimatedDays, isActive: Boolean(isActive) },
      });
      return NextResponse.json({ success: true, data: created });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const prisma = getPrismaClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    await prisma.deliveryZone.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "მიწოდების ზონა წაიშალა" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
