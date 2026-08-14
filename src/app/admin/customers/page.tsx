"use client";

import React, { useState } from "react";
import { Search, Users, Mail, Phone, ShoppingBag, TrendingUp } from "lucide-react";

const MOCK_CUSTOMERS = [
  { id: "c1", name: "Beka Papiashvili", email: "beka@spilo.ge", phone: "+995 599 12 34 56", orderCount: 5, totalSpent: 7890, regDate: "12 იანვარი, 2026", status: "vip" },
  { id: "c2", name: "Nino Beridze", email: "nino@gmail.com", phone: "+995 595 98 76 54", orderCount: 2, totalSpent: 2450, regDate: "15 თებერვალი, 2026", status: "active" },
  { id: "c3", name: "Giorgi Kapanadze", email: "giorgi.k@outlook.com", phone: "+995 577 33 22 11", orderCount: 8, totalSpent: 14200, regDate: "03 მარტი, 2026", status: "vip" },
  { id: "c4", name: "Mariam Tsiklauri", email: "mariam@gmail.com", phone: "+995 591 44 55 66", orderCount: 1, totalSpent: 890, regDate: "20 მაისი, 2026", status: "active" },
  { id: "c5", name: "Davit Kvaratskhelia", email: "davit.k@gmail.com", phone: "+995 577 11 22 33", orderCount: 3, totalSpent: 4560, regDate: "07 ივნისი, 2026", status: "active" },
];

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = MOCK_CUSTOMERS.filter(c =>
    !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = MOCK_CUSTOMERS.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}><Users size={13} /> გაყიდვების მართვა</div>
          <h1 className="adm-page-title">მომხმარებლები ({filtered.length})</h1>
          <p className="adm-page-desc">რეგისტრირებული მომხმარებლები, შეკვეთები და ჯამური დანახარჯები.</p>
        </div>
        <div style={{ display: "flex", gap: "0.875rem" }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.65rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>სულ კლიენტების შემოსავალი</p>
            <p style={{ fontSize: "1.25rem", color: "#0f172a", letterSpacing: "-0.02em" }}>{totalRevenue.toLocaleString()} ₾</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="adm-card" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ position: "relative", maxWidth: "24rem" }}>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="ძიება: სახელი, ელ-ფოსტა..." className="adm-search-input" />
          <Search size={14} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Table */}
      <div className="adm-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>მომხმარებელი</th>
                <th>კონტაქტი</th>
                <th>რეგისტრაცია</th>
                <th>შეკვეთები</th>
                <th>ჯამური დანახარჯი</th>
                <th>სტატუსი</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "linear-gradient(135deg, #eef2ff, #e0e7ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "#6366f1", flexShrink: 0 }}>
                        {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <span style={{ fontSize: "0.8rem", color: "#0f172a" }}>{c.name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.73rem", color: "#475569", display: "flex", alignItems: "center", gap: "4px" }}><Mail size={11} style={{ color: "#94a3b8" }} />{c.email}</span>
                      <span style={{ fontSize: "0.73rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}><Phone size={11} style={{ color: "#94a3b8" }} />{c.phone}</span>
                    </div>
                  </td>
                  <td style={{ color: "#64748b", fontSize: "0.73rem" }}>{c.regDate}</td>
                  <td>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", color: "#0f172a" }}>
                      <ShoppingBag size={13} style={{ color: "#6366f1" }} /> {c.orderCount} შეკვეთა
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem", color: "#0f172a" }}>{c.totalSpent.toLocaleString()} ₾</span>
                  </td>
                  <td>
                    {c.status === "vip"
                      ? <span className="adm-badge adm-badge-purple">VIP</span>
                      : <span className="adm-badge adm-badge-green">აქტიური</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
