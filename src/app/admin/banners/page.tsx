"use client";

import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Plus, Trash2, X, Check, ExternalLink } from "lucide-react";
import { dataService, Banner } from "@/services/dataService";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ctaLink, setCtaLink] = useState("/catalog");

  useEffect(() => {
    setBanners(dataService.getBanners());
    const unsub = dataService.subscribe(() => setBanners(dataService.getBanners()));
    return () => unsub();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;
    dataService.saveBanner({ id: `banner-${Date.now()}`, title: title.trim(), subtitle: subtitle.trim(), ctaText: "ნახვა", ctaLink, imageDesktop: imageUrl.trim(), position: "HERO", isActive: true, priority: banners.length + 1 });
    setIsModalOpen(false); setTitle(""); setSubtitle(""); setImageUrl("");
  };
  const handleDelete = (id: string) => { if (confirm("ბანერის წაშლა?")) dataService.deleteBanner(id); };
  const handleToggle = (banner: Banner) => dataService.saveBanner({ ...banner, isActive: !banner.isActive });

  return (
    <div className="space-y-6">

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>მარკეტინგი</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight">
            ბანერები ({banners.length})
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Hero, Promotional და სხვა ბანერების მართვა Storefront-ზე.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ახალი ბანერი</span>
        </button>
      </div>

      {/* Banners Grid */}
      <div className="space-y-4">
        {banners.map((banner, idx) => (
          <div key={banner.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-4">
                <div className="w-44 h-24 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                  <img
                    src={banner.imageDesktop}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-[9px] font-mono rounded-md backdrop-blur-xs">
                    #{idx + 1} · {banner.position}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm text-slate-900">{banner.title}</h3>
                  <p className="text-xs text-slate-400">{banner.subtitle || "—"}</p>
                  <a href={banner.ctaLink} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                    <span>{banner.ctaLink}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggle(banner)}
                  className={`px-3 py-1.5 rounded-full text-xs cursor-pointer transition-colors ${
                    banner.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {banner.isActive ? "აქტიური" : "გათიშული"}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(banner.id)}
                  className="w-9 h-9 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add Card */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-slate-50 hover:bg-blue-50/50 rounded-3xl border-2 border-dashed border-slate-200 hover:border-blue-300 p-6 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs text-blue-600">ახალი ბანერის დამატება</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 border border-slate-100 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base text-slate-900">ახალი ბანერი</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1">სათაური</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="მაგ: Special Summer Promo"
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">ქვესათაური</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="მოკლე აღწერა..."
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">სურათის URL (Desktop)</label>
                <ImageUploader images={imageUrl ? [imageUrl] : []} onChange={(imgs) => setImageUrl(imgs[0] || "")} />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">ბმული (CTA Link)</label>
                <input
                  type="text"
                  value={ctaLink}
                  onChange={(e) => setCtaLink(e.target.value)}
                  placeholder="/catalog/mobiles"
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
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
