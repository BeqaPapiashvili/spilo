import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_BANKS = [
  {
    bankName: "თიბისი ბანკი",
    name: "TBC 0% ონლაინ განვადება",
    bankCode: "TBC_ONLINE",
    merchantCode: "TBC_INST_9921",
    months: 12,
    availableMonths: [3, 6, 12, 18, 24, 36],
    minAmount: 100,
    maxAmount: 15000,
    ratePercent: 0,
    isActive: true,
  },
  {
    bankName: "საქართველოს ბანკი (BOG)",
    name: "საქართველოს ბანკის 0% განვადება",
    bankCode: "BOG_ONLINE",
    merchantCode: "BOG_INST_4402",
    months: 12,
    availableMonths: [3, 6, 12, 18, 24],
    minAmount: 100,
    maxAmount: 15000,
    ratePercent: 0,
    isActive: true,
  },
  {
    bankName: "კრედო ბანკი",
    name: "Credo ონლაინ განვადება",
    bankCode: "CREDO_ONLINE",
    merchantCode: "CREDO_INST_1109",
    months: 12,
    availableMonths: [3, 6, 12, 18],
    minAmount: 50,
    maxAmount: 10000,
    ratePercent: 0,
    isActive: true,
  },
  {
    bankName: "Space Bank",
    name: "Space & Re|Bank (ტოპ|ქარდი)",
    bankCode: "SPACE_ONLINE",
    merchantCode: "SPACE_TOP_CARD_882",
    months: 12,
    availableMonths: [3, 6, 12],
    minAmount: 50,
    maxAmount: 8000,
    ratePercent: 0,
    isActive: true,
  },
];

export async function GET() {
  try {
    const prisma = getPrismaClient();
    let options = await prisma.installmentOption.findMany({
      orderBy: { createdAt: "asc" },
    });

    if (options.length === 0) {
      // Auto-seed defaults into MySQL
      for (const b of DEFAULT_BANKS) {
        await prisma.installmentOption.create({
          data: {
            bankName: b.bankName,
            name: b.name,
            bankCode: b.bankCode,
            merchantCode: b.merchantCode,
            months: b.months,
            availableMonths: b.availableMonths,
            minAmount: b.minAmount,
            maxAmount: b.maxAmount,
            ratePercent: b.ratePercent,
            isActive: b.isActive,
          },
        }).catch(() => {});
      }

      options = await prisma.installmentOption.findMany({
        orderBy: { createdAt: "asc" },
      });
    }

    return NextResponse.json({
      success: true,
      count: options.length,
      data: options,
    });
  } catch (error: any) {
    console.error("GET /api/admin/installments error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch installment options" },
      { status: 500 }
    );
  }
}

