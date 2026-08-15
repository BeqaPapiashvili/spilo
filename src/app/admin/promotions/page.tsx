"use client";

import React, { useState, useEffect } from "react";
import { Tag, Plus, Calendar, Percent, Trash2, X, Check } from "lucide-react";
import { dataService, Promotion } from "@/services/dataService";

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountValue, setDiscountValue] = useState(20);
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-09-01");

  useEffect(() => {
    setPromotions(dataService.getPromotions());
    const unsub = dataService.subscribe(() => setPromotions(dataService.getPromotions()));
    return () => unsub();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    dataService.savePromotion({ id: `promo-${Date.now()}`, name: name.trim(), slug: name.toLowerCase().replace(/\s+/g, "-"), description, discountType: "percentage", discountValue: Number(discountValue), startDate, endDate, status: "ACTIVE" });
    setIsModalOpen(false); setName(""); setDescription("");
  };
  const handleDelete = (id: string) => { if (confirm("აქციის წაშლა?")) dataService.deletePromotion(id); };

  return (
    <div className="space-y-6">

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
            <Tag className="w-3.5 h-3.5" />
            <span>მარკეტინგი</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight">
            აქციები & ფასდაკლებები ({promotions.length})
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            სეზონური და სპეციალური ფასდაკლებების სრული მართვა.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ახალი აქციის დამატება</span>
        </button>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {promotions.map((promo) => (
          <div key={promo.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Percent className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                  promo.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600"
                }`}>
                  {promo.status === "ACTIVE" ? "აქტიური" : "არააქტიური"}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(promo.id)}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm text-slate-900">{promo.name}</h3>
              <p className="text-xs text-slate-400">{promo.description || "—"}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-2xl text-purple-600 font-mono">-{promo.discountValue}%</span>
              <div className="text-right text-[10px] text-slate-400 font-mono space-y-0.5">
                <div className="flex items-center gap-1 justify-end"><Calendar className="w-3 h-3 text-slate-400" /> {promo.startDate}</div>
                <div className="flex items-center gap-1 justify-end"><Calendar className="w-3 h-3 text-slate-400" /> {promo.endDate}</div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Card */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-50 hover:bg-purple-50/50 rounded-3xl border-2 border-dashed border-slate-200 hover:border-purple-300 p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all min-h-[180px]"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs text-purple-600">ახალი აქცია</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 border border-slate-100 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base text-slate-900">ახალი აქციის შექმნა</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1">აქციის სახელი</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="მაგ: Summer Sale 2026"
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">ფასდაკლების %</label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs transition-colors cursor-pointer shadow-xs"
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
