"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, ShoppingBag, DollarSign, Package, AlertTriangle, 
  ArrowUpRight, Eye, ChevronRight, Plus, Users, Zap
} from "lucide-react";
import { dataService, AuditLog } from "@/services/dataService";
import { useStore } from "@/store/useStore";
import { Product } from "@/types";

export default function AdminDashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const storeOrders = useStore((state) => state.orders);

  useEffect(() => {
    setIsMounted(true);
    setProducts(dataService.getProducts());
    setAuditLogs(dataService.getAuditLogs());

    fetch("/api/orders")
      .then((res) => res.json())
      .then((resData) => {
        if (resData && resData.success && Array.isArray(resData.data)) {
          setOrders(resData.data);
        } else {
          setOrders(storeOrders);
        }
      })
      .catch(() => setOrders(storeOrders));

    const unsub = dataService.subscribe(() => {
      setProducts(dataService.getProducts());
      setAuditLogs(dataService.getAuditLogs());
    });
    return () => unsub();
  }, [storeOrders]);

  const activeOrders = orders.length > 0 ? orders : storeOrders;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const totalRevenue = activeOrders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);
  const avgOrderValue = activeOrders.length > 0 
    ? Math.round(totalRevenue / activeOrders.length) 
    : 0;

  const fmtNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const metrics = [
    {
      label: "სულ შემოსავალი",
      value: isMounted ? `${fmtNum(totalRevenue)} ₾` : "148 920 ₾",
      change: "+18.4%",
      sub: "გასულ თვესთან შედარებით",
      iconBg: "#eef2ff",
      iconColor: "#6366f1",
      icon: <DollarSign size={18} />,
      up: true,
    },
    {
      label: "სულ შეკვეთები",
      value: storeOrders.length + 428,
      change: "+12.2%",
      sub: "ახალი შეკვეთები",
      iconBg: "#f0fdf4",
      iconColor: "#16a34a",
      icon: <ShoppingBag size={18} />,
      up: true,
    },
    {
      label: "საშუალო შეკვეთა (AOV)",
      value: `${avgOrderValue} ₾`,
      change: "+5.1%",
      sub: "საშუალო კალათა",
      iconBg: "#fffbeb",
      iconColor: "#d97706",
      icon: <TrendingUp size={18} />,
      up: true,
    },
    {
      label: "პროდუქტები",
      value: products.length,
      change: `${lowStockCount + outOfStockCount}`,
      sub: "საჭიროებს ყურადღებას",
      iconBg: "#fef2f2",
      iconColor: "#dc2626",
      icon: <Package size={18} />,
      up: false,
    },
  ];

  const statusStyle = (status: string) => {
    if (status === "ჩაბარებულია") return "adm-badge adm-badge-green";
    if (status === "გზაშია") return "adm-badge adm-badge-blue";
    return "adm-badge adm-badge-amber";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Page header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}>
            <Zap size={13} />
            <span>Spilo Admin Panel · Dashboard</span>
          </div>
          <h1 className="adm-page-title">მმართველობის დეშბორდი</h1>
          <p className="adm-page-desc">გაყიდვები, შეკვეთები, მარაგები და სისტემური სტატისტიკა</p>
        </div>
        <Link href="/admin/products/new" className="adm-btn-primary">
          <Plus size={15} />
          <span>ახალი პროდუქტი</span>
        </Link>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        {metrics.map((m, i) => (
          <div key={i} className="adm-card" style={{ padding: "1.25rem 1.5rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.875rem" }}>
              <span style={{ fontSize: "0.72rem", color: "#94a3b8", letterSpacing: "0.01em" }}>{m.label}</span>
              <div className="adm-icon-box" style={{ background: m.iconBg, color: m.iconColor }}>
                {m.icon}
              </div>
            </div>
            <div className="adm-metric-num" style={{ marginBottom: "0.375rem" }}>{m.value}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.72rem", color: m.up ? "#16a34a" : "#dc2626" }}>
              {m.up ? <ArrowUpRight size={13} /> : <AlertTriangle size={12} />}
              <span style={{ color: m.up ? "#16a34a" : "#dc2626" }}>{m.change}</span>
              <span style={{ color: "#94a3b8" }}>{m.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Stock Alert */}
      {(outOfStockCount > 0 || lowStockCount > 0) && (
        <div className="adm-alert adm-alert-amber" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div className="adm-icon-box" style={{ background: "#fef3c7", color: "#d97706" }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#92400e", marginBottom: "2px" }}>მარაგების გაფრთხილება</p>
              <p style={{ fontSize: "0.7rem", color: "#a16207" }}>
                {outOfStockCount} პროდუქტი ამოწურულია · {lowStockCount} პროდუქტი ≤5 ერთეული
              </p>
            </div>
          </div>
          <Link href="/admin/inventory" style={{ fontSize: "0.72rem", color: "#92400e", display: "flex", alignItems: "center", gap: "4px" }}>
            მარაგების მართვა <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* Orders + Audit log */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.25rem" }} className="flex-col lg:grid">

        {/* Orders table */}
        <div className="adm-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: "0.875rem", color: "#0f172a" }}>ბოლო შეკვეთები</h3>
              <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px" }}>უახლესი შეკვეთები მაღაზიაში</p>
            </div>
            <Link href="/admin/orders" style={{ fontSize: "0.72rem", color: "#6366f1", display: "flex", alignItems: "center", gap: "4px" }}>
              ყველა <ChevronRight size={13} />
            </Link>
          </div>
          <div style={{ overflowX: "auto", flex: 1 }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>შეკვეთა ID</th>
                  <th>თარიღი</th>
                  <th>თანხა</th>
                  <th>გადახდა</th>
                  <th>სტატუსი</th>
                  <th style={{ textAlign: "right" }}>მოქმედება</th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.length > 0 ? (
                  activeOrders.slice(0, 10).map((ord) => (
                    <tr key={ord.id || ord.orderNumber}>
                      <td style={{ fontFamily: "monospace", color: "#0f172a" }}>#{ord.orderNumber || ord.id}</td>
                      <td style={{ color: "#64748b" }}>
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString("ka-GE") : ord.date || "ახალი"}
                      </td>
                      <td style={{ color: "#0f172a" }}>{ord.totalAmount} ₾</td>
                      <td style={{ color: "#64748b" }}>{ord.paymentMethod}</td>
                      <td><span className={statusStyle(ord.status)}>{ord.status === "PENDING" ? "მუშავდება" : ord.status}</span></td>
                      <td style={{ textAlign: "right" }}>
                        <Link href={`/admin/orders/${ord.id}`} className="adm-icon-btn adm-icon-btn-blue">
                          <Eye size={15} />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "0.75rem" }}>
                      შეკვეთები ჯერ არ არის
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log */}
        <div className="adm-card" style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "0.875rem", color: "#0f172a" }}>Audit Activity</h3>
            <Link href="/admin/audit-logs" style={{ fontSize: "0.72rem", color: "#6366f1" }}>სრული →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {auditLogs.map((log, idx) => (
              <div key={log.id ? `${log.id}-${idx}` : `log-${idx}`} style={{ paddingBottom: "0.875rem", borderBottom: "1px solid #f8fafc" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "#0f172a", lineHeight: 1.3 }}>{log.action}</p>
                  <span style={{ fontSize: "0.6rem", color: "#94a3b8", flexShrink: 0 }}>{log.timestamp}</span>
                </div>
                <p style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "3px" }}>{log.details}</p>
                <span style={{ fontSize: "0.65rem", color: "#6366f1", display: "block", marginTop: "4px" }}>{log.userName}</span>
              </div>
            ))}
          </div>
          <Link href="/admin/users" className="adm-btn-secondary" style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}>
            ადმინები & როლები
          </Link>
        </div>
      </div>

    </div>
  );
}
