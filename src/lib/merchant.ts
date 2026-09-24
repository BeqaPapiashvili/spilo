import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, type SessionPayload } from "@/lib/jwt";
export const MERCHANT_ROLE = "MERCHANT";
export { ITEM_STATUS, MERCHANT_ORDER_STATUSES, itemStatusLabel, orderStatusLabel } from "@/lib/merchantLabels";

export async function requireMerchantSession(request: Request): Promise<{
  session: SessionPayload | null;
  storeId: string;
  errorResponse: NextResponse | null;
}> {
  const session = await getAuthSession(request, "merchant");
  if (!session?.userId || session.role !== MERCHANT_ROLE) {
    return {
      session: null,
      storeId: "",
      errorResponse: NextResponse.json(
        { success: false, error: "პარტნიორის ავტორიზაცია აუცილებელია" },
        { status: 401 }
      ),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, storeId: true, store: { select: { id: true, isActive: true } } },
  });

  if (!user || user.role !== MERCHANT_ROLE || !user.storeId || !user.store) {
    return {
      session: null,
      storeId: "",
      errorResponse: NextResponse.json(
        { success: false, error: "მაღაზია ამ ანგარიშზე არ არის მიბმული" },
        { status: 403 }
      ),
    };
  }

  if (!user.store.isActive) {
    return {
      session: null,
      storeId: "",
      errorResponse: NextResponse.json(
        { success: false, error: "მაღაზია გამორთულია. მიმართეთ ადმინისტრაციას." },
        { status: 403 }
      ),
    };
  }

  return {
    session: { ...session, storeId: user.storeId },
    storeId: user.storeId,
    errorResponse: null,
  };
}
