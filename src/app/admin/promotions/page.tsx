"use client";

import React, { useState, useEffect } from "react";
import { Tag, Plus, Calendar, Percent, Trash2, X, Check, Edit3, Loader2, Image as ImageIcon, Power, RefreshCw } from "lucide-react";
import { useStore } from "@/store/useStore";
import { ImageUploader } from "@/components/admin/ImageUploader";

export interface PromotionItem {
  id: string;
  name: string;
  title: string;
  slug: string;
  description?: string;
  subtitle?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountPercentage?: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "SCHEDULED" | "EXPIRED";
  image?: string;
  bannerImage?: string;
  link?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminPromotionsPage() {
  const { addToast } = useStore();
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromotionItem | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState(20);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("2026-12-31");
  const [status, setStatus] = useState<"ACTIVE" | "SCHEDULED" | "EXPIRED">("ACTIVE");
  const [bannerImage, setBannerImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/promotions");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPromotions(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch promotions:", err);
      addToast({
        title: "შეცდომა",
        message: "აქციების ჩატვირთვა ვერ მოხერხდა",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleOpenCreate = () => {
    setEditingPromo(null);
    setName("");
    setDescription("");
    setDiscountType("percentage");
    setDiscountValue(20);
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("2026-12-31");
    setStatus("ACTIVE");
    setBannerImage("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (promo: PromotionItem) => {
    setEditingPromo(promo);
    setName(promo.name || promo.title);
    setDescription(promo.description || promo.subtitle || "");
    setDiscountType(promo.discountType || "percentage");
    setDiscountValue(promo.discountValue || 0);
    setStartDate(promo.startDate || new Date().toISOString().split("T")[0]);
    setEndDate(promo.endDate || "2026-12-31");
    setStatus(promo.status || "ACTIVE");
    setBannerImage(promo.bannerImage || promo.image || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        id: editingPromo ? editingPromo.id : undefined,
        name: name.trim(),
        title: name.trim(),
        description: description.trim(),
        discountType,
        discountValue: Number(discountValue),
        discountPercentage: discountType === "percentage" ? Number(discountValue) : undefined,
        startDate,
        endDate,
        status,
        bannerImage: bannerImage.trim() || undefined,
        image: bannerImage.trim() || undefined,
      };

      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        addToast({
          title: editingPromo ? "აქცია განახლდა" : "აქცია შეიქმნა",
          message: `${name} წარმატებით შეინახა მონაცემთა ბაზაში`,
          type: "success",
        });
        setIsModalOpen(false);
        fetchPromotions();
      } else {
        throw new Error(json.error || "შენახვა ვერ მოხერხდა");
      }
    } catch (err: any) {
      console.error("handleSave error:", err);
      addToast({
        title: "შეცდომა",
        message: err.message || "აქციის შენახვისას დაფიქსირდა შეცდომა",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (promo: PromotionItem) => {
    const nextStatus = promo.status === "ACTIVE" ? "EXPIRED" : "ACTIVE";
    try {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...promo,
          status: nextStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPromotions((prev) =>
          prev.map((p) => (p.id === promo.id ? { ...p, status: nextStatus } : p))
        );
        addToast({
          title: "სტატუსი განახლდა",
          message: `აქცია "${promo.name}" გადავიდა ${nextStatus === "ACTIVE" ? "აქტიურ" : "არააქტიურ"} რეჟიმში`,
          type: "info",
        });
      }
    } catch (err) {
      console.error("handleToggleStatus error:", err);
    }
  };

  const handleDelete = async (id: string, promoName: string) => {
    if (!confirm(`დარწმუნებული ხართ, რომ გსურთ აქციის "${promoName}" წაშლა?`)) return;

    try {
      const res = await fetch(`/api/promotions?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setPromotions((prev) => prev.filter((p) => p.id !== id));
        addToast({
          title: "აქცია წაიშალა",
          message: `აქცია "${promoName}" წაიშალა MySQL ბაზიდან`,
          type: "success",
        });
      } else {
        throw new Error(json.error || "წაშლა ვერ მოხერხდა");
      }
    } catch (err: any) {
      console.error("handleDelete error:", err);
      addToast({
        title: "შეცდომა",
        message: err.message || "აქციის წაშლისას დაფიქსირდა შეცდომა",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
            <Tag className="w-3.5 h-3.5" />
            <span>მარკეტინგი & ფასდაკლებები</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight">
            აქციები & ფასდაკლებები ({promotions.length})
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            სეზონური და სპეციალური ფასდაკლებების სრული მართვა პირდაპირ MySQL ბაზაში.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchPromotions}
            className="h-11 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
            title="განახლება"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">განახლება</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>ახალი აქციის დამატება</span>
          </button>
        </div>
      </div>

      {/* Promotions Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200/80">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto mb-2" />
          <span>იტვირთება აქციები MySQL ბაზიდან...</span>
        </div>
      ) : promotions.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80">
          <Tag className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm text-slate-700">აქციები ვერ მოიძებნა</h3>
          <p className="text-xs text-slate-400">დაამატეთ ახალი აქცია ღილაკზე დაჭერით</p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>აქციის დამატება</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {promotions.map((promo) => {
            const isPct = promo.discountType !== "fixed";
            const formattedDiscount = isPct ? `-${promo.discountValue}%` : `-${promo.discountValue} ₾`;

            return (
              <div
                key={promo.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Top Badge & Controls */}
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Percent className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(promo)}
                      className={`px-2.5 py-1 rounded-full text-[10px] cursor-pointer transition-all flex items-center gap-1 ${
                        promo.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                      title="სტატუსის შეცვლა"
                    >
                      <Power className="w-2.5 h-2.5" />
                      <span>{promo.status === "ACTIVE" ? "აქტიური" : "არააქტიური"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(promo)}
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
                      title="რედაქტირება"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(promo.id, promo.name)}
                      className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                      title="წაშლა"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Banner Thumbnail Preview (if present) */}
                {(promo.bannerImage || promo.image) && (
                  <div className="w-full h-24 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 relative">
                    <img
                      src={promo.bannerImage || promo.image}
                      alt={promo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Title & Description */}
                <div className="space-y-1">
                  <h3 className="text-sm text-slate-900 line-clamp-1">{promo.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{promo.description || "—"}</p>
                </div>

                {/* Discount & Dates */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-2xl text-purple-600 font-mono tracking-tight">{formattedDiscount}</span>
                  <div className="text-right text-[10px] text-slate-400 font-mono space-y-0.5">
                    <div className="flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{promo.startDate || "2026-08-01"}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{promo.endDate || "2026-12-31"}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add New Promotion Card */}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="bg-slate-50 hover:bg-purple-50/40 rounded-3xl border-2 border-dashed border-slate-200 hover:border-purple-300 p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all min-h-[220px]"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs text-purple-600">ახალი აქცია</span>
          </button>
        </div>
      )}

      {/* Create / Edit Promotion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-slate-100 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base text-slate-900">
                {editingPromo ? `აქციის რედაქტირება: ${editingPromo.name}` : "ახალი აქციის შექმნა"}
              </h3>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block text-slate-700 mb-1">აქციის სახელი *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="მაგ: საზაფხულო ფასდაკლება 2026"
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 mb-1">აღწერა / სუბტიტრი</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="აქციის მოკლე აღწერა storefront-ისთვის..."
                  rows={2}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none resize-none"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">ფასდაკლების ტიპი</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                    className="w-full h-11 px-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none cursor-pointer"
                  >
                    <option value="percentage">პროცენტული (%)</option>
                    <option value="fixed">ფიქსირებული თანხა (₾)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">
                    {discountType === "percentage" ? "ფასდაკლება (%)" : "ფასდაკლება (₾)"} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step={discountType === "percentage" ? "1" : "0.5"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">დაწყების თარიღი</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-11 px-3 rounded-2xl border border-slate-200 text-xs font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">დასრულების თარიღი</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-11 px-3 rounded-2xl border border-slate-200 text-xs font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-slate-700 mb-1">სტატუსი</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "ACTIVE" | "SCHEDULED" | "EXPIRED")}
                  className="w-full h-11 px-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none cursor-pointer"
                >
                  <option value="ACTIVE">აქტიური (ACTIVE)</option>
                  <option value="SCHEDULED">დაგეგმილი (SCHEDULED)</option>
                  <option value="EXPIRED">ვადაგასული / არააქტიური (EXPIRED)</option>
                </select>
              </div>

              {/* Banner Image Upload */}
              <div className="space-y-1.5">
                <label className="block text-slate-700">ბანერის სურათი (URL ან ატვირთვა)</label>
                <ImageUploader
                  images={bannerImage ? [bannerImage] : []}
                  onChange={(imgs) => setBannerImage(imgs[0] || "")}
                  multiple={false}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingPromo ? "შენახვა" : "შექმნა"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
