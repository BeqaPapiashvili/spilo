export type WarehouseInput = {
  name: string;
  address: string;
  city: string;
  phone: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
};

function coord(value: unknown, max: number) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number) || Math.abs(number) > max) return null;
  return Math.round(number * 1e6) / 1e6;
}

export function readWarehouseInput(body: unknown): WarehouseInput | { error: string } {
  const source = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const name = String(source.name || "").trim().slice(0, 80);
  const address = String(source.address || "").trim().slice(0, 400);
  const city = String(source.city || "").trim().slice(0, 80);
  const phone = String(source.phone || "").trim().slice(0, 30);
  const latitude = coord(source.latitude, 90);
  const longitude = coord(source.longitude, 180);
  const isDefault = Boolean(source.isDefault);
  if (!name || !address || !city || !phone) {
    return { error: "შეავსე სახელი, მისამართი, ქალაქი და ტელეფონი" };
  }
  if (phone.replace(/\D/g, "").length < 6) {
    return { error: "ტელეფონის ნომერი არასწორია" };
  }
  if (latitude === null || longitude === null) {
    return { error: "რუკაზე მონიშნე საწყობის ზუსტი წერტილი" };
  }
  return { name, address, city, phone, latitude, longitude, isDefault };
}
