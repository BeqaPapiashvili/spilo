"use client";

import React, { useState, useEffect } from "react";
import { Ticket, Plus, Trash2, X, Check, Copy } from "lucide-react";
import { dataService, Coupon } from "@/services/dataService";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountValue, setDiscountValue] = useState(15);
  const [minOrder, setMinOrder] = useState(100);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setCoupons(dataService.getCoupons());
    const unsub = dataService.subscribe(() => setCoupons(dataService.getCoupons()));
    return () => unsub();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    dataService.saveCoupon({ id: `cpn-${Date.now()}`, code: code.trim().toUpperCase(), discountType: "percentage", discountValue: Number(discountValue), minOrderAmount: Number(minOrder), startDate: "2026-01-01", endDate: "2026-12-31", usedCount: 0, status: "ACTIVE" });
    setIsModalOpen(false); setCode("");
  };
  const handleDelete = (id: string) => { if (confirm("კუპონის წაშლა?")) dataService.deleteCoupon(id); };
  const handleCopy = (codeStr: string, id: string) => {
    navigator.clipboard.writeText(codeStr).then(() => { setCopiedId(id); setTimeout(() => setCopiedId(null), 1500); });
  };

  return (
    <div className="space-y-6">

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
            <Ticket className="w-3.5 h-3.5" />
            <span>მარკეტინგი</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight">
            კუპონები & პრომო კოდები ({coupons.length})
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            ფასდაკლების კოდების შექმნა, მართვა და გამოყენების ანალიტიკა.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ახალი კუპონი</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                coupon.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600"
              }`}>
                {coupon.status === "ACTIVE" ? "აქტიური" : "გათიშული"}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(coupon.id)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <code className="text-sm font-mono text-slate-900 tracking-wider">
                {coupon.code}
              </code>
              <button
                type="button"
                onClick={() => handleCopy(coupon.code, coupon.id)}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 flex items-center justify-center cursor-pointer transition-colors"
                title="კოდის კოპირება"
              >
                {copiedId === coupon.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-2xl text-blue-600 font-mono">-{coupon.discountValue}%</span>
              <div className="text-right text-[10px] text-slate-400 font-mono space-y-0.5">
                <p>მინ. შეკვეთა: {coupon.minOrderAmount} ₾</p>
                <p>გამოყ.: {coupon.usedCount || 0}x</p>
              </div>
            </div>
          </div>
        ))}

        {/* Add Card */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-50 hover:bg-blue-50/50 rounded-3xl border-2 border-dashed border-slate-200 hover:border-blue-300 p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all min-h-[180px]"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs text-blue-600">ახალი კუპონი</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 border border-slate-100 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base text-slate-900">ახალი კუპონი</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1">კუპონის კოდი</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="მაგ: SPILO15, SUMMER20"
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs font-mono uppercase text-slate-900 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">ფასდაკლების %</label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">მინიმალური შეკვეთის თანხა (₾)</label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs transition-colors cursor-pointer shadow-xs"
                >
                  შენახვა
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
