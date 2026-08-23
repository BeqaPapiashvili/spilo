import { SignJWT, jwtVerify } from "jose";
import { NextResponse } from "next/server";

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
  [key: string]: any;
}

const JWT_SECRET_STRING = process.env.JWT_SECRET || "spilo_super_secret_jwt_key_development_only_change_in_prod_2026";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export const AUTH_COOKIE_NAME = "spilo_token";
export const TOKEN_EXPIRY = "7d";
export const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Signs a JWT token containing user identity and role.
 */
export async function signToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT token and returns the payload if valid.
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Sets the signed JWT in an HTTP-only secure cookie on the response.
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE_SECONDS,
  });
}

/**
 * Clears the auth cookie on the response (for logout).
 */
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

/**
 * Extracts and verifies the session from either the HTTP-only cookie or Authorization Bearer header.
 */
export async function getAuthSession(request: Request): Promise<SessionPayload | null> {
  // 1. Try to read from cookie
  const cookieHeader = request.headers.get("cookie") || "";
  const cookieMatch = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));

  let token: string | null = null;
  if (cookieMatch) {
    token = cookieMatch.substring(AUTH_COOKIE_NAME.length + 1);
  }

  // 2. Try to read from Authorization header if cookie not found
  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    return null;
  }

  return await verifyToken(token);
}

const ADMIN_ROLE_LIST = ["SUPER_ADMIN", "STORE_MANAGER", "SUPPORT_AGENT", "CATALOG_MANAGER", "ADMIN"];

/**
 * Enforces admin session authentication and returns 401/403 response if unauthorized.
 */
export async function requireAdminSession(request: Request): Promise<{ session: SessionPayload | null; errorResponse: NextResponse | null }> {
  const session = await getAuthSession(request);
  if (!session || !session.userId) {
    // In local development, fallback to super admin session if cookie is missing
    if (process.env.NODE_ENV !== "production") {
      return {
        session: {
          userId: "admin-dev-id",
          email: "admin@spilo.ge",
          role: "SUPER_ADMIN",
          name: "Super Admin",
        },
        errorResponse: null,
      };
    }

    return {
      session: null,
      errorResponse: NextResponse.json(
        { success: false, error: "ავტორიზაცია აუცილებელია (Unauthorized)" },
        { status: 401 }
      ),
    };
  }

  const role = session.role || "CUSTOMER";
  if (!ADMIN_ROLE_LIST.includes(role)) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { success: false, error: "წვდომა შეზღუდულია: არასაკმარისი უფლებები (Forbidden)" },
        { status: 403 }
      ),
    };
  }

  return { session, errorResponse: null };
}

