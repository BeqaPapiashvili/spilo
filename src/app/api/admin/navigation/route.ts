import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const items = await prisma.navigationItem.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, count: items.length, data: items });
  } catch (error: any) {
    console.error("GET /api/admin/navigation error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

import { requireAdminSession } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();

    // Check for bulk reorder: { reorder: [{ id, order }] }
    if (body.reorder && Array.isArray(body.reorder)) {
      await prisma.$transaction(
        body.reorder.map((item: { id: string; order: number }) =>
          prisma.navigationItem.update({
            where: { id: item.id },
            data: { order: Number(item.order) },
          })
        )
      );

      await recordAuditLog({
        userId: session?.userId,
        adminEmail: session?.email,
        adminName: session?.name,
        action: "NAVIGATION_REORDER",
        entity: "NavigationItem",
        target: "ნავიგაციის რიგი",
        details: "ნავიგაციის თანმიმდევრობა განახლდა",
      });

      return NextResponse.json({
        success: true,
        message: "ნავიგაციის თანმიმდევრობა განახლდა",
      });
    }

    const { id, label, url, order = 0, isActive = true } = body;

    if (!label || !url) {
      return NextResponse.json({ success: false, message: "Label and URL are required" }, { status: 400 });
    }

    let result;

    if (id) {
      result = await prisma.navigationItem.update({
        where: { id },
        data: {
          label: label.trim(),
          url: url.trim(),
          order: Number(order),
          isActive: Boolean(isActive),
        },
      });

      await recordAuditLog({
        userId: session?.userId,
        adminEmail: session?.email,
        adminName: session?.name,
        action: "NAVIGATION_UPDATE",
        entity: "NavigationItem",
        target: `${result.label} (${result.id})`,
        details: `განახლდა ნავიგაცია: ${result.url}, რიგი: ${result.order}, სტატუსი: ${result.isActive ? "აქტიური" : "არააქტიური"}`,
      });
    } else {
      result = await prisma.navigationItem.create({
        data: {
          label: label.trim(),
          url: url.trim(),
          order: Number(order),
          isActive: Boolean(isActive),
        },
      });

      await recordAuditLog({
        userId: session?.userId,
        adminEmail: session?.email,
        adminName: session?.name,
        action: "NAVIGATION_CREATE",
        entity: "NavigationItem",
        target: `${result.label} (${result.id})`,
        details: `შეიქმნა ნავიგაციის ელემენტი: ${result.url}`,
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("POST /api/admin/navigation error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return POST(request);
}

export async function DELETE(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    const existing = await prisma.navigationItem.findUnique({ where: { id } });

    await prisma.navigationItem.delete({ where: { id } });

    if (existing) {
      await recordAuditLog({
        userId: session?.userId,
        adminEmail: session?.email,
        adminName: session?.name,
        action: "NAVIGATION_DELETE",
        entity: "NavigationItem",
        target: `${existing.label} (${existing.id})`,
        details: "ნავიგაციის ელემენტი წაიშალა მონაცემთა ბაზიდან",
      });
    }

    return NextResponse.json({ success: true, message: "ნავიგაციის ელემენტი წაიშალა" });
  } catch (error: any) {
    console.error("DELETE /api/admin/navigation error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

