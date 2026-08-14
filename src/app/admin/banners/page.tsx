"use client";

import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Plus, Trash2, X } from "lucide-react";
import { dataService, Banner } from "@/services/dataService";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ctaLink, setCtaLink] = useState("/catalog");

  useEffect(() => {
    setBanners(dataService.getBanners());
    const unsub = dataService.subscribe(() => {
      setBanners(dataService.getBanners());
    });
    return () => unsub();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    dataService.saveBanner({
      id: `banner-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim(),
      ctaText: "ნახვა",
      ctaLink,
      imageDesktop: imageUrl.trim(),
      position: "HERO",
      isActive: true,
      priority: banners.length + 1,
    });

    setIsModalOpen(false);
    setTitle("");
    setSubtitle("");
    setImageUrl("");
  };

  const handleDelete = (id: string) => {
    if (confirm("დარწმუნებული ხართ, რომ გსურთ ბანერის წაშლა?")) {
      dataService.deleteBanner(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ბანერების მართვა</h1>
          <p className="text-xs text-gray-500 mt-1">Hero სლაიდერისა და სარეკლამო ბანერების მართვა.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>ახალი ბანერი</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((b) => (
          <div key={b.id} className="bg-white border border-gray-200/80 rounded-2xl p-4 space-y-3 shadow-xs relative group">
            <img src={b.imageDesktop} alt={b.title} className="w-full h-36 object-cover rounded-xl bg-gray-50" />
            <div>
              <h4 className="text-sm font-bold text-gray-900">{b.title}</h4>
              <p className="text-xs text-gray-500">{b.subtitle}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
              <span>პოზიცია: {b.position}</span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-semibold">{b.isActive ? "აქტიური" : "გაფილტრული"}</span>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded cursor-pointer"
                  title="წაშლა"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">ახალი ბანერის დამატება</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">სათაური *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="მაგ: iPhone 16 Pro — 0% განვადება"
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-bold mb-1">ქვესათაური</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="მაგ: შეიძინეთ უპროცენტო განვადებით Spilo-ზე"
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">სურათის URL *</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-bold mb-1">CTA ბმული</label>
                <input
                  type="text"
                  value={ctaLink}
                  onChange={(e) => setCtaLink(e.target.value)}
                  placeholder="/catalog?category=mobiles"
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold cursor-pointer"
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
