"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Eye, ShoppingBag, ChevronRight } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function AdminOrdersPage() {
  const orders = useStore((state) => state.orders);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const filtered = orders.filter((o) => {
    const matchSearch = !searchQuery || o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = selectedStatus === "ALL" || o.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const statuses = ["ALL", "მუშავდება", "გზაშია", "ჩაბარებულია", "გაუქმებულია"];

  const statusBadge = (status: string) => {
    if (status === "ჩაბარებულია") return <span className="adm-badge adm-badge-green">{status}</span>;
    if (status === "გზაშია") return <span className="adm-badge adm-badge-blue">{status}</span>;
    if (status === "გაუქმებულია") return <span className="adm-badge adm-badge-red">{status}</span>;
    return <span className="adm-badge adm-badge-amber">{status}</span>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem" }}>
        <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}>
          <ShoppingBag size={13} /> გაყიდვების მართვა
        </div>
        <h1 className="adm-page-title">შეკვეთები ({filtered.length})</h1>
        <p className="adm-page-desc">შეკვეთების სრული ისტორია, სტატუსების მართვა და ინვოისები.</p>
      </div>

      {/* Filters */}
      <div className="adm-card" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="ძიება: შეკვეთა #, გადახდის მეთოდი..." className="adm-search-input" />
            <Search size={14} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
          </div>
          <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
            {statuses.map(s => (
              <button key={s} onClick={() => setSelectedStatus(s)}
                className={selectedStatus === s ? "adm-btn-primary" : "adm-btn-secondary"}
                style={{ padding: "0.45rem 0.875rem", fontSize: "0.72rem" }}
              >
                {s === "ALL" ? "ყველა" : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="adm-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>შეკვეთა ID</th>
                <th>თარიღი</th>
                <th>მისამართი</th>
                <th>გადახდა</th>
                <th>თანხა</th>
                <th>სტატუსი</th>
                <th style={{ textAlign: "right" }}>მოქმედება</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: "monospace", color: "#6366f1" }}>#{o.id}</td>
                  <td style={{ color: "#64748b" }}>{o.date}</td>
                  <td style={{ color: "#475569", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.address || "—"}</td>
                  <td style={{ color: "#475569" }}>{o.paymentMethod}</td>
                  <td style={{ color: "#0f172a" }}>{o.totalAmount} ₾</td>
                  <td>{statusBadge(o.status)}</td>
                  <td style={{ textAlign: "right" }}>
                    <Link href={`/admin/orders/${o.id}`} className="adm-icon-btn adm-icon-btn-blue">
                      <Eye size={14} />
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "0.8rem" }}>შეკვეთები ვერ მოიძებნა</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
