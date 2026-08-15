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
  UploadCloud 
} from "lucide-react";
import { dataService } from "@/services/dataService";
import { Product } from "@/types";
import { exportProductsToCSV } from "@/utils/exportImport";
import { ProductImportModal } from "@/components/admin/ProductImportModal";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedBrand, setSelectedBrand] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    setProducts(dataService.getProducts());
    const unsub = dataService.subscribe(() => setProducts(dataService.getProducts()));
    return () => unsub();
  }, []);

  const categories = dataService.getCategories();
  const brands = dataService.getBrands();

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

  const handleDelete = (id: string) => {
    if (confirm("პროდუქტის წაშლა?")) { dataService.deleteProduct(id); setSelectedIds(prev => prev.filter(x => x !== id)); }
  };
  const handleBulkDelete = () => {
    if (confirm(`${selectedIds.length} პროდუქტის წაშლა?`)) { selectedIds.forEach(id => dataService.deleteProduct(id)); setSelectedIds([]); }
  };
  const handleDuplicate = (p: Product) => {
    dataService.saveProduct({ ...p, id: undefined, title: `${p.title} (კოპია)`, slug: `${p.slug}-copy-${Date.now()}` });
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
            <span>იმპორტი (CSV)</span>
          </button>

          <Link
            href="/admin/products/new"
            className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>ახალი პროდუქტი</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ძიება: სახელი, SKU, ბრენდი..."
              className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">ყველა კატეგორია</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">ყველა ბრენდი</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">ყველა მარაგი</option>
              <option value="IN_STOCK">მარაგშია</option>
              <option value="LOW_STOCK">მცირე (≤5)</option>
              <option value="OUT_OF_STOCK">ამოწურული</option>
            </select>
          </div>

        </div>

        {selectedIds.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900">
            <span>არჩეულია {selectedIds.length} პროდუქტი</span>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>წაშლა</span>
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-4 px-4 w-10 text-center">
                  <button type="button" onClick={toggleAll} className="p-1 text-slate-500 cursor-pointer">
                    {selectedIds.length === filtered.length && filtered.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-4 px-6">პროდუქტი</th>
                <th className="py-4 px-6">SKU</th>
                <th className="py-4 px-6">კატეგორია</th>
                <th className="py-4 px-6">ბრენდი</th>
                <th className="py-4 px-6">ფასი</th>
                <th className="py-4 px-6">მარაგი</th>
                <th className="py-4 px-6 text-right">მოქმედება</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((p) => {
                  const isSelected = selectedIds.includes(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${isSelected ? "bg-blue-50/50" : "hover:bg-slate-50/70"}`}
                    >
                      <td className="py-4 px-4 text-center">
                        <button type="button" onClick={() => toggleOne(p.id)} className="p-1 cursor-pointer">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </td>

                      <td className="py-4 px-6 min-w-[220px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0] || "https://veli.store/media-cdn/__sized__/product/iphone16pro-thumbnail-200x200-95.jpg"}
                            alt={p.title}
                            className="w-10 h-10 object-contain rounded-2xl bg-white p-1 border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="text-slate-900 text-xs">{p.title}</p>
                            {p.isFeatured && (
                              <span className="text-[10px] text-blue-600">★ Featured</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-mono text-slate-400 text-xs">
                        {p.sku || p.code || "—"}
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        {p.categoryName || "ზოგადი"}
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        {p.brandName || "—"}
                      </td>

                      <td className="py-4 px-6 font-mono">
                        <span className="text-slate-900">{p.discountPrice ?? p.price} ₾</span>
                        {p.discountPrice && (
                          <span className="text-[10px] text-slate-400 line-through block">{p.price} ₾</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {stockBadge(p)}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/product/${p.id}`}
                            target="_blank"
                            className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
                            title="Storefront Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                            title="რედაქტირება"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(p)}
                            className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                            title="დუბლირება"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            className="w-8 h-8 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
                            title="წაშლა"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    პროდუქტები ვერ მოიძებნა
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Import Modal */}
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
