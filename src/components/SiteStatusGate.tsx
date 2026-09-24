import { cookies, headers } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { AdminOfflineBypass } from "@/components/AdminOfflineBypass";
import { ADMIN_COOKIE_NAME, verifyToken } from "@/lib/jwt";
import { ADMIN_ROLES } from "@/lib/permissions";
import { getSiteStatus, isStaffPath } from "@/lib/siteStatus";

async function hasAdminSession() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return Boolean(payload?.userId && ADMIN_ROLES.includes(payload.role || ""));
}

export async function SiteStatusGate({ children }: { children: React.ReactNode }) {
  noStore();
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") || "";

  if (isStaffPath(pathname)) {
    return children;
  }

  const status = await getSiteStatus();
  if (status.mode === "online") {
    return children;
  }

  const isAdmin =
    headerStore.get("x-admin-session") === "1" || (await hasAdminSession());

  return (
    <AdminOfflineBypass status={status} serverAdmin={isAdmin}>
      {children}
    </AdminOfflineBypass>
  );
}
