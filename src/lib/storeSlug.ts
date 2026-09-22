import { geoToLat } from "@/lib/transliteration";

export function slugifyStoreName(name: string): string {
  const latin = geoToLat(name.trim().toLowerCase());
  const slug = latin
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "store";
}

export async function uniqueStoreSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = slugifyStoreName(base);
  if (!(await exists(slug))) return slug;
  for (let i = 2; i < 50; i += 1) {
    const candidate = `${slug}-${i}`;
    if (!(await exists(candidate))) return candidate;
  }
  return `${slug}-${Date.now().toString(36)}`;
}
