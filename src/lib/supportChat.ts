export const SUPPORT_TIME_ZONE = "Asia/Tbilisi";
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_NAME_LENGTH = 80;
export const MAX_PHONE_LENGTH = 30;
export const MAX_EMAIL_LENGTH = 120;

const ADMIN_ONLINE_WINDOW_MS = 30_000;
const TYPING_TTL_MS = 10_000;
const TRUSTED_ATTACHMENT_HOSTS = new Set(["res.cloudinary.com"]);
const ATTACHMENT_TYPES = new Set(["image", "video", "file"]);

export type SupportAttachment = {
  type: "image" | "video" | "file";
  url: string;
  name: string;
  size?: string;
};

export function formatChatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("ka-GE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: SUPPORT_TIME_ZONE,
  });
}

export function mapSupportMessage(m: {
  id: string;
  senderRole: string;
  text: string;
  createdAt: Date;
  senderName: string | null;
  isRead: boolean;
  attachment: unknown;
}) {
  return {
    id: m.id,
    sender: m.senderRole as "user" | "admin" | "bot",
    text: m.text,
    time: formatChatTime(m.createdAt),
    adminName: m.senderName || undefined,
    read: m.isRead,
    attachment: m.attachment as SupportAttachment | null,
    createdAt: m.createdAt,
  };
}

export function clampText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isSafeAttachmentUrl(url: string): boolean {
  if (url.startsWith("/uploads/") && !url.includes("..")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && TRUSTED_ATTACHMENT_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

/** Returns a clean attachment, null when none was sent, or "invalid" when it must be rejected. */
export function sanitizeAttachment(raw: unknown): SupportAttachment | null | "invalid" {
  if (raw === undefined || raw === null) return null;
  if (typeof raw !== "object") return "invalid";
  const value = raw as Record<string, unknown>;
  const type = String(value.type || "");
  const url = String(value.url || "").trim();
  if (!ATTACHMENT_TYPES.has(type) || !url || url.length > 500 || !isSafeAttachmentUrl(url)) {
    return "invalid";
  }
  return {
    type: type as SupportAttachment["type"],
    url,
    name: clampText(value.name, 200) || "file",
    size: clampText(value.size, 20) || undefined,
  };
}

/** Typing flags are only trusted while fresh, so a closed tab can't leave "typing..." stuck forever. */
export function isTypingFresh(flag: boolean | null | undefined, updatedAt: Date): boolean {
  return Boolean(flag) && Date.now() - new Date(updatedAt).getTime() < TYPING_TTL_MS;
}

const presence = globalThis as unknown as { __supportAdminLastSeen?: number };

export function markSupportAdminSeen(): void {
  presence.__supportAdminLastSeen = Date.now();
}

export function isSupportAdminOnline(): boolean {
  const lastSeen = presence.__supportAdminLastSeen || 0;
  return Date.now() - lastSeen < ADMIN_ONLINE_WINDOW_MS;
}
