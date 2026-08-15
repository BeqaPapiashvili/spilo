"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users, ArrowUpRight, RefreshCw, Package } from "lucide-react";

interface AnalyticsStats {
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalRevenue: number;
  averageOrderValue: number;
  paidOrdersCount: number;
  conversionRate: string;
}

interface MonthlyItem {
  month: string;
  revenue: number;
  orders: number;
}

interface TopProductItem {
  name: string;
  revenue: number;
  share: number;
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats>({
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    paidOrdersCount: 0,
    conversionRate: "0",
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      const data = await res.json();
      if (data.success) {
        if (data.stats) setStats(data.stats);
        if (Array.isArray(data.monthlyData)) setMonthlyData(data.monthlyData);
        if (Array.isArray(data.topProducts)) setTopProducts(data.topProducts);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue), 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}><BarChart3 size={13} /> სისტემა</div>
          <h1 className="adm-page-title">ფინანსური ანალიტიკა & რეპორტები</h1>
          <p className="adm-page-desc">შემოსავლების, შეკვეთების და გაყიდვების დეტალური სტატისტიკა MySQL ბაზიდან.</p>
        </div>
        <button
          type="button"
          onClick={fetchAnalytics}
          disabled={loading}
          className="adm-btn-secondary"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>განახლება</span>
        </button>
      </div>

      {/* KPI Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        {[
          {
            label: "სრული შემოსავალი",
            value: `${stats.totalRevenue.toLocaleString()} ₾`,
            change: `${stats.paidOrdersCount} გადახდილი`,
            icon: <DollarSign size={17} />,
            iconBg: "#eef2ff",
            iconColor: "#6366f1",
          },
          {
            label: "სულ შეკვეთები",
            value: `${stats.totalOrders} შეკვეთა`,
            change: "აქტიური",
            icon: <ShoppingBag size={17} />,
            iconBg: "#f0fdf4",
            iconColor: "#16a34a",
          },
          {
            label: "საშუალო კალათა",
            value: `${stats.averageOrderValue.toLocaleString()} ₾`,
            change: "AOV",
            icon: <TrendingUp size={17} />,
            iconBg: "#fffbeb",
            iconColor: "#d97706",
          },
          {
            label: "მომხმარებლები",
            value: `${stats.totalCustomers}`,
            change: `${stats.totalProducts} პროდუქტი`,
            icon: <Users size={17} />,
            iconBg: "#fdf4ff",
            iconColor: "#9333ea",
          },
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
              <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px" }}>ბოლო 6 თვის დინამიკა (MySQL)</p>
            </div>
            <span className="adm-badge adm-badge-green">სულ: {stats.totalRevenue.toLocaleString()} ₾</span>
          </div>

          {/* Visual Bar Chart */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.875rem", height: "150px" }}>
            {monthlyData.length > 0 ? (
              monthlyData.map((d, i) => {
                const height = Math.max(8, Math.round((d.revenue / maxRevenue) * 100));
                const isLast = i === monthlyData.length - 1;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.375rem", height: "100%", justifyContent: "flex-end" }}>
                    <span style={{ fontSize: "0.6rem", color: "#94a3b8" }}>
                      {d.revenue >= 1000 ? `${(d.revenue / 1000).toFixed(1)}k` : `${d.revenue} ₾`}
                    </span>
                    <div style={{
                      width: "100%", height: `${height}%`,
                      background: isLast ? "linear-gradient(180deg, #6366f1, #8b5cf6)" : "#eef2ff",
                      borderRadius: "0.375rem 0.375rem 0.125rem 0.125rem",
                      transition: "height 0.6s ease",
                      cursor: "default",
                      minHeight: "8px",
                    }} title={`${d.month}: ${d.revenue.toLocaleString()} ₾ (${d.orders} შეკვეთა)`} />
                    <span style={{ fontSize: "0.65rem", color: isLast ? "#6366f1" : "#94a3b8" }}>{d.month}</span>
                  </div>
                );
              })
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", color: "#94a3b8", fontSize: "0.75rem" }}>
                მონაცემები არ არის
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="adm-card" style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "0.875rem", color: "#0f172a" }}>Top 5 პროდუქტი</h3>
            <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px" }}>შემოსავლის მიხედვით</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {topProducts.length > 0 ? (
              topProducts.map((p, i) => (
                <div key={i}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "#0f172a", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{p.revenue.toLocaleString()} ₾</span>
                  </div>
                  <div className="adm-progress-track">
                    <div
                      className="adm-progress-fill"
                      style={{
                        width: `${p.share}%`,
                        background: i === 0 ? "linear-gradient(90deg, #6366f1, #8b5cf6)" : i === 1 ? "linear-gradient(90deg, #3b82f6, #6366f1)" : "#e0e7ff",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.6rem", color: "#94a3b8", marginTop: "2px", display: "block" }}>{p.share}% წილი</span>
                </div>
              ))
            ) : (
              <div style={{ color: "#94a3b8", fontSize: "0.75rem", textAlign: "center", padding: "1rem 0" }}>
                პროდუქტები ვერ მოიძებნა
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
