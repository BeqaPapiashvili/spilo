"use client";

import React, { useState, useEffect } from "react";
import { Ticket, Plus, Trash2, X } from "lucide-react";
import { dataService, Coupon } from "@/services/dataService";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountValue, setDiscountValue] = useState(15);
  const [minOrder, setMinOrder] = useState(100);

  useEffect(() => {
    setCoupons(dataService.getCoupons());
    const unsub = dataService.subscribe(() => {
      setCoupons(dataService.getCoupons());
    });
    return () => unsub();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    dataService.saveCoupon({
      id: `cpn-${Date.now()}`,
      code: code.trim().toUpperCase(),
      discountType: "percentage",
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrder),
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      usedCount: 0,
      status: "ACTIVE",
    });

    setIsModalOpen(false);
    setCode("");
  };

  const handleDelete = (id: string) => {
    if (confirm("დარწმუნებული ხართ, რომ გსურთ კუპონის წაშლა?")) {
      dataService.deleteCoupon(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">კუპონების მართვა</h1>
          <p className="text-xs text-gray-500 mt-1">პრომო კოდების გენერაცია და ლიმიტების მართვა.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>ახალი კუპონი</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-50/80 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-100">
            <tr>
              <th className="py-3 px-4">კუპონის კოდი</th>
              <th className="py-3 px-4">ფასდაკლება</th>
              <th className="py-3 px-4">მინ. შეკვეთა</th>
              <th className="py-3 px-4">გამოყენებული</th>
              <th className="py-3 px-4">სტატუსი</th>
              <th className="py-3 px-4 text-right">მოქმედება</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{c.code}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900">
                  {c.discountType === "percentage" ? `${c.discountValue}%` : `${c.discountValue} ₾`}
                </td>
                <td className="py-3.5 px-4 text-gray-600">{c.minOrderAmount ? `${c.minOrderAmount} ₾` : "უარყოფითი"}</td>
                <td className="py-3.5 px-4 text-gray-600">{c.usedCount} ჯერ</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px]">
                    {c.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">ახალი კუპონის შექმნა</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">პრომო კოდი *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="მაგ: SPILO2026"
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 uppercase font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-bold mb-1">ფასდაკლება (%) *</label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-bold mb-1">მინიმალური შეკვეთის თანხა (₾)</label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold cursor-pointer"
                >
                  შენახვა
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
