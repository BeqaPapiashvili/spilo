import { NextResponse } from "next/server";
import { recordAuditLog } from "@/lib/audit";
import { requireAdminSession } from "@/lib/jwt";
import { getPrismaClient } from "@/lib/prisma";
import {
  getSiteStatus,
  invalidateSiteStatusCache,
  sanitizeSiteStatusInput,
} from "@/lib/siteStatus";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { errorResponse } = await requireAdminSession(request);
  if (errorResponse) return errorResponse;

  const status = await getSiteStatus();
  return NextResponse.json({ success: true, data: status });
}

export async function POST(request: Request) {
  const { session, errorResponse } = await requireAdminSession(request);
  if (errorResponse) return errorResponse;

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "არასწორი მოთხოვნა" }, { status: 400 });
  }

  const next = sanitizeSiteStatusInput(body);
  const prisma = getPrismaClient();
  const pairs: Array<[string, string]> = [
    ["siteMode", next.mode],
    ["comingSoonEyebrow", next.comingSoonEyebrow],
    ["comingSoonTitle", next.comingSoonTitle],
    ["comingSoonSubtitle", next.comingSoonSubtitle],
    ["comingSoonDate", next.comingSoonDate],
    ["comingSoonFooter", next.comingSoonFooter],
    ["maintenanceTitle", next.maintenanceTitle],
    ["maintenanceMessage", next.maintenanceMessage],
    ["maintenanceContact", next.maintenanceContact],
  ];

  for (const [key, value] of pairs) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  invalidateSiteStatusCache();

  await recordAuditLog({
    userId: session?.userId,
    adminEmail: session?.email,
    adminName: session?.name,
    action: "SITE_STATUS_UPDATE",
    entity: "SystemSetting",
    target: next.mode,
    details: `საიტის რეჟიმი: ${next.mode}`,
  });

  return NextResponse.json({ success: true, data: next });
}
