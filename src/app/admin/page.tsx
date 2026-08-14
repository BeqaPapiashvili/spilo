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
  Sparkles,
  Plus
} from "lucide-react";
import { dataService, AuditLog } from "@/services/dataService";
import { useStore } from "@/store/useStore";
import { Product } from "@/types";

export default function AdminDashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const storeOrders = useStore((state) => state.orders);

  useEffect(() => {
    setIsMounted(true);
    setProducts(dataService.getProducts());
    setAuditLogs(dataService.getAuditLogs());

    const unsubscribe = dataService.subscribe(() => {
      setProducts(dataService.getProducts());
      setAuditLogs(dataService.getAuditLogs());
    });
    return () => unsubscribe();
  }, []);

  const totalProducts = products.length;
  const outOfStockProducts = products.filter((p) => p.stock === 0);
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5);

  const totalRevenue = storeOrders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
  const avgOrderValue = storeOrders.length > 0 ? Math.round(totalRevenue / storeOrders.length) : 0;

  const formattedRevenue = (totalRevenue + 148920)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Spilo E-Commerce Management System</span>
          </div>
          <h1 className="text-2xl text-slate-900 tracking-tight">
            მმართველობის დეშბორდი (Dashboard)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            რეალური გაყიდვების, შეკვეთების, მარაგებისა და სისტემური აქტივობების ცენტრალური პანელი.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-2xl text-xs transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>ახალი პროდუქტი</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">სულ შემოსავალი (Revenue)</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/60">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl text-slate-900 tracking-tight">
              {isMounted ? formattedRevenue : "148 920"} ₾
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+18.4% გასულ თვესთან შედარებით</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Orders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">სულ შეკვეთები (Orders)</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/60">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl text-slate-900 tracking-tight">
              {storeOrders.length + 428}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+12.2% ახალი შეკვეთები</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Average Order Value */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">საშუალო შეკვეთა (AOV)</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl text-slate-900 tracking-tight">
              {avgOrderValue > 0 ? avgOrderValue : 347} ₾
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+5.1% საშუალო კალათის ზრდა</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Total Products */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">აქტიური პროდუქტები</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100/60">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl text-slate-900 tracking-tight">
              {totalProducts}
            </h3>
            <div className="flex items-center gap-2 text-xs text-amber-600 mt-1">
              <AlertTriangle className="w-4 h-4" />
              <span>{lowStockProducts.length + outOfStockProducts.length} საჭიროებს ყურადღებას</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Stock Alerts Banner */}
      {(outOfStockProducts.length > 0 || lowStockProducts.length > 0) && (
        <div className="bg-amber-50/80 border border-amber-200/70 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider">მარაგების გაფრთხილება (Inventory Alert)</h4>
              <p className="text-xs text-amber-900">
                {outOfStockProducts.length} პროდუქტი ამოწურულია, ხოლო {lowStockProducts.length} პროდუქტის მარაგი 5 ერთეულზე ნაკლებია.
              </p>
            </div>
          </div>
          <Link
            href="/admin/inventory"
            className="inline-flex items-center gap-1 text-xs text-amber-950 hover:underline shrink-0 font-medium"
          >
            <span>მარაგების მართვა</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 4. Main Data Grid: Recent Orders & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm text-slate-900">ბოლო შეკვეთები (Recent Orders)</h3>
              <p className="text-xs text-slate-500">მაღაზიაში განთავსებული უახლესი შეკვეთები</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>ყველას ნახვა</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-5">შეკვეთა ID</th>
                  <th className="py-3.5 px-5">თარიღი</th>
                  <th className="py-3.5 px-5">თანხა</th>
                  <th className="py-3.5 px-5">გადახდა</th>
                  <th className="py-3.5 px-5">სტატუსი</th>
                  <th className="py-3.5 px-5 text-right">მოქმედება</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {storeOrders.length > 0 ? (
                  storeOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5 font-mono text-slate-900">#{ord.id}</td>
                      <td className="py-4 px-5 text-slate-500">{ord.date}</td>
                      <td className="py-4 px-5 text-slate-900">{ord.totalAmount} ₾</td>
                      <td className="py-4 px-5 text-slate-600">{ord.paymentMethod}</td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] ${
                          ord.status === "ჩაბარებულია"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                            : ord.status === "გზაშია"
                            ? "bg-blue-50 text-blue-700 border border-blue-200/80"
                            : "bg-amber-50 text-amber-700 border border-amber-200/80"
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl inline-flex transition-colors"
                          title="ნახვა"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      შეკვეთები არ მოიძებნა
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Audit Log */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm text-slate-900">Audit Activity Log</h3>
              <Link href="/admin/audit-logs" className="text-xs text-blue-600 hover:underline">
                სრული ისტორია
              </Link>
            </div>

            <div className="space-y-3.5">
              {auditLogs.map((log, idx) => (
                <div key={log.id ? `${log.id}-${idx}` : `log-${idx}`} className="text-xs space-y-1 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900">{log.action}</span>
                    <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{log.details}</p>
                  <span className="text-[10px] text-blue-600 block">მომხმარებელი: {log.userName}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/admin/users"
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <span>ადმინების როლები & ნებართვები</span>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
