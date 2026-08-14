"use client";

import React, { useState } from "react";
import { Globe, Save } from "lucide-react";

export default function AdminSEOManagerPage() {
  const [siteTitle, setSiteTitle] = useState("Spilo — ონლაინ ტექნიკის მაღაზია | ტელეფონები, ლეპტოპები");
  const [metaDesc, setMetaDesc] = useState("შეიძინეთ უახლესი ტექნიკა 0% ონლაინ განვადებით და უფასო მიწოდებით მთელ საქართველოში Spilo-ზე.");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SEO & საძიებო ოპტიმიზაცია</h1>
          <p className="text-xs text-gray-500 mt-1">მთავარი Meta Title, Meta Description და OpenGraph პარამეტრები.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-4 max-w-3xl">
        <div>
          <label className="block text-xs font-bold text-gray-900 mb-1">მთავარი Meta Title</label>
          <input
            type="text"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-900 mb-1">მთავარი Meta Description</label>
          <textarea
            rows={4}
            value={metaDesc}
            onChange={(e) => setMetaDesc(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <button
          onClick={() => alert("SEO პარამეტრები შენახულია!")}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>SEO-ს შენახვა</span>
        </button>
      </div>
    </div>
  );
}
