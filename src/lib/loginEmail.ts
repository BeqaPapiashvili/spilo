export function loginEmailCandidates(raw: string): string[] {
  const clean = (raw || "").trim().toLowerCase();
  if (!clean) return [];
  if (clean.includes("@")) return [clean];

  const domains: string[] = [];
  try {
    const site = process.env.NEXT_PUBLIC_SITE_URL || "";
    if (site) {
      domains.push(new URL(site).hostname.replace(/^www\./, ""));
    }
  } catch {
    // ignore invalid SITE_URL
  }
  domains.push("brizz.ge", "spilo.ge");
  return [...new Set(domains.filter(Boolean).map((domain) => `${clean}@${domain}`))];
}
