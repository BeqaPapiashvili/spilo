"use client";

import React from "react";
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users, ArrowUpRight, Package } from "lucide-react";

const MONTHLY_DATA = [
  { month: "მარ", revenue: 28400, orders: 142 },
  { month: "აპრ", revenue: 34200, orders: 178 },
  { month: "მაი", revenue: 31800, orders: 159 },
  { month: "ივნ", revenue: 42100, orders: 214 },
  { month: "ივლ", revenue: 38900, orders: 195 },
  { month: "აგვ", revenue: 48920, orders: 248 },
];

const TOP_PRODUCTS = [
  { name: "iPhone 15 Pro Max", revenue: 12400, share: 25 },
  { name: "Samsung Galaxy S24", revenue: 9800, share: 20 },
  { name: "MacBook Pro 14", revenue: 8200, share: 17 },
  { name: "AirPods Pro 2", revenue: 6100, share: 12 },
  { name: "Sony WH-1000XM5", revenue: 4900, share: 10 },
];

const maxRevenue = Math.max(...MONTHLY_DATA.map(d => d.revenue));

export default function AdminAnalyticsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem" }}>
        <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}><BarChart3 size={13} /> სისტემა</div>
        <h1 className="adm-page-title">ფინანსური ანალიტიკა & რეპორტები</h1>
        <p className="adm-page-desc">შემოსავლების, კონვერსიების და გაყიდვების დეტალური სტატისტიკა.</p>
      </div>

      {/* KPI Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        {[
          { label: "თვიური შემოსავალი", value: "48 920 ₾", change: "+14.2%", icon: <DollarSign size={17} />, iconBg: "#eef2ff", iconColor: "#6366f1" },
          { label: "კონვერსიის კოეფ.", value: "3.42%", change: "+0.8%", icon: <TrendingUp size={17} />, iconBg: "#f0fdf4", iconColor: "#16a34a" },
          { label: "საშუალო კალათა", value: "347 ₾", change: "+5.1%", icon: <ShoppingBag size={17} />, iconBg: "#fffbeb", iconColor: "#d97706" },
          { label: "ახალი მომხმარებ.", value: "87", change: "+23%", icon: <Users size={17} />, iconBg: "#fdf4ff", iconColor: "#9333ea" },
        ].map((m, i) => (
          <div key={i} className="adm-card" style={{ padding: "1.25rem 1.5rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{m.label}</span>
              <div className="adm-icon-box" style={{ background: m.iconBg, color: m.iconColor }}>{m.icon}</div>
            </div>
            <div className="adm-metric-num" style={{ marginBottom: "0.375rem" }}>{m.value}</div>
            <span style={{ fontSize: "0.72rem", color: "#16a34a", display: "flex", alignItems: "center", gap: "3px" }}>
              <ArrowUpRight size={13} /> {m.change}
            </span>
          </div>
        ))}
      </div>

      {/* Chart + Top Products */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.25rem" }}>

        {/* Bar Chart */}
        <div className="adm-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <div>
              <h3 style={{ fontSize: "0.875rem", color: "#0f172a" }}>ყოველთვიური შემოსავლები</h3>
              <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px" }}>ბოლო 6 თვის დინამიკა</p>
            </div>
            <span className="adm-badge adm-badge-green">+14.2% ზრდა</span>
          </div>

          {/* Visual Bar Chart */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.875rem", height: "150px" }}>
            {MONTHLY_DATA.map((d, i) => {
              const height = Math.round((d.revenue / maxRevenue) * 100);
              const isLast = i === MONTHLY_DATA.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.375rem", height: "100%", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "0.6rem", color: "#94a3b8" }}>{Math.round(d.revenue / 1000)}k</span>
                  <div style={{
                    width: "100%", height: `${height}%`,
                    background: isLast ? "linear-gradient(180deg, #6366f1, #8b5cf6)" : "#eef2ff",
                    borderRadius: "0.375rem 0.375rem 0.125rem 0.125rem",
                    transition: "height 0.6s ease",
                    cursor: "default",
                    minHeight: "8px",
                  }} title={`${d.month}: ${d.revenue.toLocaleString()} ₾`} />
                  <span style={{ fontSize: "0.65rem", color: isLast ? "#6366f1" : "#94a3b8" }}>{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="adm-card" style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "0.875rem", color: "#0f172a" }}>Top 5 პროდუქტი</h3>
            <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px" }}>შემოსავლის მიხედვით</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {TOP_PRODUCTS.map((p, i) => (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "#0f172a" }}>{p.name}</span>
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{p.revenue.toLocaleString()} ₾</span>
                </div>
                <div className="adm-progress-track">
                  <div className="adm-progress-fill" style={{ width: `${p.share}%`, background: i === 0 ? "linear-gradient(90deg, #6366f1, #8b5cf6)" : i === 1 ? "linear-gradient(90deg, #3b82f6, #6366f1)" : "#e0e7ff" }} />
                </div>
                <span style={{ fontSize: "0.6rem", color: "#94a3b8", marginTop: "2px", display: "block" }}>{p.share}% წილი</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
