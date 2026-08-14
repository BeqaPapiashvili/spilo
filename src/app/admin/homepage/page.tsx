"use client";

import React, { useState } from "react";
import { LayoutTemplate, MoveUp, MoveDown, Eye, Save } from "lucide-react";

export default function AdminHomepageCMSPage() {
  const [sections, setSections] = useState([
    { id: "hero", name: "Hero Banner Carousel", enabled: true },
    { id: "categories", name: "Category Cards Carousel", enabled: true },
    { id: "hot_deals", name: "Hot Deals / Flash Sales", enabled: true },
    { id: "featured", name: "Featured Products Section", enabled: true },
    { id: "brands", name: "Popular Brands Bar", enabled: true },
    { id: "recently_viewed", name: "Recently Viewed Carousel", enabled: true },
  ]);

  const toggleSection = (id: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">მთავარი გვერდის მართვა (Homepage CMS)</h1>
          <p className="text-xs text-gray-500 mt-1">სექციების მიმდევრობა, ჩართვა/გამორთვა და ბლოკების მართვა.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-3">
        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">სექციების თანმიმდევრობა</h3>
        <div className="space-y-2">
          {sections.map((sec, idx) => (
            <div key={sec.id} className="p-3.5 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-gray-400">#{idx + 1}</span>
                <span className="text-xs font-bold text-gray-900">{sec.name}</span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={sec.enabled}
                  onChange={() => toggleSection(sec.id)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <span className="text-xs text-gray-600 font-medium">
                  {sec.enabled ? "აქტიური" : "გამორთული"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
