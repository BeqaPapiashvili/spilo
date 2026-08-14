"use client";

import React, { useState } from "react";
import { Users, Search, ShoppingBag, Mail, Phone, Calendar, ChevronRight } from "lucide-react";

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const mockCustomers = [
    { id: "cust-1", name: "Beka Papiashvili", email: "beka@spilo.ge", phone: "+995 599 12 34 56", orderCount: 5, totalSpent: 7890, regDate: "12 იანვარი, 2026" },
    { id: "cust-2", name: "Nino Beridze", email: "nino@gmail.com", phone: "+995 595 98 76 54", orderCount: 2, totalSpent: 2450, regDate: "15 თებერვალი, 2026" },
    { id: "cust-3", name: "Giorgi Kapanadze", email: "giorgi.k@outlook.com", phone: "+995 577 33 22 11", orderCount: 8, totalSpent: 14200, regDate: "03 მარტი, 2026" },
  ];

  const filtered = mockCustomers.filter(c =>
    !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">მომხმარებლები ({filtered.length})</h1>
          <p className="text-xs text-gray-500 mt-1">რეგისტრირებული მომხმარებლების სია, შეკვეთების რაოდენობა და ჯამური დანახარჯები.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ძიება: სახელი, ელ-ფოსტა, ტელეფონი..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 text-xs text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-50/80 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-100">
            <tr>
              <th className="py-3 px-4">მომხმარებელი</th>
              <th className="py-3 px-4">კონტაქტი</th>
              <th className="py-3 px-4">რეგისტრაცია</th>
              <th className="py-3 px-4">შეკვეთები</th>
              <th className="py-3 px-4">ჯამური დანახარჯი</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-gray-900">{c.name}</td>
                <td className="py-3.5 px-4 text-gray-600">{c.email} • {c.phone}</td>
                <td className="py-3.5 px-4 text-gray-500">{c.regDate}</td>
                <td className="py-3.5 px-4 font-semibold text-blue-600">{c.orderCount} შეკვეთა</td>
                <td className="py-3.5 px-4 font-bold text-gray-900">{c.totalSpent} ₾</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
