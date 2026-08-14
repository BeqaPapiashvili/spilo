"use client";

import React, { useState } from "react";
import { CreditCard, CheckCircle2 } from "lucide-react";

export default function AdminPaymentsPage() {
  const [methods, setMethods] = useState([
    { id: "card", name: "ბარათით გადახდა (TBC / BOG / Visa / Mastercard)", enabled: true },
    { id: "cod", name: "ნაღდი ანგარიშსწორება ადგილზე (COD)", enabled: true },
    { id: "installment", name: "ონლაინ განვადება", enabled: true },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">გადახდის მეთოდების კონფიგურაცია</h1>
          <p className="text-xs text-gray-500 mt-1">ონლაინ გადახდებისა და ბანკის შლიუზების მართვა.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-3">
        {methods.map((m) => (
          <div key={m.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900">{m.name}</span>
            <input
              type="checkbox"
              checked={m.enabled}
              onChange={() => setMethods(methods.map((x) => (x.id === m.id ? { ...x, enabled: !x.enabled } : x)))}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
