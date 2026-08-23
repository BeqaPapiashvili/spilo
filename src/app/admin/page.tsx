"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Loader2,
  Tag,
  Image as ImageIcon,
  ShieldCheck,
  Headphones,
  ArrowRight
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
    fetchDashboardData();
  }, []);

  const activeOrders = orders;
  const outOfStockCount = useMemo(() => products.filter((p) => p.stock === 0).length, [products]);
  const lowStockCount = useMemo(() => products.filter((p) => p.stock > 0 && p.stock <= 5).length, [products]);
  const totalRevenue = useMemo(() => {
    if (stats.totalRevenue) return stats.totalRevenue;
    return activeOrders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((s, o) => s + Number(o.totalAmount || 0), 0);
  }, [stats.totalRevenue, activeOrders]);

  const avgOrderValue = activeOrders.length > 0 
    ? Math.round(totalRevenue / activeOrders.length) 
    : 0;

  const fmtNum = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  // Order status counts
  const orderStats = useMemo(() => {
    const processing = activeOrders.filter((o) => o.status === "PROCESSING" || o.status === "მუშავდება" || !o.status).length;
    const shipped = activeOrders.filter((o) => o.status === "SHIPPED" || o.status === "გზაშია").length;
    const delivered = activeOrders.filter((o) => o.status === "DELIVERED" || o.status === "ჩაბარებულია").length;
    const cancelled = activeOrders.filter((o) => o.status === "CANCELLED" || o.status === "გაუქმებულია").length;
    return { processing, shipped, delivered, cancelled };
  }, [activeOrders]);

  return (
    <div className="space-y-6 pb-20">

      {/* 1. Hero Welcome & Quick Action Bar */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-zinc-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF5F2] text-[#FF5238] border border-[#FED7CC] rounded-full text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spilo Control Center • Live Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-zinc-900 tracking-tight">
            მოგესალმებით, {adminUser?.name || "ადმინისტრატორო"}! 👋
          </h1>
          <p className="text-xs md:text-sm text-zinc-500">
            სისტემაში დაფიქსირებულია {activeOrders.length} შეკვეთა, {products.length} პროდუქტი და {stats.totalCustomers || 12} მომხმარებელი.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="h-11 px-4 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs flex items-center gap-2 transition-colors cursor-pointer"
            title="განახლება"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#FF5238]" : ""}`} />
            <span className="hidden sm:inline">განახლება</span>
          </button>

          {!isSupportAgent && (
            <Link
              href="/admin/products/new"
              className="h-11 px-5 rounded-2xl bg-[#FF5238] hover:bg-[#EA3A20] text-white text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>ახალი პროდუქტი</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Primary KPI Metric Cards (4 Pillars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs space-y-3 hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">სრული შემოსავალი (LTV)</span>
            <div className="w-10 h-10 rounded-2xl bg-[#FFF5F2] text-[#FF5238] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl text-zinc-900 font-mono tracking-tight">{fmtNum(Math.round(totalRevenue))} ₾</h3>
            <p className="text-[11px] text-zinc-400 font-mono">
              საშუალო ჩეკი: {fmtNum(avgOrderValue)} ₾
            </p>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs space-y-3 hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">სულ შეკვეთები</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl text-zinc-900 font-mono tracking-tight">{stats.totalOrders || activeOrders.length}</h3>
            <p className="text-[11px] text-emerald-600 font-mono inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{orderStats.delivered} ჩაბარებული</span>
            </p>
          </div>
        </div>

        {/* Metric 3: Total Products in Catalog */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs space-y-3 hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">პროდუქტების კატალოგი</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl text-zinc-900 font-mono tracking-tight">{stats.totalProducts || products.length}</h3>
            <p className="text-[11px] text-zinc-400">
              მარაგშია: {products.filter((p) => p.stock > 0).length} SKU
            </p>
          </div>
        </div>

        {/* Metric 4: Registered Customers */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xs space-y-3 hover:border-zinc-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">მომხმარებლების ბაზა</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl text-zinc-900 font-mono tracking-tight">{stats.totalCustomers || 12}</h3>
            <p className="text-[11px] text-zinc-400">
              რეგისტრირებული ანგარიში
            </p>
          </div>
        </div>

      </div>

      {/* 3. Quick Access Modules Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "პროდუქტები", href: "/admin/products", icon: Package, count: `${products.length}`, color: "hover:border-[#FF5238] group-hover:text-[#FF5238]" },
          { label: "შეკვეთები", href: "/admin/orders", icon: ShoppingBag, count: `${activeOrders.length}`, color: "hover:border-emerald-500" },
          { label: "მხარდაჭერის ჩათი", href: "/admin/support", icon: Headphones, count: "LIVE", color: "hover:border-sky-500" },
          { label: "მომხმარებლები", href: "/admin/customers", icon: Users, count: `${stats.totalCustomers || 12}`, color: "hover:border-amber-500" },
          { label: "ბანერები", href: "/admin/banners", icon: ImageIcon, count: "სლაიდერი", color: "hover:border-purple-500" },
          { label: "აქციები & კუპონები", href: "/admin/promotions", icon: Tag, count: "აქციები", color: "hover:border-pink-500" },
        ].map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <Link
              key={idx}
              href={mod.href}
              className={`p-4 bg-white rounded-2xl border border-zinc-200/80 shadow-xs hover:shadow-2xs transition-all flex flex-col justify-between gap-3 group ${mod.color}`}
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 group-hover:bg-[#FFF5F2] group-hover:text-[#FF5238] transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-zinc-400 group-hover:text-zinc-600">
                  {mod.count}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-800 group-hover:text-zinc-900 font-medium">
                  {mod.label}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* 4. Inventory Alerts Banner (If Low or Out of Stock) */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm text-zinc-900">საყურადღებო მარაგები</h3>
              <p className="text-xs text-zinc-600 mt-0.5">
                {outOfStockCount > 0 && <span>ამოწურულია: <strong>{outOfStockCount}</strong> პროდუქტი. </span>}
                {lowStockCount > 0 && <span>მცირე მარაგი (≤5 ცალი): <strong>{lowStockCount}</strong> პროდუქტი.</span>}
              </p>
            </div>
          </div>

          <Link
            href="/admin/products"
            className="h-10 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs inline-flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
          >
            <span>კატალოგის გადამოწმება</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 5. Two-Column Dashboard Section: Recent Orders & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Orders Live Stream (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-7 border border-zinc-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div>
              <h2 className="text-base text-zinc-900">უახლესი შეკვეთები</h2>
              <p className="text-xs text-zinc-400">შეკვეთების რეალურ დროში განახლება</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-[#FF5238] hover:underline flex items-center gap-1"
            >
              <span>ყველა ({activeOrders.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#FF5238] mx-auto mb-2" />
              <span>იტვირთება შეკვეთები...</span>
            </div>
          ) : activeOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 text-[10px] uppercase">
                    <th className="py-2.5 px-3 font-normal">შეკვეთა #</th>
                    <th className="py-2.5 px-3 font-normal">მყიდველი</th>
                    <th className="py-2.5 px-3 font-normal">თანხა</th>
                    <th className="py-2.5 px-3 font-normal">სტატუსი</th>
                    <th className="py-2.5 px-3 font-normal text-right">დეტალები</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {activeOrders.slice(0, 6).map((ord) => (
                    <tr key={ord.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono text-zinc-900">
                        {ord.orderNumber || `#${ord.id}`}
                      </td>
                      <td className="py-3 px-3 text-zinc-700 truncate max-w-[140px]">
                        {ord.customerName || "მომხმარებელი"}
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-900">
                        {Number(ord.totalAmount).toFixed(0)} ₾
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                          ord.status === "DELIVERED" || ord.status === "ჩაბარებულია"
                            ? "bg-emerald-50 text-emerald-700"
                            : ord.status === "SHIPPED" || ord.status === "გზაშია"
                            ? "bg-sky-50 text-sky-700"
                            : ord.status === "CANCELLED" || ord.status === "გაუქმებულია"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {ord.status || "მუშავდება"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="p-1 text-[#FF5238] hover:bg-[#FFF5F2] rounded-lg inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-zinc-400 text-xs">
              შეკვეთები არ არის
            </div>
          )}
        </div>

        {/* Right Column: System Audit Logs Stream (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-7 border border-zinc-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div>
              <h2 className="text-base text-zinc-900">აქტივობის ჟურნალი</h2>
              <p className="text-xs text-zinc-400">ადმინისტრატორების ბოლო მოქმედებები</p>
            </div>
            <Link
              href="/admin/audit-logs"
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5" />
              <span>სრული</span>
            </Link>
          </div>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {auditLogs && auditLogs.length > 0 ? (
              auditLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-900 font-medium">{log.adminName || log.adminEmail}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {new Date(log.createdAt).toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-zinc-600 text-[11px] leading-snug">{log.details || log.action}</p>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-zinc-400">
                აქტივობის ჩანაწერები არ არის
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
