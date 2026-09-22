"use client";

import { useEffect, useState } from "react";

type Stats = {
  productCount: number;
  orderCount: number;
  unitsSold: number;
  revenue: number;
  topProducts: { title: string; units: number; revenue: number }[];
  lowStock: { id: string; title: string; stock: number }[];
};

export function StoreStats({ storeId }: { storeId: string }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/admin/stores/${encodeURIComponent(storeId)}/stats`);
      const json = await res.json();
      if (json.success) setStats(json.data);
    };
    load();
  }, [storeId]);

  if (!stats) return null;

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 space-y-5 max-w-3xl">
      <h2 className="text-lg text-slate-900">მაღაზიის სტატისტიკა</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-2xl p-3">
          <p className="text-[11px] text-slate-400">პროდუქტები</p>
          <p className="text-xl text-slate-900">{stats.productCount}</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-3">
          <p className="text-[11px] text-slate-400">შეკვეთები</p>
          <p className="text-xl text-slate-900">{stats.orderCount}</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-3">
          <p className="text-[11px] text-slate-400">გაყიდული</p>
          <p className="text-xl text-slate-900">{stats.unitsSold}</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-3">
          <p className="text-[11px] text-slate-400">შემოსავალი</p>
          <p className="text-xl text-slate-900">{stats.revenue} ₾</p>
        </div>
      </div>
      {stats.topProducts.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">ტოპ პროდუქტები</p>
          <ul className="space-y-1.5">
            {stats.topProducts.map((item) => (
              <li key={item.title} className="text-sm text-slate-800 flex justify-between gap-3">
                <span className="truncate">{item.title}</span>
                <span className="text-slate-400 shrink-0">{item.revenue} ₾</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {stats.lowStock.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">დაბალი მარაგი</p>
          <ul className="space-y-1.5">
            {stats.lowStock.map((item) => (
              <li key={item.id} className="text-sm text-slate-800 flex justify-between gap-3">
                <span className="truncate">{item.title}</span>
                <span className="text-[#FF5238]">{item.stock}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
