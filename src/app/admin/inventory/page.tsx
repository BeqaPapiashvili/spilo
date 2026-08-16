"use client";

import React, { useState, useEffect } from "react";
import { Warehouse, Search, Plus, Minus, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Product } from "@/types";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/products");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error("AdminInventoryPage: Failed to load products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAdjust = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    setUpdatingId(product.id);
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
        );
      } else {
        alert(json.error || "მარაგის განახლება ვერ მოხერხდა");
      }
    } catch (err) {
      console.error("Failed to adjust stock:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = products.filter((p) =>
    !searchQuery ||
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brandName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const inStockCount = products.filter((p) => p.stock > 5).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
            <Warehouse className="w-3.5 h-3.5" />
            <span>ოპერაციები</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight">
            მარაგების კონტროლი & კორექტირება
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            პროდუქტების მარაგების სწრაფი კორექტირება (+/-) და MySQL მონაცემთა ბაზის მყისიერი განახლება.
          </p>
        </div>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">მარაგშია (&gt;5)</p>
            <p className="text-2xl text-slate-900">{inStockCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">მცირე მარაგი (≤5)</p>
            <p className="text-2xl text-slate-900">{lowStockCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">ამოწურულია (0)</p>
            <p className="text-2xl text-slate-900">{outOfStockCount}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ძებნა: სახელი, SKU, ბრენდი..."
            className="w-full h-10 pl-9 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/50 text-[11px] text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">პროდუქტი</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">კატეგორია</th>
                <th className="py-3.5 px-4">ფასი</th>
                <th className="py-3.5 px-4">მიმდინარე მარაგი</th>
                <th className="py-3.5 px-4 text-right">მარაგის სწრაფი კორექტირება</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-xl shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3.5 bg-slate-200 rounded-md w-36" />
                          <div className="h-2.5 bg-slate-100 rounded-md w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 bg-slate-200 rounded-md w-20" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-5 bg-slate-100 rounded-lg w-24" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 bg-slate-200 rounded-md w-16" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-6 bg-slate-200 rounded-full w-20" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-8 h-8 bg-slate-200 rounded-xl" />
                        <div className="w-8 h-8 bg-slate-200 rounded-xl" />
                        <div className="w-10 h-8 bg-slate-200 rounded-xl" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 text-xs">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-slate-700">პროდუქტები ვერ მოიძებნა</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      საძიებო პარამეტრებით პროდუქტები არ მოიძებნა.
                    </p>
                    {searchQuery.trim() !== "" && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="mt-3.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span>ძიების გასუფთავება</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isUpdating = updatingId === p.id;
                  const prodImg = p.images?.[0] || p.image || "/placeholder.png";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prodImg}
                            alt={p.title}
                            className="w-10 h-10 object-contain rounded-xl bg-white border border-slate-200 p-1 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-slate-900 truncate max-w-[240px] leading-tight">{p.title}</p>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">{p.sku || "-"}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-[11px] text-slate-700">
                          {p.categoryName || p.categoryId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">₾{p.discountPrice || p.price}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs border ${
                          p.stock === 0
                            ? "bg-red-50 text-red-700 border-red-200"
                            : p.stock <= 5
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {p.stock} ცალი
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            disabled={isUpdating || p.stock === 0}
                            onClick={() => handleAdjust(p, -1)}
                            className="w-8 h-8 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="-1 ცალი"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleAdjust(p, 1)}
                            className="w-8 h-8 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer disabled:opacity-30 transition-colors"
                            title="+1 ცალი"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleAdjust(p, 10)}
                            className="px-2.5 h-8 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs flex items-center justify-center cursor-pointer disabled:opacity-30 transition-colors"
                            title="+10 ცალი"
                          >
                            +10
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
