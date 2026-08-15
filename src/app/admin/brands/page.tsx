"use client";

import React, { useState, useEffect } from "react";
import { Award, Plus, Search, Edit3, Trash2, Check, X, ExternalLink } from "lucide-react";
import { dataService } from "@/services/dataService";
import { Brand } from "@/types";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [brandLogo, setBrandLogo] = useState("");
  const [isFeatured, setIsFeatured] = useState(true);

  useEffect(() => {
    setBrands(dataService.getBrands());
    const unsub = dataService.subscribe(() => setBrands(dataService.getBrands()));
    return () => unsub();
  }, []);

  const filtered = brands.filter(b => !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleOpenAdd = () => { setEditingBrand(null); setBrandName(""); setBrandSlug(""); setBrandLogo(""); setIsFeatured(true); setIsModalOpen(true); };
  const handleOpenEdit = (b: Brand) => { setEditingBrand(b); setBrandName(b.name); setBrandSlug(b.slug); setBrandLogo(b.logo); setIsFeatured(b.featured ?? true); setIsModalOpen(true); };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    dataService.saveBrand({ id: editingBrand?.id, name: brandName.trim(), slug: brandSlug.trim() || brandName.toLowerCase().replace(/\s+/g, "-"), logo: brandLogo.trim() || "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", featured: isFeatured });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" ბრენდის წაშლა?`)) dataService.deleteBrand(id);
  };

  return (
    <div className="space-y-6">

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
            <Award className="w-3.5 h-3.5" />
            <span>კატალოგის მართვა</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight">
            ბრენდები ({filtered.length})
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            პარტნიორი ბრენდების მართვა, ლოგოები და Storefront-ის ბრენდ ფილტრი.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ახალი ბრენდი</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ბრენდის ძიება..."
            className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((brand) => (
          <div
            key={brand.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 flex flex-col items-center gap-3 text-center transition-all hover:border-blue-200"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-3">
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-full h-full object-contain"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
            
            <div className="flex-1 space-y-0.5">
              <p className="text-xs text-slate-900">{brand.name}</p>
              <p className="text-[10px] text-slate-400 font-mono">/{brand.slug}</p>
              {brand.featured && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px]">
                  Featured
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 w-full justify-center">
              <button
                type="button"
                onClick={() => handleOpenEdit(brand)}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(brand.id, brand.name)}
                className="w-8 h-8 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {/* Add New Card */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="bg-slate-50 hover:bg-blue-50/50 rounded-3xl border-2 border-dashed border-slate-200 hover:border-blue-300 p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all min-h-[180px]"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs text-blue-600">ახალი ბრენდი</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 border border-slate-100 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base text-slate-900">
                {editingBrand ? "ბრენდის რედაქტირება" : "ახალი ბრენდი"}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1">ბრენდის სახელი</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => {
                    setBrandName(e.target.value);
                    if (!editingBrand) setBrandSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                  placeholder="მაგ: Apple, Samsung..."
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={brandSlug}
                  onChange={(e) => setBrandSlug(e.target.value)}
                  placeholder="apple"
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">ლოგო (URL)</label>
                <input
                  type="text"
                  value={brandLogo}
                  onChange={(e) => setBrandLogo(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
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
