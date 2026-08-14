"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  FileText,
  ChevronRight,
  Download
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { OrderRecord, OrderStatus } from "@/types";

export default function AdminOrdersPage() {
  const orders = useStore((state) => state.orders);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchQuery ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.address && order.address.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === "ALL" || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">
            <span>შეკვეთების მართვა</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            შეკვეთები ({filteredOrders.length})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            შეკვეთების სრული ისტორია, სტატუსების მართვა და ინვოისები.
          </p>
        </div>
      </div>

      {/* 2. Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ძიება: შეკვეთა #, მისამართი, გადახდის მეთოდი..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 text-xs text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {["ALL", "მუშავდება", "გზაშია", "ჩაბარებულია", "გაუქმებულია"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedStatus === st
                    ? "bg-gray-900 text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                {st === "ALL" ? "ყველა სტატუსი" : st}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 3. Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50/80 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">შეკვეთა ID</th>
                <th className="py-3 px-4">თარიღი</th>
                <th className="py-3 px-4">პროდუქტები</th>
                <th className="py-3 px-4">თანხა</th>
                <th className="py-3 px-4">გადახდის მეთოდი</th>
                <th className="py-3 px-4">სტატუსი</th>
                <th className="py-3 px-4 text-right">მოქმედება</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">#{ord.id}</td>
                    <td className="py-3.5 px-4 text-gray-500">{ord.date}</td>
                    <td className="py-3.5 px-4 font-medium text-gray-800">
                      {ord.items?.length || 1} ნივთი
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{ord.totalAmount} ₾</td>
                    <td className="py-3.5 px-4 text-gray-600">{ord.paymentMethod}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          (ord.status as string) === "ჩაბარებულია"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : (ord.status as string) === "გზაშია"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : (ord.status as string) === "გაუქმებულია"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium flex items-center gap-1 text-xs"
                        >
                          <Eye className="w-4 h-4" />
                          <span>დეტალები</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-xs">
                    შეკვეთები ვერ მოიძებნა
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
