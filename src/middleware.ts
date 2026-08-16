import { NextRequest, NextResponse } from "next/server";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt";
import { ADMIN_ROLES, isRouteAllowed } from "@/lib/permissions";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip public login endpoints
  if (pathname === "/admin/login" || pathname === "/api/admin/auth") {
    return NextResponse.next();
  }

  // 2. Extract JWT token strictly from httpOnly cookie (or Authorization Bearer header)
  let token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  // 3. Handle /api/admin/* routes (JSON 401 / 403 responses)
  if (pathname.startsWith("/api/admin")) {
    if (!token) {
      return NextResponse.json(
        { success: false, error: "ავტორიზაცია აუცილებელია (Unauthorized)" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: "სესია არასწორია ან ვადაგასულია (Unauthorized)" },
        { status: 401 }
      );
    }

    const role = payload.role || "CUSTOMER";
    if (!ADMIN_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: "წვდომა შეზღუდულია: არასაკმარისი უფლებები (Forbidden)" },
        { status: 403 }
      );
    }

    if (!isRouteAllowed(role, pathname)) {
      return NextResponse.json(
        { success: false, error: "თქვენს როლს არ აქვს ამ API-ზე წვდომის უფლება (Forbidden)" },
        { status: 403 }
      );
    }

    // Forward authenticated user data in headers for API route handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-email", payload.email || "");
    requestHeaders.set("x-user-role", role);
    if (payload.name) requestHeaders.set("x-user-name", encodeURIComponent(payload.name));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 4. Handle /admin/* page routes (Redirects to /admin/login)
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = payload.role || "CUSTOMER";
    if (!ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (!isRouteAllowed(role, pathname)) {
      // If role cannot access this specific sub-page, redirect to main admin dashboard
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  // 5. Handle /profile/* page routes (Redirects to homepage / login prompt)
  if (pathname.startsWith("/profile")) {
    if (!token) {
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("auth", "login");
      return NextResponse.redirect(homeUrl);
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("auth", "login");
      return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/profile/:path*",
  ],
};
