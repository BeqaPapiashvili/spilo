export type SiteMode = "online" | "coming_soon" | "maintenance";

export type SiteStatus = {
  mode: SiteMode;
  comingSoonEyebrow: string;
  comingSoonTitle: string;
  comingSoonSubtitle: string;
  comingSoonDate: string;
  comingSoonFooter: string;
  maintenanceTitle: string;
  maintenanceMessage: string;
  maintenanceContact: string;
};

export const SITE_STATUS_KEYS = [
  "siteMode",
  "comingSoonEyebrow",
  "comingSoonTitle",
  "comingSoonSubtitle",
  "comingSoonDate",
  "comingSoonFooter",
  "maintenanceTitle",
  "maintenanceMessage",
  "maintenanceContact",
] as const;

export const DEFAULT_SITE_STATUS: SiteStatus = {
  mode: "online",
  comingSoonEyebrow: "Coming Soon",
  comingSoonTitle: "მალე ვიხსნებით",
  comingSoonSubtitle:
    "ვამზადებთ ახალ გამოცდილებას. დაბრუნდით მალე — Briz მალე იქნება თქვენთან.",
  comingSoonDate: "",
  comingSoonFooter: "გმადლობთ მოთმინებისთვის",
  maintenanceTitle: "ტექნიკური სამუშაოები",
  maintenanceMessage:
    "საიტზე ამჟამად ტარდება ტექნიკური სამუშაოები. გთხოვთ, სცადოთ მოგვიანებით.",
  maintenanceContact: "",
};

export function isSiteMode(value: unknown): value is SiteMode {
  return value === "online" || value === "coming_soon" || value === "maintenance";
}

export function parseSiteStatus(map: Record<string, string | undefined | null>): SiteStatus {
  const mode = isSiteMode(map.siteMode) ? map.siteMode : DEFAULT_SITE_STATUS.mode;
  return {
    mode,
    comingSoonEyebrow: map.comingSoonEyebrow || DEFAULT_SITE_STATUS.comingSoonEyebrow,
    comingSoonTitle: map.comingSoonTitle || DEFAULT_SITE_STATUS.comingSoonTitle,
    comingSoonSubtitle: map.comingSoonSubtitle || DEFAULT_SITE_STATUS.comingSoonSubtitle,
    comingSoonDate: map.comingSoonDate || "",
    comingSoonFooter: map.comingSoonFooter || DEFAULT_SITE_STATUS.comingSoonFooter,
    maintenanceTitle: map.maintenanceTitle || DEFAULT_SITE_STATUS.maintenanceTitle,
    maintenanceMessage: map.maintenanceMessage || DEFAULT_SITE_STATUS.maintenanceMessage,
    maintenanceContact: map.maintenanceContact || "",
  };
}

export function isStaffPath(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/merchant") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/merchant") ||
    pathname.startsWith("/api/payments") ||
    pathname.startsWith("/api/site-status")
  );
}

export function sanitizeSiteStatusInput(body: Record<string, unknown>): SiteStatus {
  return parseSiteStatus({
    siteMode: typeof body.mode === "string" ? body.mode : undefined,
    comingSoonEyebrow: typeof body.comingSoonEyebrow === "string" ? body.comingSoonEyebrow.trim() : undefined,
    comingSoonTitle: typeof body.comingSoonTitle === "string" ? body.comingSoonTitle.trim() : undefined,
    comingSoonSubtitle: typeof body.comingSoonSubtitle === "string" ? body.comingSoonSubtitle.trim() : undefined,
    comingSoonDate: typeof body.comingSoonDate === "string" ? body.comingSoonDate.trim() : undefined,
    comingSoonFooter: typeof body.comingSoonFooter === "string" ? body.comingSoonFooter.trim() : undefined,
    maintenanceTitle: typeof body.maintenanceTitle === "string" ? body.maintenanceTitle.trim() : undefined,
    maintenanceMessage: typeof body.maintenanceMessage === "string" ? body.maintenanceMessage.trim() : undefined,
    maintenanceContact: typeof body.maintenanceContact === "string" ? body.maintenanceContact.trim() : undefined,
  });
}
