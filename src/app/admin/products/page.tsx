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
  Square
} from "lucide-react";
import { dataService } from "@/services/dataService";
import { Product } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedBrand, setSelectedBrand] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");

  useEffect(() => {
    setProducts(dataService.getProducts());
    const unsub = dataService.subscribe(() => {
      setProducts(dataService.getProducts());
    });
    return () => unsub();
  }, []);

  const categories = dataService.getCategories();
  const brands = dataService.getBrands();

  // Filtering logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchQuery ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brandName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "ALL" || product.categoryId === selectedCategory;
    const matchesBrand = selectedBrand === "ALL" || product.brandId === selectedBrand;

    let matchesStock = true;
    if (stockFilter === "IN_STOCK") matchesStock = product.stock > 0;
    if (stockFilter === "LOW_STOCK") matchesStock = product.stock > 0 && product.stock <= 5;
    if (stockFilter === "OUT_OF_STOCK") matchesStock = product.stock === 0;

    return matchesSearch && matchesCategory && matchesBrand && matchesStock;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("დარწმუნებული ხართ, რომ გსურთ პროდუქტის წაშლა?")) {
      dataService.deleteProduct(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`დარწმუნებული ხართ, რომ გსურთ ${selectedIds.length} პროდუქტის წაშლა?`)) {
      selectedIds.forEach((id) => dataService.deleteProduct(id));
      setSelectedIds([]);
    }
  };

  const handleDuplicateProduct = (product: Product) => {
    const duplicated = {
      ...product,
      id: undefined,
      title: `${product.title} (კოპია)`,
      slug: `${product.slug}-copy-${Date.now()}`,
    };
    dataService.saveProduct(duplicated);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 uppercase tracking-wider mb-1">
            <span>კატალოგის მართვა</span>
          </div>
          <h1 className="text-2xl text-slate-900 tracking-tight">
            პროდუქტები ({filteredProducts.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            პროდუქტების სრული ჩამონათვალი, ფასები, მარაგები და სწრაფი მოქმედებები.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-2xl text-xs transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>ახალი პროდუქტის დამატება</span>
          </Link>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ძიება: სახელი, SKU, ბრენდი..."
              className="w-full h-10 pl-10 pr-4 rounded-2xl border border-slate-200/80 text-xs text-slate-900 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 text-xs text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="ALL">ყველა კატეგორია</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* Brand Filter */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="h-10 px-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 text-xs text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
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
              className="h-10 px-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 text-xs text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
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
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between bg-blue-50/60 p-3 rounded-2xl border border-blue-200/60">
            <span className="text-xs text-blue-900 pl-2">
              არჩეულია {selectedIds.length} პროდუქტი
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>მასობრივი წაშლა</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Products Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5 w-10">
                  <button onClick={toggleSelectAll} className="cursor-pointer">
                    {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-5">პროდუქტი</th>
                <th className="py-3.5 px-5">SKU</th>
                <th className="py-3.5 px-5">კატეგორია</th>
                <th className="py-3.5 px-5">ბრენდი</th>
                <th className="py-3.5 px-5">ფასი</th>
                <th className="py-3.5 px-5">მარაგი</th>
                <th className="py-3.5 px-5 text-right">მოქმედება</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  const isOutOfStock = product.stock === 0;
                  const isLowStock = product.stock > 0 && product.stock <= 5;

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-blue-50/30" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-5">
                        <button onClick={() => toggleSelectId(product.id)} className="cursor-pointer">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* Product Image & Title */}
                      <td className="py-4 px-5 min-w-[240px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0] || "https://veli.store/media-cdn/__sized__/product/iphone16pro-thumbnail-200x200-95.jpg"}
                            alt={product.title}
                            className="w-11 h-11 object-contain rounded-2xl bg-slate-50 border border-slate-100 shrink-0"
                          />
                          <div>
                            <h4 className="text-slate-900 line-clamp-1 leading-snug">
                              {product.title}
                            </h4>
                            {product.isFeatured && (
                              <span className="text-[10px] text-blue-600 block">
                                ★ Featured Product
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-4 px-5 font-mono text-slate-500">
                        {product.sku || product.code || "SKU-N/A"}
                      </td>

                      {/* Category */}
                      <td className="py-4 px-5 text-slate-800">
                        {product.categoryName || "ზოგადი"}
                      </td>

                      {/* Brand */}
                      <td className="py-4 px-5 text-slate-800">
                        {product.brandName || "Generic"}
                      </td>

                      {/* Price & Discount */}
                      <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <span className="text-slate-900 block font-medium">
                            {product.discountPrice ? product.discountPrice : product.price} ₾
                          </span>
                          {product.discountPrice && (
                            <span className="text-[10px] text-slate-400 line-through block">
                              {product.price} ₾
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock Badge */}
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] ${
                            isOutOfStock
                              ? "bg-red-50 text-red-700 border border-red-200/80"
                              : isLowStock
                              ? "bg-amber-50 text-amber-700 border border-amber-200/80"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                          }`}
                        >
                          {isOutOfStock ? "ამოწურულია" : isLowStock ? `${product.stock} ცალი (ცოტაა)` : `${product.stock} ცალი`}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/product/${product.id}`}
                            target="_blank"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Storefront Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="რედაქტირება"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDuplicateProduct(product)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                            title="დუბლირება"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
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

    </div>
  );
}
