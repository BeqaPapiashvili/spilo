export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://spilo.ge";
  return raw.replace(/\/$/, "");
}
