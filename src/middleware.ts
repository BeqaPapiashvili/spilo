import { NextRequest, NextResponse } from "next/server";
import {
  verifyToken,
  AUTH_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
  MERCHANT_COOKIE_NAME,
} from "@/lib/jwt";
import { ADMIN_ROLES, isRouteAllowed } from "@/lib/permissions";

async function requestHasAdminRole(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return Boolean(payload?.userId && ADMIN_ROLES.includes(payload.role || ""));
}

async function nextWithPathname(request: NextRequest, extraHeaders?: Headers) {
  const requestHeaders = extraHeaders ? extraHeaders : new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  if (await requestHasAdminRole(request)) {
    requestHeaders.set("x-admin-session", "1");
  }
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function tokenForPath(request: NextRequest, pathname: string): string | undefined {
  const customer = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const admin = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const merchant = request.cookies.get(MERCHANT_COOKIE_NAME)?.value;

  if (pathname.startsWith("/merchant") || pathname.startsWith("/api/merchant")) {
    return merchant || customer;
  }
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/products") ||
    pathname.startsWith("/api/categories") ||
    pathname.startsWith("/api/brands") ||
    pathname.startsWith("/api/banners") ||
    pathname.startsWith("/api/coupons") ||
    pathname.startsWith("/api/promotions")
  ) {
    return admin || customer;
  }
  return customer;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip public login endpoints
  if (
    pathname === "/admin/login" ||
    pathname === "/merchant/login" ||
    (pathname === "/api/admin/auth" && (request.method === "POST" || request.method === "DELETE")) ||
    (pathname === "/api/merchant/auth" && (request.method === "POST" || request.method === "DELETE"))
  ) {
    return await nextWithPathname(request);
  }

  // 2. Extract JWT token strictly from httpOnly cookie (or Authorization Bearer header)
  let token = tokenForPath(request, pathname);

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

    return await nextWithPathname(request, requestHeaders);
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
    if (role === "MERCHANT") {
      return NextResponse.redirect(new URL("/merchant", request.url));
    }
    if (!ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (!isRouteAllowed(role, pathname)) {
      // If role cannot access this specific sub-page, redirect to main admin dashboard
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return await nextWithPathname(request);
  }

  // 6. Handle standalone mutating API routes (Defense-in-depth for POST/PUT/PATCH/DELETE on admin resources)
  const isMutatingMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);
  const standaloneAdminPrefixes = [
    "/api/products",
    "/api/categories",
    "/api/brands",
    "/api/banners",
    "/api/coupons",
    "/api/promotions",
  ];

  const isStandaloneAdminRoute = standaloneAdminPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // Exempt public validation endpoint: POST /api/coupons/validate
  const isExempt = pathname === "/api/coupons/validate";

  if (isMutatingMethod && isStandaloneAdminRoute && !isExempt) {
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

    // Forward authenticated user data in headers for API route handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-email", payload.email || "");
    requestHeaders.set("x-user-role", role);
    if (payload.name) requestHeaders.set("x-user-name", encodeURIComponent(payload.name));

    return await nextWithPathname(request, requestHeaders);
  }

  if (pathname.startsWith("/api/merchant")) {
    if (!token) {
      return NextResponse.json({ success: false, error: "ავტორიზაცია აუცილებელია" }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload?.userId || payload.role !== "MERCHANT") {
      return NextResponse.json({ success: false, error: "პარტნიორის წვდომა შეზღუდულია" }, { status: 403 });
    }
    return await nextWithPathname(request);
  }

  if (pathname.startsWith("/merchant")) {
    if (!token) {
      const loginUrl = new URL("/merchant/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const payload = await verifyToken(token);
    if (!payload?.userId || payload.role !== "MERCHANT") {
      return NextResponse.redirect(new URL("/merchant/login", request.url));
    }
    return await nextWithPathname(request);
  }

  return await nextWithPathname(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};

