"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SiteMode } from "@/lib/siteStatusShared";

export function SiteModeBadge() {
  const [mode, setMode] = useState<SiteMode>("online");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/site-status", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json?.data?.mode) setMode(json.data.mode);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const label =
    mode === "coming_soon" ? "Coming Soon" : mode === "maintenance" ? "Offline" : "საიტი ღიაა";
  const dot =
    mode === "coming_soon" ? "bg-[#FF5238]" : mode === "maintenance" ? "bg-amber-500" : "bg-emerald-500";

  return (
    <Link
      href="/admin/site-status"
      className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-700 hover:bg-white"
    >
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span>{label}</span>
    </Link>
  );
}
