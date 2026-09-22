"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";

export function MerchantRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { adminUser, setAdminSession, _hasHydrated } = useStore();
  const [ready, setReady] = useState(false);
  const isLogin = pathname === "/merchant/login";

  useEffect(() => {
    if (isLogin) return;
    let cancelled = false;
    const load = async () => {
      if (adminUser?.role === "MERCHANT") {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const res = await fetch("/api/merchant/auth", { credentials: "include" });
        const json = await res.json();
        if (res.ok && json.success && json.merchant) {
          setAdminSession(json.merchant);
          if (!cancelled) setReady(true);
          return;
        }
      } catch {
        // fall through
      }
      if (!cancelled) router.push("/merchant/login");
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [adminUser, isLogin, router, setAdminSession]);

  if (isLogin) return <>{children}</>;
  if (!_hasHydrated || !ready) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center text-sm text-slate-500">
        იტვირთება...
      </div>
    );
  }
  return <>{children}</>;
}
