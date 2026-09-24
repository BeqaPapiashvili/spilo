"use client";

import { useEffect, useState } from "react";
import { SiteOfflineScreen } from "@/components/SiteOfflineScreen";
import type { SiteStatus } from "@/lib/siteStatusShared";

export function AdminOfflineBypass({
  status,
  children,
  serverAdmin = false,
}: {
  status: SiteStatus;
  children: React.ReactNode;
  serverAdmin?: boolean;
}) {
  const [checked, setChecked] = useState(false);
  const [liveAdmin, setLiveAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/auth", { credentials: "include", cache: "no-store" })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        setLiveAdmin(Boolean(res.ok && json?.success && json.admin));
      })
      .catch(() => {
        if (!cancelled) setLiveAdmin(false);
      })
      .finally(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const allowSite = checked ? liveAdmin : serverAdmin;

  if (!allowSite) {
    return <SiteOfflineScreen status={status} />;
  }

  return (
    <>
      <div className="sticky top-0 z-50 bg-[#111111] text-white text-[11px] text-center py-1.5 px-3">
        ადმინის ხედი · სტუმრებს{" "}
        {status.mode === "coming_soon" ? "Coming Soon" : "Offline"} გვერდი უჩანთ
      </div>
      {children}
    </>
  );
}
