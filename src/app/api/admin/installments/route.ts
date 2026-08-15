import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrismaClient();
    const options = await prisma.installmentOption.findMany({
      orderBy: { bankName: "asc" },
    });
    return NextResponse.json({ success: true, data: options });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrismaClient();
    const body = await request.json();
    const { id, bankName, bankCode, months, ratePercent = 0, isActive = true } = body;

    if (!bankName || !bankCode || !months) {
      return NextResponse.json({ success: false, message: "bankName, bankCode and months required" }, { status: 400 });
    }

    if (id) {
      const updated = await prisma.installmentOption.update({
        where: { id },
        data: { bankName, bankCode, months: Number(months), ratePercent: Number(ratePercent), isActive: Boolean(isActive) },
      });
      return NextResponse.json({ success: true, data: updated });
    } else {
      const created = await prisma.installmentOption.create({
        data: { bankName, bankCode, months: Number(months), ratePercent: Number(ratePercent), isActive: Boolean(isActive) },
      });
      return NextResponse.json({ success: true, data: created });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
