"use client";

import React, { useState } from "react";
import { Globe, Edit3, Save } from "lucide-react";

export default function AdminCMSPagesPage() {
  const [pages, setPages] = useState([
    { id: "about", title: "ჩვენ შესახებ (About Us)", slug: "about", lastUpdated: "2026-08-10" },
    { id: "terms", title: "წესები და პირობები (Terms)", slug: "terms", lastUpdated: "2026-08-01" },
    { id: "privacy", title: "კონფიდენციალურობა (Privacy)", slug: "privacy", lastUpdated: "2026-08-01" },
    { id: "faq", title: "ხშირად დასმული კითხვები (FAQ)", slug: "faq", lastUpdated: "2026-08-12" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CMS გვერდების მართვა</h1>
          <p className="text-xs text-gray-500 mt-1">სტატიკური გვერდების (About, FAQ, Terms) ტექსტების რედაქტორი.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs divide-y divide-gray-100">
        {pages.map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors">
            <div>
              <h4 className="text-xs font-bold text-gray-900">{p.title}</h4>
              <p className="text-[10px] text-gray-400 font-mono">/{p.slug} • ბოლო განახლება: {p.lastUpdated}</p>
            </div>
            <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5" />
              <span>რედაქტირება</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
