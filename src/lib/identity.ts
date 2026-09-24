import { NextResponse } from "next/server";
import { getAuthSession, shouldUseSecureCookie } from "@/lib/jwt";

export const GUEST_COOKIE_NAME = "spilo_sid";
const GUEST_MAX_AGE = 60 * 60 * 24 * 365;

export type Identity = {
  userId: string | null;
  sessionId: string | null;
  guestCookieToSet: string | null;
};

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie") || "";
  const match = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!match) return null;
  try {
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return match.slice(name.length + 1);
  }
}

function isSafeGuestId(value: string): boolean {
  return /^[A-Za-z0-9_-]{8,80}$/.test(value);
}

/**
 * Resolves the caller from the JWT cookie (logged-in) or an httpOnly guest cookie.
 * Client-supplied userId / sessionId values are ignored.
 */
export async function resolveIdentity(request: Request): Promise<Identity> {
  const session = await getAuthSession(request);
  if (session?.userId) {
    return { userId: session.userId, sessionId: null, guestCookieToSet: null };
  }

  const existing = readCookie(request, GUEST_COOKIE_NAME);
  if (existing && isSafeGuestId(existing)) {
    return { userId: null, sessionId: existing, guestCookieToSet: null };
  }

  const sessionId = `sess_${crypto.randomUUID().replace(/-/g, "")}`;
  return { userId: null, sessionId, guestCookieToSet: sessionId };
}

export function applyGuestCookie(response: NextResponse, identity: Identity): NextResponse {
  if (!identity.guestCookieToSet) return response;
  response.cookies.set(GUEST_COOKIE_NAME, identity.guestCookieToSet, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookie(),
    path: "/",
    maxAge: GUEST_MAX_AGE,
  });
  return response;
}

export function jsonWithIdentity(
  body: unknown,
  identity: Identity,
  init?: ResponseInit
): NextResponse {
  return applyGuestCookie(NextResponse.json(body, init), identity);
}

export function identityWhere(identity: Identity): { userId: string } | { sessionId: string } {
  if (identity.userId) return { userId: identity.userId };
  return { sessionId: identity.sessionId as string };
}
