"use client";

import React, { useState, useEffect } from "react";
import { 
  Award, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  ExternalLink,
  Sparkles
} from "lucide-react";
import { dataService } from "@/services/dataService";
import { Brand } from "@/types";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [brandLogo, setBrandLogo] = useState("");
  const [isFeatured, setIsFeatured] = useState(true);

  useEffect(() => {
    setBrands(dataService.getBrands());
    const unsub = dataService.subscribe(() => {
      setBrands(dataService.getBrands());
    });
    return () => unsub();
  }, []);

  const filteredBrands = brands.filter((b) =>
    !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    setBrandLogo(b.logo);
    setIsFeatured(b.featured ?? true);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    dataService.saveBrand({
      id: editingBrand?.id,
      name: brandName.trim(),
      slug: brandSlug.trim() || brandName.toLowerCase().replace(/\s+/g, "-"),
      logo: brandLogo.trim() || "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
      featured: isFeatured,
    });

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`დარწმუნებული ხართ, რომ გსურთ ბრენდის "${name}" წაშლა?`)) {
      dataService.deleteBrand(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">
            <span>ბრენდების მართვა</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            ბრენდები ({brands.length})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            მაღაზიაში წარმოდგენილი ბრენდების, ლოგოების და პოპულარობის სტატუსების მართვა.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ახალი ბრენდის დამატება</span>
        </button>
      </div>

      {/* 2. Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ძიება ბრენდებში..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 text-xs text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* 3. Brands Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white border border-gray-200/80 rounded-2xl p-4 flex flex-col items-center justify-between space-y-3 hover:border-blue-300 transition-all shadow-xs relative group"
          >
            <div className="w-16 h-16 rounded-xl bg-gray-50 p-2 flex items-center justify-center border border-gray-100">
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all"
              />
            </div>

            <div className="text-center">
              <h4 className="text-xs font-bold text-gray-900">{brand.name}</h4>
              <p className="text-[10px] text-gray-400 font-mono">/{brand.slug}</p>
            </div>

            <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100 w-full justify-center">
              <button
                onClick={() => handleOpenEdit(brand)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="რედაქტირება"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(brand.id, brand.name)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="წაშლა"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">
                {editingBrand ? "ბრენდის რედაქტირება" : "ახალი ბრენდის დამატება"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">ბრენდის სახელი *</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => {
                    setBrandName(e.target.value);
                    if (!editingBrand) {
                      setBrandSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }
                  }}
                  placeholder="მაგ: Apple, Samsung, DJI"
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={brandSlug}
                  onChange={(e) => setBrandSlug(e.target.value)}
                  placeholder="apple"
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs font-mono text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">ლოგოს URL</label>
                <input
                  type="url"
                  value={brandLogo}
                  onChange={(e) => setBrandLogo(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="featuredBrand"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <label htmlFor="featuredBrand" className="text-xs font-semibold text-gray-900 cursor-pointer">
                  გამოჩნდეს პოპულარულ ბრენდებში (Featured Brand)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
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
