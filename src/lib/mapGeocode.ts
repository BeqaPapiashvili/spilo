export type GeocodeResult = {
  lat: number;
  lng: number;
  address: string;
  shortAddress: string;
  city: string;
  precise: boolean;
};

const STR = `"((?:[^"\\\\]|\\\\.)*)"`;
const NUM = `(-?\\d+(?:\\.\\d+)?)`;
const PLACE_RE = new RegExp(
  `\\["0x[0-9a-f]+:0x[0-9a-f]+",${STR},\\[${NUM},${NUM}\\](?:,"[^"]*")?\\],${STR}(?:,\\[${STR}\\])?`
);
const ENTITY_RE = /"\/[gm]\/[^"]+",null,\[(\d+),(\d+)\]/;

function unescapeJson(value: string): string {
  try {
    return JSON.parse(`"${value}"`);
  } catch {
    return value;
  }
}

function parseEmbed(html: string, query: string): GeocodeResult | null {
  const place = html.match(PLACE_RE);
  if (place) {
    const address = unescapeJson(place[1]);
    let city = unescapeJson(place[5] || "");
    let shortAddress = unescapeJson(place[4] || "") || address;
    if (!city) {
      const parts = address.replace(/^\d{4},\s*/, "").split(",").map((part) => part.trim()).filter(Boolean);
      if (parts.length > 1) {
        city = parts.pop() || "";
        shortAddress = parts.join(", ");
      }
    }
    return { lat: Number(place[2]), lng: Number(place[3]), address, shortAddress, city, precise: true };
  }

  const entity = html.match(ENTITY_RE);
  if (entity) {
    const parts = query
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part && !/^(საქართველო|georgia)$/i.test(part));
    const city = parts.length > 1 ? parts.pop() || "" : "";
    const shortAddress = parts.join(", ");
    return {
      lat: Number(entity[1]) / 1e7,
      lng: Number(entity[2]) / 1e7,
      address: [shortAddress, city].filter(Boolean).join(", "),
      shortAddress,
      city,
      precise: false,
    };
  }
  return null;
}

export async function geocodeQuery(query: string): Promise<GeocodeResult | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(
      `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed&hl=ka&gl=ge`,
      {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Accept-Language": "ka,en;q=0.8" },
        signal: controller.signal,
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    return parseEmbed(await res.text(), query);
  } catch (error) {
    console.error("geocodeQuery error:", error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
