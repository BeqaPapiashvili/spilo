"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Copy, 
  Eye, 
  Archive, 
  Trash2, 
  CheckSquare, 
  Square, 
  Download, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Sparkles
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">
            <span>კატალოგის მართვა</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            პროდუქტები ({filteredProducts.length})
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            პროდუქტების სრული ჩამონათვალი, ფასები, მარაგები და სწრაფი მოქმედებები.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>ახალი პროდუქტის დამატება</span>
          </Link>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ძიება: სახელი, SKU, ბრენდი..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 text-xs text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50/50 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
              className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50/50 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
              className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50/50 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between bg-blue-50/60 p-2.5 rounded-xl border-blue-200">
            <span className="text-xs text-blue-900 font-semibold pl-2">
              არჩეულია {selectedIds.length} პროდუქტი
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>მასობრივი წაშლა</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Products Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50/80 text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 w-10">
                  <button onClick={toggleSelectAll} className="cursor-pointer">
                    {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">პროდუქტი</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">კატეგორია</th>
                <th className="py-3 px-4">ბრენდი</th>
                <th className="py-3 px-4">ფასი</th>
                <th className="py-3 px-4">მარაგი</th>
                <th className="py-3 px-4 text-right">მოქმედება</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  const isOutOfStock = product.stock === 0;
                  const isLowStock = product.stock > 0 && product.stock <= 5;

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        isSelected ? "bg-blue-50/30" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <button onClick={() => toggleSelectId(product.id)} className="cursor-pointer">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-300" />
                          )}
                        </button>
                      </td>

                      {/* Product Image & Title */}
                      <td className="py-3.5 px-4 min-w-[240px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0] || "https://veli.store/media-cdn/__sized__/product/iphone16pro-thumbnail-200x200-95.jpg"}
                            alt={product.title}
                            className="w-11 h-11 object-contain rounded-xl bg-gray-50 border border-gray-100 shrink-0"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900 line-clamp-1 leading-snug">
                              {product.title}
                            </h4>
                            {product.isFeatured && (
                              <span className="text-[10px] text-blue-600 font-medium block">
                                ★ Featured Product
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-4 font-mono text-gray-500 font-medium">
                        {product.sku || product.code || "SKU-N/A"}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-medium text-gray-800">
                        {product.categoryName || "ზოგადი"}
                      </td>

                      {/* Brand */}
                      <td className="py-3.5 px-4 font-medium text-gray-800">
                        {product.brandName || "Generic"}
                      </td>

                      {/* Price & Discount */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-gray-900 block">
                            {product.discountPrice ? product.discountPrice : product.price} ₾
                          </span>
                          {product.discountPrice && (
                            <span className="text-[10px] text-gray-400 line-through block">
                              {product.price} ₾
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                            isOutOfStock
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : isLowStock
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {isOutOfStock ? "ამოწურულია" : isLowStock ? `${product.stock} ცალი (ცოტაა)` : `${product.stock} ცალი`}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/product/${product.id}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Storefront Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="რედაქტირება"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDuplicateProduct(product)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="დუბლირება"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
                  <td colSpan={8} className="py-12 text-center text-gray-400 text-xs">
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
