"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Edit3, 
  Copy, 
  Eye, 
  Trash2, 
  CheckSquare, 
  Square, 
  Package, 
  Download, 
  UploadCloud,
  Loader2
} from "lucide-react";
import { Product } from "@/types";
import { exportProductsToCSV } from "@/utils/exportImport";
import { ProductImportModal } from "@/components/admin/ProductImportModal";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedBrand, setSelectedBrand] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
        fetch("/api/brands"),
      ]);

      const [prodJson, catJson, brandJson] = await Promise.all([
        prodRes.json(),
        catRes.json(),
        brandRes.json(),
      ]);

      if (prodJson.success && Array.isArray(prodJson.data)) {
        setProducts(prodJson.data);
      }
      if (catJson.success && Array.isArray(catJson.data)) {
        setCategories(catJson.data);
      }
      if (brandJson.success && Array.isArray(brandJson.data)) {
        setBrands(brandJson.data);
      }
    } catch (err) {
      console.error("AdminProductsPage: Failed to load data from MySQL:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) || p.brandName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === "ALL" || p.categoryId === selectedCategory;
    const matchBrand = selectedBrand === "ALL" || p.brandId === selectedBrand;
    let matchStock = true;
    if (stockFilter === "IN_STOCK") matchStock = p.stock > 0;
    if (stockFilter === "LOW_STOCK") matchStock = p.stock > 0 && p.stock <= 5;
    if (stockFilter === "OUT_OF_STOCK") matchStock = p.stock === 0;
    return matchSearch && matchCat && matchBrand && matchStock;
  });

  const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(p => p.id));
  const toggleOne = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleDelete = async (id: string) => {
    if (confirm("ნამდვილად გსურთ პროდუქტის წაშლა?")) {
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { method: "DELETE" });
        const json = await res.json();
        if (json.success) {
          setSelectedIds(prev => prev.filter(x => x !== id));
          loadData();
        } else {
          alert(json.error || "წაშლა ვერ მოხერხდა");
        }
      } catch (err) {
        console.error("Failed to delete product:", err);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`${selectedIds.length} პროდუქტის წაშლა?`)) {
      try {
        await Promise.all(
          selectedIds.map(id => fetch(`/api/products/${encodeURIComponent(id)}`, { method: "DELETE" }))
        );
        setSelectedIds([]);
        loadData();
      } catch (err) {
        console.error("Bulk delete error:", err);
      }
    }
  };

  const handleDuplicate = async (p: Product) => {
    try {
      const payload = {
        title: `${p.title} (კოპია)`,
        slug: `${p.slug}-copy-${Date.now()}`,
        sku: `SKU-${Date.now().toString().slice(-6)}`,
        description: p.description || "",
        price: p.price,
        discountPrice: p.discountPrice || null,
        stock: p.stock,
        categoryId: p.categoryId,
        brandId: p.brandId,
        images: p.images || [p.image || ""],
        specs: p.specs || null,
        isFeatured: false,
        isFlashDeal: false,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        loadData();
      } else {
        alert(json.error || "კოპირება ვერ მოხერხდა");
      }
    } catch (err) {
      console.error("Duplicate error:", err);
    }
  };

  const stockBadge = (p: Product) => {
    if (p.stock === 0) return <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs">ამოწურულია</span>;
    if (p.stock <= 5) return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs">{p.stock} ცალი ⚠</span>;
    return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs">{p.stock} ცალი</span>;
  };

  return (
    <div className="space-y-6">

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
            <Package className="w-3.5 h-3.5" />
            <span>კატალოგის მართვა</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight">
            პროდუქტები ({filtered.length})
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            პროდუქტების სრული ისტორია, ფასები, მარაგები, SKU და სწრაფი მოქმედებები.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => exportProductsToCSV(products)}
            className="h-11 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>ექსპორტი (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="h-11 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>იმპორტი</span>
          </button>

          <Link
            href="/admin/products/new"
            className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>ახალი პროდუქტი</span>
          </Link>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ძებნა: სახელი, SKU, ბრენდი..."
            className="w-full h-10 pl-9 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">ყველა კატეგორია</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">ყველა ბრენდი</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">ყველა მარაგი</option>
            <option value="IN_STOCK">მარაგშია</option>
            <option value="LOW_STOCK">მცირე მარაგი (≤5)</option>
            <option value="OUT_OF_STOCK">ამოწურულია</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between">
          <span className="text-xs text-blue-900">
            მონიშნულია {selectedIds.length} პროდუქტი
          </span>
          <button
            type="button"
            onClick={handleBulkDelete}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>მონიშნულების წაშლა</span>
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            <p className="text-xs text-slate-400">იტვირთება მონაცემები...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm text-slate-700">პროდუქტი ვერ მოიძებნა</h3>
            <p className="text-xs text-slate-400">სცადეთ სხვა საძიებო პარამეტრები</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/50 text-[11px] text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-10">
                    <button type="button" onClick={toggleAll} className="cursor-pointer text-slate-400 hover:text-slate-700">
                      {selectedIds.length === filtered.length && filtered.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">პროდუქტი</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">კატეგორია</th>
                  <th className="py-3.5 px-4">ბრენდი</th>
                  <th className="py-3.5 px-4">ფასი</th>
                  <th className="py-3.5 px-4">მარაგი</th>
                  <th className="py-3.5 px-4 text-right">მოქმედება</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filtered.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const prodImg = p.images?.[0] || p.image || "/placeholder.png";

                  return (
                    <tr key={p.id} className={`hover:bg-slate-50/70 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`}>
                      <td className="py-3.5 px-4">
                        <button type="button" onClick={() => toggleOne(p.id)} className="cursor-pointer text-slate-400 hover:text-slate-700">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prodImg}
                            alt={p.title}
                            className="w-10 h-10 object-contain rounded-xl bg-white border border-slate-200 p-1 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-slate-900 truncate max-w-[240px] leading-tight">{p.title}</p>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">{p.sku || "-"}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-[11px] text-slate-700">
                          {p.categoryName || p.categoryId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-[11px] text-slate-700">
                          {p.brandName || p.brandId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="text-slate-900">₾{p.discountPrice || p.price}</span>
                          {p.discountPrice && (
                            <span className="text-[10px] text-slate-400 line-through block">₾{p.price}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{stockBadge(p)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/product/${p.id}`}
                            target="_blank"
                            title="მაღაზიაში ნახვა"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(p)}
                            title="დუბლირება"
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            title="რედაქტირება"
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            title="წაშლა"
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <ProductImportModal
          isOpen={isImportModalOpen}
          onClose={() => {
            setIsImportModalOpen(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
