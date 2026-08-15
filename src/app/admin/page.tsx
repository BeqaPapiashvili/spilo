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
  Lock
} from "lucide-react";
import { dataService, AuditLog } from "@/services/dataService";
import { useStore } from "@/store/useStore";
import { Product } from "@/types";

export default function AdminDashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
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
  const { adminUser, orders: storeOrders } = useStore();
  const isSupportAgent = adminUser?.role === "SUPPORT_AGENT";

  useEffect(() => {
    setIsMounted(true);
    setProducts(dataService.getProducts());
    setAuditLogs(dataService.getAuditLogs());

    // Fetch real MySQL aggregated stats
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((resData) => {
        if (resData && resData.success && resData.data) {
          setStats(resData.data);
        }
      })
      .catch(() => {});

    // Fetch real MySQL orders
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
              <span>Spilo E-Commerce Control Center</span>
            </div>
            <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight">
              ადმინისტრაციული მართვის პანელი
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              რეალურ დროში გაყიდვების, შეკვეთების, მარაგებისა და მომხმარებლების ანალიტიკა.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!isSupportAgent && (
              <Link
                href="/admin/products/new"
                className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>ახალი პროდუქტი</span>
              </Link>
            )}

            <Link
              href="/admin/support"
              className="h-11 px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>ცოცხალი ჩატი & მხარდაჭერა</span>
            </Link>

            <Link
              href="/admin/orders"
              className="h-11 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-slate-600" />
              <span>შეკვეთები ({activeOrders.length})</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Bento Grid System Layout (12-Col Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Bento Tile 1: Main Revenue or Support Card (Col 1-8) */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
          {isSupportAgent ? (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Support Agent Workspace</span>
                  </div>
                  <h2 className="text-xl text-slate-900">მომხმარებელთა მხარდაჭერა & ჩატი</h2>
                  <p className="text-xs text-slate-500">
                    მზადყოფნაშია მომხმარებელთა შეკითხვებზე საპასუხოდ და შეკვეთების მოსაძიებლად.
                  </p>
                </div>

                <Link
                  href="/admin/support"
                  className="h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs flex items-center gap-2 transition-colors shrink-0 shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>ჩატში გადასვლა</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
                  <span className="text-xs text-slate-400 block">აქტიური შეკვეთები (ბაზაში)</span>
                  <p className="text-2xl text-slate-900 font-mono">{activeOrders.length}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
                  <span className="text-xs text-slate-400 block">სისტემის რეჟიმი</span>
                  <p className="text-xs text-emerald-600 font-mono font-medium inline-flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>Support Read-Only Mode</span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-400">ჯამური შემოსავალი</span>
                  <p className="text-3xl text-slate-900 font-mono">
                    {isMounted ? `${fmtNum(totalRevenue)} ₾` : "0 ₾"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +18.4% ზრდა
                  </span>
                </div>
              </div>

              {/* Visual Sales Growth Target Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>თვიური მიზანი (200 000 ₾)</span>
                  <span className="font-mono">{Math.min(100, Math.round((totalRevenue / 200000) * 100))}% შესრულებულია</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((totalRevenue / 200000) * 100))}%` }}
                  />
                </div>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-slate-400">საშუალო კალათა (AOV)</span>
                  <p className="text-base text-slate-900 font-mono">{avgOrderValue} ₾</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] text-slate-400">შეკვეთები სულ</span>
                  <p className="text-base text-slate-900 font-mono">{activeOrders.length}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] text-slate-400">მომხმარებლები</span>
                  <p className="text-base text-emerald-600 font-mono">{stats.totalCustomers || 12}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bento Tile 2: Store Status & Health Radar (Col 9-12) */}
        <div className="md:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs text-slate-500">სისტემის სტატუსი</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ონლაინშია
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-slate-700">პროდუქტები კატალოგში</span>
              </div>
              <span className="font-mono text-slate-900">{stats.totalProducts || products.length}</span>
            </div>

            <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-slate-700">მარაგების გაფრთხილება</span>
              </div>
              <span className="font-mono text-amber-600">{lowStockCount}</span>
            </div>

            <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-slate-700">რეგისტრირებული კლიენტები</span>
              </div>
              <span className="font-mono text-purple-600">{stats.totalCustomers || 12}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>ბოლო სინქრონიზაცია</span>
            <span className="font-mono text-slate-600">ახლახანს</span>
          </div>
        </div>

      </div>

      {/* Orders Table Workspace */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg text-slate-900">ბოლო შეკვეთები ({filteredOrders.length})</h2>
            <p className="text-xs text-slate-400">რეალური შეკვეთები MySQL მონაცემთა ბაზიდან</p>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`h-8 px-3 rounded-xl text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                }`}
              >
                {st === "ALL" ? "ყველა" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 font-normal">შეკვეთის #</th>
                  <th className="py-3 px-4 font-normal">მომხმარებელი</th>
                  <th className="py-3 px-4 font-normal">თარიღი</th>
                  <th className="py-3 px-4 font-normal">თანხა</th>
                  <th className="py-3 px-4 font-normal">სტატუსი</th>
                  <th className="py-3 px-4 font-normal text-right">მოქმედება</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredOrders.slice(0, 8).map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-900">{ord.orderNumber || `#${ord.id}`}</td>
                    <td className="py-3.5 px-4">{ord.customerName || ord.name || "მომხმარებელი"}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {ord.createdAt ? ord.createdAt.toString().slice(0, 10) : ord.date || "დღეს"}
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
