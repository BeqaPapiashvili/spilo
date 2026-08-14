"use client";

import React, { useState } from "react";
import { Navigation, Plus, MoveUp, MoveDown, Trash2 } from "lucide-react";

export default function AdminNavigationBuilderPage() {
  const [menuItems, setMenuItems] = useState([
    { id: "1", label: "მობილურები", url: "/categories/mobiles" },
    { id: "2", label: "ტაბები", url: "/categories/tablets" },
    { id: "3", label: "სმარტ საათები", url: "/categories/smartwatches" },
    { id: "4", label: "ლეპტოპები", url: "/categories/laptops" },
    { id: "5", label: "აუდიო სისტემა", url: "/categories/audio-systems" },
    { id: "6", label: "Gaming", url: "/categories/gaming" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ნავიგაციის & MegaMenu მენეჯერი</h1>
          <p className="text-xs text-gray-500 mt-1">ჰედერის მენუს ბმულებისა და თანმიმდევრობის მართვა.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-3">
        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">მეგამენიუს ბმულები</h3>
        <div className="space-y-2">
          {menuItems.map((item, idx) => (
            <div key={item.id} className="p-3 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-gray-400">#{idx + 1}</span>
                <span className="text-xs font-bold text-gray-900">{item.label}</span>
                <span className="text-[10px] text-gray-400 font-mono">({item.url})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
