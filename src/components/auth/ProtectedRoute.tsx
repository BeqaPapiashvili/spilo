"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, _hasHydrated, toggleAuthModal, addToast } = useStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const isStoreHydrated = _hasHydrated || (useStore.persist?.hasHydrated ? useStore.persist.hasHydrated() : true);
    if (!isMounted || !isStoreHydrated) return;

    if (!user) {
      addToast({
        title: "ავტორიზაცია აუცილებელია",
        message: "გთხოვთ გაიაროთ ავტორიზაცია",
        type: "warning",
      });
      toggleAuthModal(true);
      router.push("/");
    }
  }, [user, _hasHydrated, isMounted, router, toggleAuthModal, addToast]);

  // Loading Skeleton before hydration & check completes
  if (!isMounted || !_hasHydrated || !user) {
    return (
      <div className="min-h-[70vh] container mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-gray-100 shadow-xs space-y-4">
          <Skeleton height={40} className="w-3/4 mx-auto rounded-xl" />
          <Skeleton height={20} className="w-1/2 mx-auto rounded-lg" />
          <Skeleton height={180} className="w-full rounded-2xl" />
          <Skeleton height={48} className="w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
