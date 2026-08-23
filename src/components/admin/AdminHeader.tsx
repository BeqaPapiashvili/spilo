"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Menu, 
  Search, 
  Bell, 
  Plus, 
  Settings, 
  ChevronDown,
  LogOut,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { AdminSearchModal } from "./AdminSearchModal";

export const AdminHeader: React.FC<{ onOpenSidebar: () => void }> = ({ onOpenSidebar }) => {
  const router = useRouter();
  const { adminUser, logoutAdmin, addToast } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    const handleGlobalShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalShortcut);
    return () => window.removeEventListener("keydown", handleGlobalShortcut);
  }, []);

  const handleAdminLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.warn("Logout error:", e);
    }
    logoutAdmin();
    useStore.getState().setUser(null);
    setIsProfileOpen(false);
    addToast({
      title: "სესიის დასრულება",
      message: "თქვენ გამოხვედით ადმინ პანელიდან",
      type: "info",
    });
    router.push("/admin/login");
  };

  const userName = adminUser?.name || "Admin User";
  const userRole = adminUser?.role || "SUPER_ADMIN";
  const userInitials = userName.slice(0, 2).toUpperCase();

  return (
    <>
      <header className="sticky top-4 z-30 mx-4 md:mx-8 h-16 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-3xl px-4 md:px-6 flex items-center justify-between shadow-xs transition-all">
        
        {/* Left: Mobile Toggle & Search Trigger */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center lg:hidden transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsSearchModalOpen(true)}
            className="relative flex-1 h-10 px-4 pl-11 pr-12 bg-slate-50 hover:bg-white border border-slate-200/90 hover:border-blue-600 rounded-2xl text-xs text-slate-400 flex items-center justify-between transition-all cursor-pointer text-left shadow-2xs"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <span className="truncate">ძიება: პროდუქტი, SKU, შეკვეთა, კლიენტი...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[10px] font-mono text-slate-400 shadow-2xs shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Status Sync Badge + Quick Actions + Notifications + Profile */}
        <div className="flex items-center gap-3">
          
          {/* Live Storefront Sync Badge */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync</span>
          </div>

          {/* Quick Add Product Button */}
          <Link
            href="/admin/products/new"
            className="h-10 px-4 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-2xl text-xs hidden sm:flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>ახალი პროდუქტი</span>
          </Link>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileOpen(false); }}
              className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center relative transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#FF5238] absolute top-2.5 right-2.5 ring-2 ring-white" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-150 p-2">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-900">შეტყობინებები & ლოგები</span>
                  <span className="px-2 py-0.5 bg-[#FFF5F2] text-[#FF5238] text-[10px] rounded-full font-mono">
                    {auditLogs.length} ახალი
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                  {auditLogs.map((log, idx) => (
                    <div key={log.id ? `${log.id}-${idx}` : `log-${idx}`} className="p-3 space-y-0.5 hover:bg-slate-50 rounded-2xl transition-colors">
                      <p className="text-xs text-slate-900">{log.action}</p>
                      <p className="text-[11px] text-slate-500">{log.details}</p>
                      <span className="text-[10px] text-slate-400 font-mono block pt-1">{log.timestamp} · {log.userName}</span>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-slate-100 text-center">
                  <Link
                    href="/admin/audit-logs"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-xs text-[#FF5238] hover:underline inline-flex items-center gap-1"
                  >
                    <span>სრული ისტორიის ნახვა</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative pl-2 border-l border-slate-200">
            <button
              type="button"
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationsOpen(false); }}
              className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-2xl bg-[#111111] text-white text-xs font-mono flex items-center justify-center shadow-2xs">
                {userInitials}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs text-slate-900 leading-tight">{userName}</p>
                <p className="text-[10px] text-blue-600 leading-tight flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  {userRole}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-2xl p-2 z-50 space-y-1 animate-in zoom-in-95 duration-150">
                <div className="p-3 border-b border-slate-100">
                  <p className="text-xs text-slate-900">{userName}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{adminUser?.email || "admin@spilo.ge"}</p>
                </div>
                
                <Link
                  href="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full h-10 px-3 rounded-2xl text-xs flex items-center gap-2 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>პარამეტრები</span>
                </Link>

                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="w-full h-10 px-3 rounded-2xl text-xs flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>ადმინპანელიდან გამოსვლა</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </header>

      {/* Global Spotlight Search Modal */}
      <AdminSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        initialQuery={searchQuery}
      />
    </>
  );
};