import { requireAdminSession } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const prisma = getPrismaClient();
    const body = await request.json();

    const {
      id,
      bankName,
      name,
      bankCode,
      merchantCode,
      months = 12,
      availableMonths,
      minAmount = 50,
      maxAmount = 15000,
      ratePercent = 0,
      isActive = true,
    } = body;

    if (!bankName || (!bankCode && !id)) {
      return NextResponse.json(
        { success: false, message: "Bank name and bank code are required" },
        { status: 400 }
      );
    }

    let result;
    if (id) {
      result = await prisma.installmentOption.update({
        where: { id },
        data: {
          bankName,
          name: name || bankName,
          ...(bankCode ? { bankCode } : {}),
          merchantCode: merchantCode || "",
          months: Number(months),
          availableMonths: Array.isArray(availableMonths) ? availableMonths : [3, 6, 12, 24],
          minAmount: Number(minAmount),
          maxAmount: Number(maxAmount),
          ratePercent: Number(ratePercent),
          isActive: Boolean(isActive),
        },
      });

      await recordAuditLog({
        userId: session?.userId,
        adminEmail: session?.email,
        adminName: session?.name,
        action: "INSTALLMENT_UPDATE",
        entity: "InstallmentOption",
        target: `${bankName} (${result.id})`,
        details: `განახლდა ბანკის განვადების პარამეტრები: ${bankName}`,
      });
    } else {
      result = await prisma.installmentOption.create({
        data: {
          bankName,
          name: name || bankName,
          bankCode: bankCode || `BANK_${Date.now()}`,
          merchantCode: merchantCode || "",
          months: Number(months),
          availableMonths: Array.isArray(availableMonths) ? availableMonths : [3, 6, 12, 24],
          minAmount: Number(minAmount),
          maxAmount: Number(maxAmount),
          ratePercent: Number(ratePercent),
          isActive: Boolean(isActive),
        },
      });

      await recordAuditLog({
        userId: session?.userId,
        adminEmail: session?.email,
        adminName: session?.name,
        action: "INSTALLMENT_CREATE",
        entity: "InstallmentOption",
        target: `${bankName} (${result.id})`,
        details: `შეიქმნა ახალი განვადების პარტნიორი: ${bankName}`,
      });
    }

    const allOptions = await prisma.installmentOption.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: allOptions,
      item: result,
      message: "Installment option saved successfully",
    });
  } catch (error: any) {
    console.error("POST /api/admin/installments error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save installment option" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const prisma = getPrismaClient();
    const body = await request.json();

    // Support bulk banks update
    if (Array.isArray(body.banks)) {
      for (const b of body.banks) {
        if (b.id) {
          await prisma.installmentOption.update({
            where: { id: b.id },
            data: {
              bankName: b.bankName,
              name: b.name || b.bankName,
              merchantCode: b.merchantCode || "",
              minAmount: Number(b.minAmount || 50),
              maxAmount: Number(b.maxAmount || 15000),
              ratePercent: Number(b.ratePercent || 0),
              isActive: b.isActive !== undefined ? Boolean(b.isActive) : Boolean(b.enabled),
            },
          }).catch(() => {});
        }
      }

      await recordAuditLog({
        userId: session?.userId,
        adminEmail: session?.email,
        adminName: session?.name,
        action: "INSTALLMENT_BULK_UPDATE",
        entity: "InstallmentOption",
        target: "ბანკის განვადებები",
        details: `განახლდა ${body.banks.length} პარტნიორი ბანკის განვადების პარამეტრები`,
      });
    } else if (body.id) {
      await prisma.installmentOption.update({
        where: { id: body.id },
        data: {
          ...(body.bankName ? { bankName: body.bankName } : {}),
          ...(body.name ? { name: body.name } : {}),
          ...(body.merchantCode !== undefined ? { merchantCode: body.merchantCode } : {}),
          ...(body.minAmount !== undefined ? { minAmount: Number(body.minAmount) } : {}),
          ...(body.maxAmount !== undefined ? { maxAmount: Number(body.maxAmount) } : {}),
          ...(body.ratePercent !== undefined ? { ratePercent: Number(body.ratePercent) } : {}),
          ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
        },
      });

      await recordAuditLog({
        userId: session?.userId,
        adminEmail: session?.email,
        adminName: session?.name,
        action: "INSTALLMENT_UPDATE",
        entity: "InstallmentOption",
        target: `${body.bankName || body.id}`,
        details: `განახლდა განვადების პარამეტრები: ${body.bankName || body.id}`,
      });
    }

    const allOptions = await prisma.installmentOption.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: allOptions,
      message: "Installment settings updated successfully",
    });
  } catch (error: any) {
    console.error("PUT /api/admin/installments error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update installment settings" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const prisma = getPrismaClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Installment option ID is required for deletion" },
        { status: 400 }
      );
    }

    const deleted = await prisma.installmentOption.delete({
      where: { id },
    }).catch(() => null);

    if (deleted) {
      await recordAuditLog({
        userId: session?.userId,
        adminEmail: session?.email,
        adminName: session?.name,
        action: "INSTALLMENT_DELETE",
        entity: "InstallmentOption",
        target: `${deleted.bankName} (${deleted.id})`,
        details: `წაიშალა განვადების პარტნიორი: ${deleted.bankName}`,
      });
    }

    const allOptions = await prisma.installmentOption.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: allOptions,
      message: "Installment option deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/installments error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete installment option" },
      { status: 500 }
    );
  }
}

