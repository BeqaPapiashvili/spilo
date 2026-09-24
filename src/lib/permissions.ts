export type UserRole = "SUPER_ADMIN" | "STORE_MANAGER" | "SUPPORT_AGENT" | "CATALOG_MANAGER" | "CUSTOMER" | "ADMIN";

export const ADMIN_ROLES = ["SUPER_ADMIN", "STORE_MANAGER", "SUPPORT_AGENT", "CATALOG_MANAGER", "ADMIN"];

export function canGrantRole(actorRole: string, targetRole: string): boolean {
  const elevated = actorRole === "SUPER_ADMIN" || actorRole === "ADMIN";
  if (targetRole === "SUPER_ADMIN" || targetRole === "ADMIN") return elevated;
  if (targetRole === "MERCHANT") return elevated;
  if (elevated) return true;
  if (actorRole === "STORE_MANAGER") {
    return ["CUSTOMER", "STORE_MANAGER", "SUPPORT_AGENT", "CATALOG_MANAGER"].includes(targetRole);
  }
  return false;
}

export function canMutateOrders(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "STORE_MANAGER";
}

export function isRouteAllowed(role: string = "SUPER_ADMIN", pathname: string): boolean {
  if (!role || role === "SUPER_ADMIN" || role === "ADMIN") return true;

  // Normalize API route to page route for unified permission evaluation
  const normalizedPath = pathname.startsWith("/api/admin")
    ? pathname.replace("/api/admin", "/admin")
    : pathname;

  // Store Manager can access everything except system settings, security, users, and audit logs
  if (role === "STORE_MANAGER") {
    const forbidden = ["/admin/settings", "/admin/site-status", "/admin/security", "/admin/audit-logs", "/admin/users"];
    return !forbidden.some((p) => normalizedPath.startsWith(p));
  }

  // Support Agent has access to Dashboard, Support Chat, and Orders (Read-Only)
  if (role === "SUPPORT_AGENT") {
    if (
      normalizedPath === "/admin" ||
      normalizedPath === "/admin/stats" ||
      normalizedPath.startsWith("/admin/support") ||
      normalizedPath.startsWith("/admin/orders") ||
      normalizedPath.startsWith("/admin/returns")
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
      "/admin/stores",
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
