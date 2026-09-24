import { prisma } from "@/lib/prisma";

export type DeliverySettings = {
  freeShippingThreshold: number;
  standardDeliveryFee: number;
  expressDeliveryFee: number;
  regionsDeliveryFee: number;
};

const DEFAULTS: DeliverySettings = {
  freeShippingThreshold: 100,
  standardDeliveryFee: 5,
  expressDeliveryFee: 15,
  regionsDeliveryFee: 10,
};

function num(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export async function getDeliverySettings(): Promise<DeliverySettings> {
  try {
    const rows = await prisma.systemSetting.findMany({
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
    });
    const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    return {
      freeShippingThreshold: num(map.freeShippingThreshold, DEFAULTS.freeShippingThreshold),
      standardDeliveryFee: num(map.standardDeliveryFee, DEFAULTS.standardDeliveryFee),
      expressDeliveryFee: num(map.expressDeliveryFee, DEFAULTS.expressDeliveryFee),
      regionsDeliveryFee: num(map.regionsDeliveryFee, DEFAULTS.regionsDeliveryFee),
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function computeShippingFee(input: {
  deliveryMethod?: string | null;
  city?: string | null;
  subtotal: number;
  settings: DeliverySettings;
}): number {
  if (String(input.deliveryMethod || "delivery") === "pickup") return 0;
  const subtotal = Number(input.subtotal) || 0;
  if (subtotal >= input.settings.freeShippingThreshold) return 0;
  const city = String(input.city || "").trim().toLowerCase();
  const isTbilisi = city === "თბილისი" || city === "tbilisi";
  const fee = isTbilisi ? input.settings.standardDeliveryFee : input.settings.regionsDeliveryFee;
  return Number(Math.max(0, fee).toFixed(2));
}
