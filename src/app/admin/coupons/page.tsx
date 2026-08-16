"use client";

import React, { useState, useEffect } from "react";
import { Ticket, Plus, Trash2, X, Check, Copy, Loader2 } from "lucide-react";

interface CouponItem {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  startDate?: string;
  endDate?: string;
  usedCount?: number;
  usageLimit?: number | null;
  status: "ACTIVE" | "EXPIRED" | "DISABLED";
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountValue, setDiscountValue] = useState(15);
  const [minOrder, setMinOrder] = useState(100);
  const [usageLimit, setUsageLimit] = useState<number | "">("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/coupons");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCoupons(json.data);
      }
    } catch (err) {
      console.error("AdminCouponsPage: Failed to load coupons:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setIsSaving(true);

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        discountType: "percentage",
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrder),
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        usageLimit: usageLimit !== "" ? Number(usageLimit) : null,
        status: "ACTIVE",
      };

      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "კუპონის შენახვა ვერ მოხერხდა");
      }

      setIsModalOpen(false);
      setCode("");
      loadCoupons();
    } catch (err: any) {
      console.error("Failed to save coupon:", err);
      alert(err.message || "შეცდომა კუპონის შენახვისას");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("კუპონის წაშლა?")) {
      try {
        const res = await fetch(`/api/coupons?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        const json = await res.json();
        if (json.success) {
          loadCoupons();
        } else {
          alert(json.error || "წაშლა ვერ მოხერხდა");
        }
      } catch (err) {
        console.error("Failed to delete coupon:", err);
      }
    }
  };

  const handleCopy = (codeStr: string, id: string) => {
    navigator.clipboard.writeText(codeStr).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
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
            ფასდაკლების კოდების შექმნა, მართვა და გამოყენების ანალიტიკა MySQL ბაზაში.
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
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <span>იტვირთება კუპონები...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            აქტიური კუპონები არ არის დამატებული.
          </div>
        ) : (
          coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    {coupon.code}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                    coupon.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    {coupon.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <p className="text-base text-slate-900">
                    {coupon.discountType === "percentage" ? `${coupon.discountValue}% ფასდაკლება` : `₾${coupon.discountValue} ფასდაკლება`}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    მინ. შეკვეთა: ₾{coupon.minOrderAmount || 0}
                  </p>
                  {coupon.usageLimit && (
                    <p className="text-slate-400 text-[11px]">
                      ლიმიტი: {coupon.usedCount || 0} / {coupon.usageLimit}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleCopy(coupon.code, coupon.id)}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === coupon.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === coupon.id ? "დაკოპირდა" : "კოპირება"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(coupon.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base text-slate-900">ახალი კუპონის შექმნა</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-700 mb-1">პრომო კოდი *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="მაგ: SUMMER2026, SPILO10"
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 uppercase font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 mb-1">ფასდაკლების პროცენტი (%) *</label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                  min={1}
                  max={100}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 mb-1">მინიმალური შეკვეთის თანხა (₾)</label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(Number(e.target.value))}
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 mb-1">გამოყენების საერთო ლიმიტი (არასავალდებულო)</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : "")}
                  placeholder="მაგ: 100"
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-colors"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>კუპონის შენახვა</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
