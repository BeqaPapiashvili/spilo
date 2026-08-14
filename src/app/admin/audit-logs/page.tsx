"use client";

import React, { useState, useEffect } from "react";
import { History, Search, Shield, Package, ShoppingBag, Tag, Settings } from "lucide-react";
import { dataService, AuditLog } from "@/services/dataService";

const ACTION_ICON: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  PRODUCT_SAVE: { icon: <Package size={13} />, color: "#6366f1", bg: "#eef2ff" },
  ORDER_STATUS_UPDATE: { icon: <ShoppingBag size={13} />, color: "#16a34a", bg: "#f0fdf4" },
  PROMOTION_SAVE: { icon: <Tag size={13} />, color: "#d97706", bg: "#fffbeb" },
  STOCK_ADJUSTMENT: { icon: <Package size={13} />, color: "#d97706", bg: "#fffbeb" },
  SETTINGS_UPDATE: { icon: <Settings size={13} />, color: "#64748b", bg: "#f8fafc" },
  DEFAULT: { icon: <Shield size={13} />, color: "#6366f1", bg: "#eef2ff" },
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLogs(dataService.getAuditLogs());
    const unsub = dataService.subscribe(() => setLogs(dataService.getAuditLogs()));
    return () => unsub();
  }, []);

  const filtered = logs.filter(l =>
    !searchQuery || l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem" }}>
        <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}><History size={13} /> სისტემა</div>
        <h1 className="adm-page-title">Audit Log — მოქმედებების ისტორია</h1>
        <p className="adm-page-desc">ადმინისტრატორების ყველა ცვლილებისა და მოქმედებების სრული უსაფრთხოების ჟურნალი.</p>
      </div>

      {/* Search */}
      <div className="adm-card" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ position: "relative", maxWidth: "24rem" }}>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="ძიება ისტორიაში..." className="adm-search-input" />
          <Search size={14} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Log List */}
      <div className="adm-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>მოქმედება</th>
                <th>დეტალები</th>
                <th>ობიექტი</th>
                <th>ადმინი</th>
                <th>თარიღი & დრო</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((log, idx) => {
                const style = ACTION_ICON[log.action] || ACTION_ICON.DEFAULT;
                return (
                  <tr key={log.id ? `${log.id}-${idx}` : `log-${idx}`}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem", background: style.bg, color: style.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {style.icon}
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "#0f172a", fontFamily: "monospace" }}>{log.action}</span>
                      </div>
                    </td>
                    <td style={{ color: "#475569", maxWidth: "260px" }}>{log.details}</td>
                    <td style={{ fontFamily: "monospace", color: "#94a3b8", fontSize: "0.7rem" }}>{log.entity || "—"}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: "1.5rem", height: "1.5rem", borderRadius: "0.375rem", background: "linear-gradient(135deg, #4f46e5, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", color: "#fff" }}>
                          {log.userName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span style={{ fontSize: "0.73rem", color: "#475569" }}>{log.userName}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: "0.7rem", color: "#94a3b8", fontFamily: "monospace", whiteSpace: "nowrap" }}>{log.timestamp}</td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "0.8rem" }}>ისტორია ვერ მოიძებნა</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
