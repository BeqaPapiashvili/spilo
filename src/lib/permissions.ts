export type UserRole = "SUPER_ADMIN" | "STORE_MANAGER" | "SUPPORT_AGENT" | "CATALOG_MANAGER" | "CUSTOMER";

export function isRouteAllowed(role: string = "SUPER_ADMIN", pathname: string): boolean {
  if (!role || role === "SUPER_ADMIN") return true;

  // Store Manager can access everything except system settings & security
  if (role === "STORE_MANAGER") {
    const forbidden = ["/admin/settings", "/admin/security", "/admin/audit-logs"];
    return !forbidden.some((p) => pathname.startsWith(p));
  }

  // Support Agent has access to Dashboard, Support Chat, and Orders (Read-Only)
  if (role === "SUPPORT_AGENT") {
    if (pathname === "/admin" || pathname.startsWith("/admin/support") || pathname.startsWith("/admin/orders")) return true;
    return false;
  }

  // Catalog Manager has access to Dashboard, Products, Categories, Brands, Promotions, Coupons, Banners
  if (role === "CATALOG_MANAGER") {
    if (pathname === "/admin") return true;
    const allowed = [
      "/admin/products",
      "/admin/categories",
      "/admin/brands",
      "/admin/promotions",
      "/admin/coupons",
      "/admin/banners",
    ];
    return allowed.some((p) => pathname.startsWith(p));
  }

  // Customers have zero admin access
  return false;
}
