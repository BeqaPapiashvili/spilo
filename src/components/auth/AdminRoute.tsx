"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Skeleton } from "@/components/ui/Skeleton";

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
      <div className="min-h-screen bg-[#0F172A] p-8 flex items-center justify-center">
        <div className="bg-slate-900 rounded-3xl p-8 max-w-lg w-full border border-slate-800 shadow-2xl space-y-4 text-center">
          <Skeleton height={32} className="w-1/2 mx-auto rounded-xl bg-slate-800" />
          <Skeleton height={16} className="w-3/4 mx-auto rounded-lg bg-slate-800" />
          <div className="space-y-2 pt-4">
            <Skeleton height={44} className="w-full rounded-xl bg-slate-800" />
            <Skeleton height={44} className="w-full rounded-xl bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
