"use client";

import React, { useState, useEffect } from "react";
import { Ticket, Plus, Check, Copy } from "lucide-react";
import { dataService, Coupon } from "@/services/dataService";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    setCoupons(dataService.getCoupons());
    const unsub = dataService.subscribe(() => {
      setCoupons(dataService.getCoupons());
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">კუპონების მართვა</h1>
          <p className="text-xs text-gray-500 mt-1">პრომო კოდების გენერაცია და ლიმიტების მართვა.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-50/80 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-100">
            <tr>
              <th className="py-3 px-4">კუპონის კოდი</th>
              <th className="py-3 px-4">ფასდაკლება</th>
              <th className="py-3 px-4">მინ. შეკვეთა</th>
              <th className="py-3 px-4">გამოყენებული</th>
              <th className="py-3 px-4">სტატუსი</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{c.code}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900">
                  {c.discountType === "percentage" ? `${c.discountValue}%` : `${c.discountValue} ₾`}
                </td>
                <td className="py-3.5 px-4 text-gray-600">{c.minOrderAmount ? `${c.minOrderAmount} ₾` : "უარყოფითი"}</td>
                <td className="py-3.5 px-4 text-gray-600">{c.usedCount} ჯერ</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px]">
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
