"use client";

import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Plus, Edit3, Trash2 } from "lucide-react";
import { dataService, Banner } from "@/services/dataService";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    setBanners(dataService.getBanners());
    const unsub = dataService.subscribe(() => {
      setBanners(dataService.getBanners());
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ბანერების მართვა</h1>
          <p className="text-xs text-gray-500 mt-1">Hero სლაიდერისა და სარეკლამო ბანერების მართვა.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((b) => (
          <div key={b.id} className="bg-white border border-gray-200/80 rounded-2xl p-4 space-y-3 shadow-xs">
            <img src={b.imageDesktop} alt={b.title} className="w-full h-36 object-cover rounded-xl bg-gray-50" />
            <div>
              <h4 className="text-sm font-bold text-gray-900">{b.title}</h4>
              <p className="text-xs text-gray-500">{b.subtitle}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
              <span>პოზიცია: {b.position}</span>
              <span className="text-emerald-600 font-semibold">{b.isActive ? "აქტიური" : "გაფილტრული"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
