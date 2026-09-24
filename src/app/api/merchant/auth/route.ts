import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setAuthCookie, clearAuthCookie, signToken } from "@/lib/jwt";
import { MERCHANT_ROLE, requireMerchantSession } from "@/lib/merchant";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function GET(request: Request) {
  try {
    const { session, storeId, errorResponse } = await requireMerchantSession(request);
    if (errorResponse) return errorResponse;

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, name: true, slug: true, logo: true },
    });

    return NextResponse.json({
      success: true,
      merchant: {
        id: session?.userId,
        name: session?.name || "",
        email: session?.email || "",
        role: MERCHANT_ROLE,
        storeId,
        store,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "სესია ვერ შემოწმდა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const rate = await enforceRateLimit(request, {
      namespace: "merchant_login",
      limit: 8,
      windowSeconds: 15 * 60,
      customMessage: "ძალიან ბევრი მცდელობა. სცადეთ მოგვიანებით.",
    });
    if (!rate.success && rate.response) return rate.response;

    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "").trim();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "ელფოსტა და პაროლი აუცილებელია" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { email, role: MERCHANT_ROLE },
      include: { store: { select: { id: true, name: true, slug: true, logo: true, isActive: true } } },
    });

    if (!user || !user.password || !user.storeId || !user.store) {
      return NextResponse.json({ success: false, error: "პარტნიორი ვერ მოიძებნა" }, { status: 404 });
    }

    if (!user.store.isActive) {
      return NextResponse.json({ success: false, error: "მაღაზია გამორთულია" }, { status: 403 });
    }

    let valid = false;
    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      valid = await bcrypt.compare(password, user.password);
    } else {
      valid = user.password === password;
    }
    if (!valid) {
      return NextResponse.json({ success: false, error: "არასწორი პაროლი" }, { status: 401 });
    }

    const token = await signToken({
      userId: user.id,
      email: user.email || email,
      name: user.name || user.store.name,
      role: MERCHANT_ROLE,
      storeId: user.storeId,
    });

    const response = NextResponse.json({
      success: true,
      merchant: {
        id: user.id,
        name: user.name || user.store.name,
        email: user.email || email,
        role: MERCHANT_ROLE,
        storeId: user.storeId,
        store: user.store,
      },
    });
    setAuthCookie(response, token, "merchant");
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "ავტორიზაციის შეცდომა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  clearAuthCookie(response, "merchant");
  return response;
}
