export type UserRole = "SUPER_ADMIN" | "STORE_MANAGER" | "SUPPORT_AGENT" | "CATALOG_MANAGER" | "CUSTOMER" | "ADMIN";

export const ADMIN_ROLES = ["SUPER_ADMIN", "STORE_MANAGER", "SUPPORT_AGENT", "CATALOG_MANAGER", "ADMIN"];

export function isRouteAllowed(role: string = "SUPER_ADMIN", pathname: string): boolean {
  if (!role || role === "SUPER_ADMIN" || role === "ADMIN") return true;

  // Normalize API route to page route for unified permission evaluation
  const normalizedPath = pathname.startsWith("/api/admin")
    ? pathname.replace("/api/admin", "/admin")
    : pathname;

  // Store Manager can access everything except system settings, security, users, and audit logs
  if (role === "STORE_MANAGER") {
    const forbidden = ["/admin/settings", "/admin/security", "/admin/audit-logs", "/admin/users"];
    return !forbidden.some((p) => normalizedPath.startsWith(p));
  }

  // Support Agent has access to Dashboard, Support Chat, and Orders (Read-Only)
  if (role === "SUPPORT_AGENT") {
    if (
      normalizedPath === "/admin" ||
      normalizedPath === "/admin/stats" ||
      normalizedPath.startsWith("/admin/support") ||
      normalizedPath.startsWith("/admin/orders")
    ) {
      return true;
    }
    return false;
  }

  // Catalog Manager has access to Dashboard, Products, Categories, Brands, Promotions, Coupons, Banners, Homepage CMS
  if (role === "CATALOG_MANAGER") {
    if (normalizedPath === "/admin" || normalizedPath === "/admin/stats") return true;
    const allowed = [
      "/admin/products",
      "/admin/categories",
      "/admin/brands",
      "/admin/promotions",
      "/admin/coupons",
      "/admin/banners",
      "/admin/homepage",
      "/admin/cms",
      "/admin/navigation",
      "/admin/delivery",
      "/admin/installments",
      "/admin/seo",
    ];
    return allowed.some((p) => normalizedPath.startsWith(p));
  }

  // Customers have zero admin access
  return false;
}
