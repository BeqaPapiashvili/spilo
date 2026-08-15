"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Skeleton } from "@/components/ui/Skeleton";
import { isRouteAllowed } from "@/lib/permissions";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { adminUser, adminToken, _hasHydrated, addToast } = useStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const isStoreHydrated = _hasHydrated || (useStore.persist?.hasHydrated ? useStore.persist.hasHydrated() : true);
    if (!isMounted || !isStoreHydrated) return;

    // Bypass check if already on /admin/login
    if (isLoginPage) {
      setIsAuthorized(true);
      return;
    }

    // Check Admin Authentication
    const hasAdminAccess = adminUser !== null && adminToken !== null;

    if (!hasAdminAccess) {
      setIsAuthorized(false);
      addToast({
        title: "ავტორიზაცია აუცილებელია",
        message: "ადმინ პანელში შესასვლელად გთხოვთ გაიაროთ ავტორიზაცია",
        type: "warning",
      });
      router.push("/admin/login");
    } else {
      setIsAuthorized(true);
    }
  }, [adminUser, adminToken, _hasHydrated, isMounted, isLoginPage, router, addToast]);

  // Bypass layout skeleton if rendering /admin/login page directly
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading Skeleton before check completes
  if (!isMounted || !_hasHydrated || isAuthorized === null || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 text-center">
          <Skeleton height={32} className="w-1/2 mx-auto rounded-xl bg-slate-100" />
          <Skeleton height={16} className="w-3/4 mx-auto rounded-lg bg-slate-100" />
          <div className="space-y-2 pt-4">
            <Skeleton height={44} className="w-full rounded-xl bg-slate-100" />
            <Skeleton height={44} className="w-full rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  // Check Role Permission Rights for current route
  const userRole = adminUser?.role || "SUPER_ADMIN";
  const canAccessPage = isRouteAllowed(userRole, pathname);

  if (!canAccessPage) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] p-4 md:p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 md:p-10 max-w-lg w-full border border-slate-200/80 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-150">
          <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 border border-red-100 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-mono">
              <span>როლი: {userRole}</span>
            </div>
            <h2 className="text-xl md:text-2xl text-slate-900 tracking-tight">
              წვდომა შეზღუდულია
            </h2>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
              თქვენს თანამდებობას ({userRole}) არ აქვს ამ გვერდზე ({pathname}) შესვლის უფლება. გთხოვთ მიმართოთ Super Admin-ს უფლებების გასაზრდელად.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center">
            <Link
              href="/admin"
              className="h-11 px-6 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>მთავარ დეშბორდზე დაბრუნება</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
