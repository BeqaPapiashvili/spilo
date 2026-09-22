import { SignJWT, jwtVerify } from "jose";
import { NextResponse } from "next/server";

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
  storeId?: string;
}

function resolveJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET environment variable is required in production");
    }
    console.warn("[jwt] JWT_SECRET is not set. Using a development-only fallback.");
    return new TextEncoder().encode("spilo-dev-only-do-not-use-in-production");
  }
  if (secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

const JWT_SECRET = resolveJwtSecret();

export const AUTH_COOKIE_NAME = "spilo_token";
export const TOKEN_EXPIRY = "7d";
export const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export async function signToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = typeof payload.userId === "string" ? payload.userId : "";
    const email = typeof payload.email === "string" ? payload.email : "";
    const role = typeof payload.role === "string" ? payload.role : "CUSTOMER";
    const name = typeof payload.name === "string" ? payload.name : undefined;
    const storeId = typeof payload.storeId === "string" ? payload.storeId : undefined;
    if (!userId) return null;
    return { userId, email, role, name, storeId };
  } catch {
    return null;
  }
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE_SECONDS,
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function getAuthSession(request: Request): Promise<SessionPayload | null> {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookieMatch = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));

  let token: string | null = null;
  if (cookieMatch) {
    token = cookieMatch.substring(AUTH_COOKIE_NAME.length + 1);
  }

  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) return null;
  return await verifyToken(token);
}

const ADMIN_ROLE_LIST = ["SUPER_ADMIN", "STORE_MANAGER", "SUPPORT_AGENT", "CATALOG_MANAGER", "ADMIN"];

export async function requireAdminSession(
  request: Request
): Promise<{ session: SessionPayload | null; errorResponse: NextResponse | null }> {
  const session = await getAuthSession(request);
  if (!session || !session.userId) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { success: false, error: "ავტორიზაცია აუცილებელია" },
        { status: 401 }
      ),
    };
  }

  const role = session.role || "CUSTOMER";
  if (!ADMIN_ROLE_LIST.includes(role)) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { success: false, error: "წვდომა შეზღუდულია: არასაკმარისი უფლებები" },
        { status: 403 }
      ),
    };
  }

  return { session, errorResponse: null };
}
