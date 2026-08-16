"use client";

import React, { useState, useEffect } from "react";
import { Award, Plus, Search, Edit3, Trash2, Check, X, ExternalLink, Loader2 } from "lucide-react";
import { Brand } from "@/types";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [brandLogo, setBrandLogo] = useState("");
  const [isFeatured, setIsFeatured] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadBrands = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/brands");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setBrands(json.data);
      }
    } catch (err) {
      console.error("AdminBrandsPage: Failed to load brands:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const filtered = brands.filter(b => !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleOpenAdd = () => { 
    setEditingBrand(null); 
    setBrandName(""); 
    setBrandSlug(""); 
    setBrandLogo(""); 
    setIsFeatured(true); 
    setIsModalOpen(true); 
  };

  const handleOpenEdit = (b: Brand) => { 
    setEditingBrand(b); 
    setBrandName(b.name); 
    setBrandSlug(b.slug); 
    setBrandLogo(b.logo || ""); 
    setIsFeatured(b.featured ?? true); 
    setIsModalOpen(true); 
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    setIsSaving(true);

    try {
      const finalSlug = brandSlug.trim() || brandName.toLowerCase().replace(/\s+/g, "-");
      const payload = {
        name: brandName.trim(),
        slug: finalSlug,
        logo: brandLogo.trim() || null,
      };

      let res;
      if (editingBrand?.id) {
        res = await fetch("/api/brands", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingBrand.id, ...payload }),
        });
      } else {
        res = await fetch("/api/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "ბრენდის შენახვა ვერ მოხერხდა");
      }

      setIsModalOpen(false);
      loadBrands();
    } catch (err: any) {
      console.error("Failed to save brand:", err);
      alert(err.message || "შეცდომა ბრენდის შენახვისას");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`"${name}" ბრენდის წაშლა?`)) {
      try {
        const res = await fetch(`/api/brands?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        const json = await res.json();
        if (json.success) {
          loadBrands();
        } else {
          alert(json.error || "ბრენდის წაშლა ვერ მოხერხდა");
        }
      } catch (err) {
        console.error("Failed to delete brand:", err);
      }
    }
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
          className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ახალი ბრენდი</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ბრენდის ძებნა..."
            className="w-full h-10 pl-9 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-200 rounded-md w-28" />
                  <div className="h-3 bg-slate-100 rounded-md w-20" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="w-16 h-3 bg-slate-100 rounded" />
                <div className="flex gap-1">
                  <div className="w-6 h-6 bg-slate-100 rounded" />
                  <div className="w-6 h-6 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80">
            <Award className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm text-slate-700">ბრენდები ვერ მოიძებნა</h3>
            <p className="text-xs text-slate-400">სცადეთ სხვა საძიებო სიტყვა</p>
            {searchQuery.trim() !== "" ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs cursor-pointer"
              >
                <span>ძიების გასუფთავება</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ბრენდის დამატება</span>
              </button>
            )}
          </div>
        ) : (
          filtered.map((brand) => (
          <div
            key={brand.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shrink-0">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                ) : (
                  <Award className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm text-slate-900 truncate">{brand.name}</h3>
                <p className="text-[11px] text-slate-400 font-mono">slug: {brand.slug}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-mono">ID: {brand.id}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(brand)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(brand.id, brand.name)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base text-slate-900">
                {editingBrand ? "ბრენდის რედაქტირება" : "ახალი ბრენდის დამატება"}
              </h2>
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
                <label className="block text-xs text-slate-700 mb-1">ბრენდის სახელი *</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => {
                    setBrandName(e.target.value);
                    if (!editingBrand) setBrandSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                  placeholder="მაგ: DJI, Apple, Sony"
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={brandSlug}
                  onChange={(e) => setBrandSlug(e.target.value)}
                  placeholder="dji"
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 mb-1">ლოგოს URL</label>
                <input
                  type="text"
                  value={brandLogo}
                  onChange={(e) => setBrandLogo(e.target.value)}
                  placeholder="https://..."
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
                  <span>შენახვა</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
