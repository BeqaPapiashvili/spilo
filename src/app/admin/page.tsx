"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  Eye, 
  ChevronRight, 
  Plus, 
  Users, 
  Zap,
  Activity,
  Clock,
  CheckCircle2, 
  Truck, 
  XCircle, 
  FileText, 
  Search, 
  Sparkles, 
  BarChart2, 
  Filter, 
  RefreshCw, 
  Sliders, 
  PieChart, 
  Layers, 
  Check, 
  MessageSquare, 
  Lock,
  History,
  Loader2
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { Product } from "@/types";

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  adminName: string;
  adminEmail: string;
  action: string;
  entity: string;
  target?: string | null;
  details?: string | null;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<{
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    lowStockCount: number;
  }>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockCount: 0,
  });

  const [statusFilter, setStatusFilter] = useState("ALL");
  const { adminUser } = useStore();
  const isSupportAgent = adminUser?.role === "SUPPORT_AGENT";

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [pRes, aRes, sRes, oRes] = await Promise.all([
        fetch("/api/products").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/admin/audit-logs").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/admin/stats").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/orders").then((r) => r.json()).catch(() => ({ success: false })),
      ]);

      if (pRes.success && Array.isArray(pRes.data)) {
        setProducts(pRes.data);
      }
      if (aRes.success && Array.isArray(aRes.data)) {
        setAuditLogs(aRes.data);
      }
      if (sRes.success && sRes.data) {
        setStats(sRes.data);
      }
      if (oRes.success && Array.isArray(oRes.data)) {
        setOrders(oRes.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchDashboardData();
  }, []);

  const activeOrders = orders;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const lowStockCount = stats.lowStockCount || products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const totalRevenue = stats.totalRevenue || activeOrders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);
  const avgOrderValue = activeOrders.length > 0 
    ? Math.round(totalRevenue / activeOrders.length) 
    : 0;

  const fmtNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const filteredOrders = activeOrders.filter((o) => {
    if (statusFilter === "ALL") return true;
    return o.status === statusFilter;
  });

  return (
    <div className="space-y-6">

      {/* Hero Welcome & Quick Command Bar */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>სამართავი პანელი v2.0 • Live MySQL</span>
            </div>
            <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight">
              მოგესალმებით, {adminUser?.name || "ადმინისტრატორო"}! 👋
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              დღეს სისტემაში დაფიქსირებულია {activeOrders.length} შეკვეთა და {products.length} აქტიური პროდუქტი.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="h-11 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">განახლება</span>
            </button>

            {!isSupportAgent && (
              <Link
                href="/admin/products/new"
                className="h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>ახალი პროდუქტი</span>
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* Primary KPI Metric Cards (4 Pillars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">სრული შემოსავალი</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl text-slate-900 font-mono tracking-tight">{fmtNum(totalRevenue)} ₾</h3>
            <p className="text-xs text-slate-400 font-mono">
              საშუალო ჩეკი: {fmtNum(avgOrderValue)} ₾
            </p>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">შეკვეთები</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl text-slate-900 font-mono tracking-tight">{stats.totalOrders || activeOrders.length}</h3>
            <p className="text-xs text-emerald-600 font-mono inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>აქტიური შეკვეთები</span>
            </p>
          </div>
        </div>

        {/* Metric 3: Total Products in Catalog */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">კატალოგი (SKU)</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl text-slate-900 font-mono tracking-tight">{stats.totalProducts || products.length}</h3>
            <p className="text-xs text-slate-400">
              მარაგში: {products.filter((p) => p.stock > 0).length} პროდუქტი
            </p>
          </div>
        </div>

        {/* Metric 4: Registered Customers */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">მომხმარებლები</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl text-slate-900 font-mono tracking-tight">{stats.totalCustomers || 12}</h3>
            <p className="text-xs text-slate-400">
              რეგისტრირებული კლიენტი
            </p>
          </div>
        </div>

      </div>

      {/* Inventory Alerts & System Health Quick View */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm text-slate-900">საყურადღებო მარაგები</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {outOfStockCount > 0 && <span>ამოწურულია: {outOfStockCount} პროდუქტი. </span>}
                {lowStockCount > 0 && <span>მცირე მარაგი (≤5 ცალი): {lowStockCount} პროდუქტი.</span>}
              </p>
            </div>
          </div>

          <Link
            href="/admin/inventory"
            className="h-10 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs inline-flex items-center justify-center gap-1.5 transition-colors shrink-0"
          >
            <span>მარაგების შევსება</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg text-slate-900">ბოლო შეკვეთები</h2>
            <p className="text-xs text-slate-400">უახლესი შეკვეთების სია და სტატუსები</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/orders"
              className="h-9 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>ყველას ნახვა ({activeOrders.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <span>იტვირთება შეკვეთები MySQL ბაზიდან...</span>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">შეკვეთის #</th>
                  <th className="py-3 px-4">მყიდველი</th>
                  <th className="py-3 px-4">თარიღი</th>
                  <th className="py-3 px-4">თანხა</th>
                  <th className="py-3 px-4">სტატუსი</th>
                  <th className="py-3 px-4 text-right">მოქმედება</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredOrders.slice(0, 8).map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-900">{ord.orderNumber || `#${ord.id}`}</td>
                    <td className="py-3.5 px-4">{ord.customerName || ord.name || "მომხმარებელი"}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString("ka-GE") : ord.date || "დღეს"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-900">{Number(ord.totalAmount).toLocaleString()} ₾</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono ${
                        ord.status === "DELIVERED"
                          ? "bg-emerald-50 text-emerald-700"
                          : ord.status === "SHIPPED"
                          ? "bg-blue-50 text-blue-700"
                          : ord.status === "CANCELLED"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {ord.status || "PENDING"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ნახვა</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            შეკვეთები ვერ მოიძებნა
          </div>
        )}
      </div>

    </div>
  );
}
