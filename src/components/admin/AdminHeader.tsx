"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Menu, 
  Search, 
  Bell, 
  Plus, 
  ExternalLink, 
  ShieldCheck, 
  Settings, 
  ChevronDown,
  LayoutDashboard
} from "lucide-react";
import { dataService } from "@/services/dataService";

export const AdminHeader: React.FC<{ onOpenSidebar: () => void }> = ({ onOpenSidebar }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const auditLogs = dataService.getAuditLogs().slice(0, 5);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      style={{
        height: "3.75rem",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(226, 232, 240, 0.7)",
        position: "sticky",
        top: 0,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        boxShadow: "0 1px 3px rgba(15,23,42,0.05)",
      }}
    >
      
      {/* Left: Mobile Toggle & Global Search */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, maxWidth: "32rem" }}>
        <button
          onClick={onOpenSidebar}
          className="adm-icon-btn lg:hidden"
          style={{ color: "#475569" }}
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ძიება: პროდუქტი, SKU, შეკვეთა, კლიენტი..."
            className="adm-search-input"
          />
          <Search className="w-4 h-4" style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
        </form>
      </div>

      {/* Right: Quick actions + Notifications + Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        
        <Link
          href="/admin/products/new"
          className="adm-btn-primary"
          style={{ display: "none" }}
        >
          <Plus className="w-4 h-4" />
          <span>ახალი</span>
        </Link>

        {/* Show on sm+ */}
        <Link
          href="/admin/products/new"
          className="adm-btn-primary hidden sm:inline-flex"
        >
          <Plus className="w-4 h-4" />
          <span>პროდუქტი</span>
        </Link>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileOpen(false); }}
            className="adm-icon-btn"
            style={{ position: "relative" }}
          >
            <Bell className="w-5 h-5" />
            <span style={{
              position: "absolute", top: "4px", right: "4px",
              width: "7px", height: "7px", background: "#ef4444", borderRadius: "50%",
              border: "2px solid #fff"
            }} />
          </button>

          {isNotificationsOpen && (
            <div
              className="adm-modal"
              style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                width: "22rem", maxHeight: "26rem", zIndex: 200,
                borderRadius: "1.25rem",
              }}
            >
              <div style={{ padding: "1rem 1.25rem 0.75rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "#0f172a" }}>შეტყობინებები</span>
                <span className="adm-badge adm-badge-purple">{auditLogs.length} ახალი</span>
              </div>
              <div style={{ maxHeight: "18rem", overflowY: "auto" }}>
                {auditLogs.map((log, idx) => (
                  <div key={log.id ? `${log.id}-${idx}` : `log-${idx}`} style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid #f8fafc" }}>
                    <p style={{ fontSize: "0.75rem", color: "#0f172a" }}>{log.action}</p>
                    <p style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "2px" }}>{log.details}</p>
                    <span style={{ fontSize: "0.65rem", color: "#94a3b8", display: "block", marginTop: "4px" }}>{log.timestamp} · {log.userName}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
                <Link href="/admin/audit-logs" onClick={() => setIsNotificationsOpen(false)} style={{ fontSize: "0.75rem", color: "#6366f1" }}>
                  სრული ისტორიის ნახვა →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div style={{ position: "relative", borderLeft: "1px solid #e2e8f0", paddingLeft: "0.75rem", marginLeft: "0.25rem" }}>
          <button
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationsOpen(false); }}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0.5rem 0.25rem 0.25rem", borderRadius: "0.875rem", cursor: "pointer", transition: "background 0.15s", background: "transparent", border: "none" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{
              width: "2rem", height: "2rem", borderRadius: "0.625rem",
              background: "linear-gradient(135deg, #4f46e5, #8b5cf6)",
              color: "#fff", fontSize: "0.65rem", display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>BP</div>
            <div style={{ textAlign: "left" }} className="hidden md:block">
              <p style={{ fontSize: "0.75rem", color: "#0f172a", lineHeight: 1.2 }}>Beka Papiashvili</p>
              <p style={{ fontSize: "0.65rem", color: "#94a3b8", lineHeight: 1.2 }}>Super Admin</p>
            </div>
            <ChevronDown className="w-3 h-3" style={{ color: "#94a3b8" }} />
          </button>

          {isProfileOpen && (
            <div
              className="adm-modal"
              style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                width: "14rem", zIndex: 200, borderRadius: "1.25rem",
              }}
            >
              <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9" }}>
                <p style={{ fontSize: "0.8rem", color: "#0f172a" }}>Beka Papiashvili</p>
                <p style={{ fontSize: "0.7rem", color: "#94a3b8" }}>beka@spilo.ge</p>
              </div>
              <div style={{ padding: "0.375rem" }}>
                <Link href="/admin/settings" onClick={() => setIsProfileOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.875rem", borderRadius: "0.75rem", fontSize: "0.75rem", color: "#475569", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <Settings className="w-4 h-4" style={{ color: "#94a3b8" }} />
                  <span>პარამეტრები</span>
                </Link>
                <Link href="/admin/users" onClick={() => setIsProfileOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.875rem", borderRadius: "0.75rem", fontSize: "0.75rem", color: "#475569", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <ShieldCheck className="w-4 h-4" style={{ color: "#94a3b8" }} />
                  <span>ადმინები & როლები</span>
                </Link>
                <Link href="/"
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.875rem", borderRadius: "0.75rem", fontSize: "0.75rem", color: "#6366f1", marginTop: "0.25rem", borderTop: "1px solid #f1f5f9", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f5f3ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Storefront-ზე გადასვლა</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
