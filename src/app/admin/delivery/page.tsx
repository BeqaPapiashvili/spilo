"use client";

import React, { useState } from "react";
import { Truck, Save } from "lucide-react";

export default function AdminDeliveryPage() {
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(100);
  const [standardDeliveryFee, setStandardDeliveryFee] = useState(5);
  const [expressDeliveryFee, setExpressDeliveryFee] = useState(15);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">მიწოდების პარამეტრები (Delivery Settings)</h1>
          <p className="text-xs text-gray-500 mt-1">უფასო მიწოდების ზღვარი და ტარიფები რეგიონების მიხედვით.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-4 max-w-2xl">
        <div>
          <label className="block text-xs font-bold text-gray-900 mb-1">უფასო მიწოდების მინიმალური ზღვარი (₾)</label>
          <input
            type="number"
            value={freeShippingThreshold}
            onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
            className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-900 mb-1">სტანდარტული მიწოდების საფასური (₾)</label>
          <input
            type="number"
            value={standardDeliveryFee}
            onChange={(e) => setStandardDeliveryFee(Number(e.target.value))}
            className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-900 mb-1">ექსპრეს მიწოდების საფასური (₾)</label>
          <input
            type="number"
            value={expressDeliveryFee}
            onChange={(e) => setExpressDeliveryFee(Number(e.target.value))}
            className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <button
          onClick={() => alert("მიწოდების პარამეტრები შენახულია!")}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>პარამეტრების შენახვა</span>
        </button>
      </div>
    </div>
  );
}
