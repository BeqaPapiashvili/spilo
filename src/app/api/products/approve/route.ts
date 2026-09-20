import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/jwt";
import { recordAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const ids: string[] = Array.isArray(body.productIds) 
      ? body.productIds 
      : (body.id ? [body.id] : []);

    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: "პროდუქტის ID-ები არ არის მითითებული" }, { status: 400 });
    }

    const updated = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: {
        status: "PUBLISHED",
        isApproved: true,
      },
    });

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "PRODUCT_APPROVE",
      entity: "Product",
      target: `დამტკიცდა ${updated.count} პროდუქტი`,
      details: `ადმინისტრაციამ გადაამოწმა და საიტზე გამოაქვეყნა ${updated.count} პროდუქტი.`,
    });

    return NextResponse.json({
      success: true,
      count: updated.count,
      message: `${updated.count} პროდუქტი წარმატებით დამტკიცდა და გამოქვეყნდა საიტზე`,
    });
  } catch (error: any) {
    console.error("POST /api/products/approve error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "დამტკიცების დროს დაფიქსირდა შეცდომა" },
      { status: 500 }
    );
  }
}
