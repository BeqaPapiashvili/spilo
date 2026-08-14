"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { dataService } from "@/services/dataService";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, _hasHydrated, addToast } = useStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !_hasHydrated) return;

    // Check Admin Privileges
    const adminUsers = dataService.getAdminUsers();
    const isAdmin =
      user !== null &&
      (adminUsers.some(
        (adm) => adm.email.toLowerCase() === user.email.toLowerCase() && adm.status === "ACTIVE"
      ) ||
        user.email.endsWith("@spilo.ge") ||
        user.email === "papicha@gmail.com" || // Dev admin fallback
        user.name.toLowerCase().includes("admin"));

    if (!user || !isAdmin) {
      setIsAuthorized(false);
      addToast({
        title: "წვდომა უარყოფილია (403 Forbidden)",
        message: "ადმინ პანელზე წვდომისთვის საჭიროა ადმინისტრატორის უფლებები",
        type: "error",
      });
      router.push("/");
    } else {
      setIsAuthorized(true);
    }
  }, [user, _hasHydrated, isMounted, router, addToast]);

  // Loading Skeleton before check completes
  if (!isMounted || !_hasHydrated || isAuthorized === null || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-gray-200 shadow-xs space-y-4 text-center">
          <Skeleton height={32} className="w-1/2 mx-auto rounded-xl" />
          <Skeleton height={16} className="w-3/4 mx-auto rounded-lg" />
          <div className="space-y-2 pt-4">
            <Skeleton height={40} className="w-full rounded-xl" />
            <Skeleton height={40} className="w-full rounded-xl" />
            <Skeleton height={40} className="w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
