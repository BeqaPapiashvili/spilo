"use client";

import React, { useState } from "react";
import { Banknote } from "lucide-react";

export default function AdminInstallmentsPage() {
  const [banks, setBanks] = useState([
    { id: "tbc", name: "TBC Bank (თიბისი ონლაინ განვადება)", enabled: true, minAmount: 100 },
    { id: "bog", name: "Bank of Georgia (საქართველოს ბანკი)", enabled: true, minAmount: 100 },
    { id: "credo", name: "Credo Bank (კრედო ბანკი)", enabled: true, minAmount: 50 },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ბანკის განვადებები (Installments)</h1>
          <p className="text-xs text-gray-500 mt-1">თიბისი, საქართველოს ბანკისა და კრედოს განვადებების პარამეტრები.</p>
        </div>
      </div>

      <div className="space-y-3">
        {banks.map((b) => (
          <div key={b.id} className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">{b.name}</h3>
              <p className="text-xs text-gray-500">მინიმალური თანხა: {b.minAmount} ₾</p>
            </div>
            <input
              type="checkbox"
              checked={b.enabled}
              onChange={() => setBanks(banks.map((x) => (x.id === b.id ? { ...x, enabled: !x.enabled } : x)))}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
