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
    const unsub = dataService.subscribe(() => {
      setPromotions(dataService.getPromotions());
    });
    return () => unsub();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    dataService.savePromotion({
      id: `promo-${Date.now()}`,
      name: name.trim(),
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      description,
      discountType: "percentage",
      discountValue: Number(discountValue),
      startDate,
      endDate,
      status: "ACTIVE",
    });

    setIsModalOpen(false);
    setName("");
    setDescription("");
  };

  const handleDelete = (id: string) => {
    if (confirm("დარწმუნებული ხართ, რომ გსურთ აქციის წაშლა?")) {
      dataService.deletePromotion(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">აქციები & ფასდაკლებები</h1>
          <p className="text-xs text-gray-500 mt-1">სეზონური აქციების (Summer Sale, Black Friday) მართვა.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>ახალი აქცია</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.map((p) => (
          <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3 relative group">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full">
                {p.status}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600">-{p.discountValue}%</span>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded cursor-pointer"
                  title="წაშლა"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{p.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{p.description}</p>
            </div>
            <div className="text-[11px] text-gray-400 font-mono pt-2 border-t border-gray-100">
              თარიღები: {p.startDate} — {p.endDate}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">ახალი აქციის დამატება</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">აქციის დასახელება *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="მაგ: Black Friday 2026"
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-bold mb-1">ფასდაკლების პროცენტი (%) *</label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-bold mb-1">მოკლე აღწერა</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">დაწყების თარიღი</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">დასრულების თარიღი</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200"
                  />
                </div>
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
