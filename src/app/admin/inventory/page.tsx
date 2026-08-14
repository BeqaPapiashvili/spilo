"use client";

import React, { useState, useEffect } from "react";
import { Warehouse, Search, Plus, Minus, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { dataService } from "@/services/dataService";
import { Product } from "@/types";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setProducts(dataService.getProducts());
    const unsub = dataService.subscribe(() => {
      setProducts(dataService.getProducts());
    });
    return () => unsub();
  }, []);

  const handleAdjustStock = (product: Product, delta: number, reason: string) => {
    const newStock = Math.max(0, product.stock + delta);
    dataService.saveProduct({
      ...product,
      stock: newStock,
    });
    dataService.logAction(
      "Beka Papiashvili",
      "STOCK_ADJUSTMENT",
      `Product #${product.id}`,
      `მარაგი შეიცვალა (${delta > 0 ? `+${delta}` : delta}): ${product.stock} -> ${newStock} (${reason})`
    );
  };

  const filtered = products.filter((p) =>
    !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">მარაგების კონტროლი & კორექტირება</h1>
          <p className="text-xs text-gray-500 mt-1">პროდუქტების მარაგების სწრაფი კორექტირება და ცვლილებების ისტორია.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ძიება მარაგებში..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 text-xs text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-50/80 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-100">
            <tr>
              <th className="py-3 px-4">პროდუქტი</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4">მიმდინარე მარაგი</th>
              <th className="py-3 px-4">სტატუსი</th>
              <th className="py-3 px-4 text-right">მარაგის კორექტირება</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-gray-900">{p.title}</td>
                <td className="py-3.5 px-4 font-mono text-gray-500">{p.sku || p.code}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900">{p.stock} ცალი</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    p.stock === 0 ? "bg-red-50 text-red-700" : p.stock <= 5 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                  }`}>
                    {p.stock === 0 ? "ამოწურულია" : p.stock <= 5 ? "მცირე მარაგი" : "მარაგშია"}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleAdjustStock(p, -1, "Manual Deduction")}
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 cursor-pointer"
                      title="-1 ცალი"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleAdjustStock(p, 5, "Stock Arrival")}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      +5 ცალი
                    </button>
                    <button
                      onClick={() => handleAdjustStock(p, 10, "Stock Arrival")}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      +10 ცალი
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
