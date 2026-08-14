"use client";

import React, { useState, useEffect } from "react";
import { Tag, Plus, Calendar, Percent, CheckCircle2, Trash2 } from "lucide-react";
import { dataService, Promotion } from "@/services/dataService";

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    setPromotions(dataService.getPromotions());
    const unsub = dataService.subscribe(() => {
      setPromotions(dataService.getPromotions());
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">აქციები & ფასდაკლებები</h1>
          <p className="text-xs text-gray-500 mt-1">სეზონური აქციების (Summer Sale, Black Friday) მართვა.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.map((p) => (
          <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full">
                {p.status}
              </span>
              <span className="text-xs font-bold text-blue-600">-{p.discountValue}%</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{p.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{p.description}</p>
            </div>
            <div className="text-[11px] text-gray-400 font-mono">
              თარიღები: {p.startDate} — {p.endDate}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
