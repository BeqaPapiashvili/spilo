"use client";

import React, { useState } from "react";
import { Settings, Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState("Spilo E-Commerce");
  const [contactEmail, setContactEmail] = useState("info@spilo.ge");
  const [contactPhone, setContactPhone] = useState("+995 32 2 12 34 56");
  const [address, setAddress] = useState("თბილისი, ჭავჭავაძის გამზირი #34");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">მაღაზიის პარამეტრები (Store Settings)</h1>
          <p className="text-xs text-gray-500 mt-1">მაღაზიის ძირითადი ინფორმაცია, საკონტაქტო მონაცემები და ლოკალიზაცია.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-4 max-w-3xl">
        <div>
          <label className="block text-xs font-bold text-gray-900 mb-1">მაღაზიის დასახელება</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1">საკონტაქტო ელ-ფოსტა</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1">საკონტაქტო ტელეფონი</label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-900 mb-1">მაღაზიის ფიზიკური მისამართი</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <button
          onClick={() => alert("პარამეტრები შენახულია!")}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>პარამეტრების შენახვა</span>
        </button>
      </div>
    </div>
  );
}
