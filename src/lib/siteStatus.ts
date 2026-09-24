import { unstable_noStore as noStore } from "next/cache";
import { getPrismaClient } from "@/lib/prisma";
import {
  DEFAULT_SITE_STATUS,
  SITE_STATUS_KEYS,
  parseSiteStatus,
  type SiteStatus,
} from "@/lib/siteStatusShared";

export * from "@/lib/siteStatusShared";

const CACHE_MS = 2000;
let cached: { at: number; value: SiteStatus } | null = null;

export function invalidateSiteStatusCache() {
  cached = null;
}

export async function getSiteStatus(): Promise<SiteStatus> {
  noStore();
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.value;
  }

  try {
    const prisma = getPrismaClient();
    const rows = await prisma.systemSetting.findMany({
      where: { key: { in: [...SITE_STATUS_KEYS] } },
    });
    const map: Record<string, string> = {};
    for (const row of rows) map[row.key] = row.value;
    const value = parseSiteStatus(map);
    cached = { at: Date.now(), value };
    return value;
  } catch (error) {
    console.error("[siteStatus] failed to load", error);
    return DEFAULT_SITE_STATUS;
  }
}
