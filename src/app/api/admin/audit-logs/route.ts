import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 100;
    const action = searchParams.get("action");

    const where: any = {};
    if (action && action !== "ALL") {
      where.action = action;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const mapped = logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      adminEmail: log.adminEmail,
      adminName: log.adminName || log.adminEmail.split("@")[0],
      userEmail: log.adminEmail,
      userName: log.adminName || log.adminEmail.split("@")[0],
      action: log.action,
      entity: log.entity,
      target: log.target,
      details: log.details,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      timestamp: log.createdAt.toISOString(),
      createdAt: log.createdAt,
    }));

    return NextResponse.json({
      success: true,
      count: mapped.length,
      data: mapped,
    });
  } catch (error: any) {
    console.error("GET /api/admin/audit-logs error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, entity, target, details, adminEmail, adminName, userId } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action is required" },
        { status: 400 }
      );
    }

    const created = await recordAuditLog({
      action,
      entity,
      target,
      details,
      adminEmail,
      adminName,
      userId,
    });

    return NextResponse.json({
      success: true,
      data: created,
    });
  } catch (error: any) {
    console.error("POST /api/admin/audit-logs error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record audit log" },
      { status: 500 }
    );
  }
}
