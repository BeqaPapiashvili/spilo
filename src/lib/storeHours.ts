const HOURS_RE = /(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/;

function minutes(hour: number, minute: number) {
  return hour * 60 + minute;
}

export function getStoreOpenState(workingHours?: string | null): {
  known: boolean;
  isOpen: boolean;
  label: string;
} {
  const raw = (workingHours || "").trim();
  if (!raw) {
    return { known: false, isOpen: false, label: "" };
  }

  const match = raw.match(HOURS_RE);
  if (!match) {
    return { known: false, isOpen: false, label: raw };
  }

  const start = minutes(Number(match[1]), Number(match[2]));
  const end = minutes(Number(match[3]), Number(match[4]));
  const now = new Date();
  const current = minutes(now.getHours(), now.getMinutes());
  const isOpen = start <= end ? current >= start && current < end : current >= start || current < end;

  return { known: true, isOpen, label: raw };
}

export function storeMapEmbedSrc(mapUrl?: string | null, address?: string | null, city?: string | null): string | null {
  const direct = (mapUrl || "").trim();
  if (direct.includes("/embed") || direct.includes("output=embed")) {
    return direct;
  }

  const query = direct || [city, address].filter(Boolean).join(", ");
  if (!query) return null;
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}
