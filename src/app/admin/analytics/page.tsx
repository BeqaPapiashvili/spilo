"use client";

import React from "react";
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users, ArrowUpRight } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ფინანსური ანალიტიკა & რეპორტები</h1>
          <p className="text-xs text-gray-500 mt-1">შემოსავლების, კონვერსიებისა და გაყიდვების დეტალური სტატისტიკა.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
          <span className="text-xs text-gray-500 font-medium">თვიური შემოსავალი</span>
          <h3 className="text-2xl font-bold text-gray-900">48,920 ₾</h3>
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" /> +14.2% ზრდა
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
          <span className="text-xs text-gray-500 font-medium">კონვერსიის კოეფიციენტი</span>
          <h3 className="text-2xl font-bold text-gray-900">3.42%</h3>
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" /> +0.8% გაუმჯობესება
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-2">
          <span className="text-xs text-gray-500 font-medium">საშუალო კალათის ღირებულება</span>
          <h3 className="text-2xl font-bold text-gray-900">347 ₾</h3>
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" /> +5.1% ზრდა
          </span>
        </div>
      </div>
    </div>
  );
}
