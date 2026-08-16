import { prisma } from "@/lib/prisma";
import { headers, cookies } from "next/headers";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";

export interface AuditLogOptions {
  action: string;
  entity?: string;
  target?: string;
  details?: string;
  adminEmail?: string;
  adminName?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function recordAuditLog(options: AuditLogOptions) {
  try {
    let userId = options.userId;
    let adminEmail = options.adminEmail;
    let adminName = options.adminName;
    let ipAddress = options.ipAddress;
    let userAgent = options.userAgent;

    // Extract from headers/cookies if available
    try {
      const headerList = await headers();
      if (!ipAddress) {
        ipAddress = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || headerList.get("x-real-ip") || undefined;
      }
      if (!userAgent) {
        userAgent = headerList.get("user-agent") || undefined;
      }
      if (!userId && headerList.get("x-user-id")) {
        userId = headerList.get("x-user-id") || undefined;
      }
      if (!adminEmail && headerList.get("x-user-email")) {
        adminEmail = headerList.get("x-user-email") || undefined;
      }
      if (!adminName && headerList.get("x-user-name")) {
        try {
          adminName = decodeURIComponent(headerList.get("x-user-name") || "");
        } catch {}
      }
    } catch {}

    if (!userId || !adminEmail) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
        if (token) {
          const payload = await verifyToken(token);
          if (payload) {
            userId = userId || payload.userId;
            adminEmail = adminEmail || payload.email;
            adminName = adminName || payload.name;
          }
        }
      } catch {}
    }

    return await prisma.auditLog.create({
      data: {
        userId: userId || null,
        adminEmail: adminEmail || "admin@spilo.ge",
        adminName: adminName || "Administrator",
        action: options.action,
        entity: options.entity || null,
        target: options.target || null,
        details: options.details || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });
  } catch (error) {
    console.error("recordAuditLog error:", error);
    return null;
  }
}
