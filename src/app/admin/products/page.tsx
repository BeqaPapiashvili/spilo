"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Edit3, 
  Copy, 
  Eye, 
  Trash2, 
  Package, 
  Download, 
  UploadCloud,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  X,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Sparkles,
  Zap,
  TrendingDown,
  Layers,
  Award,
  FilterX
} from "lucide-react";
import { Product, Category } from "@/types";
import { exportProductsToCSV } from "@/utils/exportImport";
import { ProductImportModal } from "@/components/admin/ProductImportModal";
import { CustomSelect, CustomSelectOption } from "@/components/admin/ui/CustomSelect";
import { CustomCheckbox } from "@/components/admin/ui/CustomCheckbox";
import ProductCard from "@/components/ProductCard";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selection & Filters
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedBrand, setSelectedBrand] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Modals & Drawers
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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
      console.error("AdminProductsPage: Failed to load data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brandName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat = selectedCategory === "ALL" || p.categoryId === selectedCategory;
      const matchBrand = selectedBrand === "ALL" || p.brandId === selectedBrand;

      let matchStock = true;
      if (stockFilter === "IN_STOCK") matchStock = p.stock > 0;
      if (stockFilter === "LOW_STOCK") matchStock = p.stock > 0 && p.stock <= 5;
      if (stockFilter === "OUT_OF_STOCK") matchStock = p.stock <= 0;
      if (stockFilter === "FEATURED") matchStock = Boolean(p.isFeatured);
      if (stockFilter === "DISCOUNTED") matchStock = Boolean(p.discountPrice && p.discountPrice < p.price);

      return matchSearch && matchCat && matchBrand && matchStock;
    }).sort((a, b) => {
      if (sortBy === "NEWEST") return (b.id || "").localeCompare(a.id || "");
      if (sortBy === "OLDEST") return (a.id || "").localeCompare(b.id || "");
      if (sortBy === "PRICE_ASC") return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      if (sortBy === "PRICE_DESC") return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      if (sortBy === "STOCK_ASC") return a.stock - b.stock;
      if (sortBy === "STOCK_DESC") return b.stock - a.stock;
      if (sortBy === "TITLE_ASC") return a.title.localeCompare(b.title);
      return 0;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand, stockFilter, sortBy]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Metrics Counters
  const metrics = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.stock > 5).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStock = products.filter((p) => p.stock <= 0).length;
    const discounted = products.filter((p) => p.discountPrice && p.discountPrice < p.price).length;
    const featured = products.filter((p) => p.isFeatured).length;
    return { total, inStock, lowStock, outOfStock, discounted, featured };
  }, [products]);

  // Category & Brand Options for CustomSelect
  const categoryOptions: CustomSelectOption[] = useMemo(() => {
    return [
      { value: "ALL", label: "ყველა კატეგორია" },
      ...categories.map((c) => ({
        value: c.id,
        label: c.name,
        badge: `${products.filter((p) => p.categoryId === c.id).length}`,
      })),
    ];
  }, [categories, products]);

  const brandOptions: CustomSelectOption[] = useMemo(() => {
    return [
      { value: "ALL", label: "ყველა ბრენდი" },
      ...brands.map((b) => ({
        value: b.id,
        label: b.name,
        badge: `${products.filter((p) => p.brandId === b.id).length}`,
      })),
    ];
  }, [brands, products]);

  const stockFilterOptions: CustomSelectOption[] = [
    { value: "ALL", label: "ყველა სტატუსი" },
    { value: "IN_STOCK", label: `მარაგშია (${metrics.inStock})` },
    { value: "LOW_STOCK", label: `იწურება (${metrics.lowStock})` },
    { value: "OUT_OF_STOCK", label: `ამოწურულია (${metrics.outOfStock})` },
    { value: "DISCOUNTED", label: `ფასდაკლებული (${metrics.discounted})` },
    { value: "FEATURED", label: `Featured (${metrics.featured})` },
  ];

  const sortOptions: CustomSelectOption[] = [
    { value: "NEWEST", label: "უახლესი პირველი" },
    { value: "OLDEST", label: "ძველი პირველი" },
    { value: "PRICE_ASC", label: "ფასი: ზრდადი" },
    { value: "PRICE_DESC", label: "ფასი: კლებადი" },
    { value: "STOCK_DESC", label: "მარაგი: მაღლიდან დაბლა" },
    { value: "STOCK_ASC", label: "მარაგი: დაბლიდან მაღლა" },
    { value: "TITLE_ASC", label: "დასახელება: A-Z" },
  ];

  const isFiltered = searchQuery !== "" || selectedCategory !== "ALL" || selectedBrand !== "ALL" || stockFilter !== "ALL";

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedBrand("ALL");
    setStockFilter("ALL");
    setCurrentPage(1);
  };

  // Selection Logic
  const isAllSelected = paginatedProducts.length > 0 && paginatedProducts.every((p) => selectedIds.includes(p.id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedProducts.some((p) => p.id === id)));
    } else {
      const newIds = Array.from(new Set([...selectedIds, ...paginatedProducts.map((p) => p.id)]));
      setSelectedIds(newIds);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Safe Single Delete
  const handleOpenDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setIsBulkDeleting(false);
    setIsDeleteModalOpen(true);
  };

  // Safe Bulk Delete
  const handleOpenBulkDeleteModal = () => {
    setIsBulkDeleting(true);
    setProductToDelete(null);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setActionLoadingId("delete");
    try {
      if (isBulkDeleting) {
        await Promise.all(
          selectedIds.map((id) => fetch(`/api/products/${encodeURIComponent(id)}`, { method: "DELETE" }))
        );
        setSelectedIds([]);
      } else if (productToDelete) {
        const res = await fetch(`/api/products/${encodeURIComponent(productToDelete.id)}`, { method: "DELETE" });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "წაშლა ვერ მოხერხდა");
        setSelectedIds((prev) => prev.filter((x) => x !== productToDelete.id));
      }
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      loadData();
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.message || "შეცდომა წაშლისას");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Duplicate Action
  const handleDuplicate = async (p: Product) => {
    setActionLoadingId(p.id);
    try {
      const payload = {
        title: `${p.title} (კოპია)`,
        slug: `${p.slug}-copy-${Date.now().toString().slice(-4)}`,
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
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStockBadge = (p: Product) => {
    if (p.stock <= 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 border border-red-200/80 rounded-lg text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span>ამოწურულია</span>
        </span>
      );
    }
    if (p.stock <= 5) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-lg text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>{p.stock} ცალი (იწურება)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-lg text-[11px]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>{p.stock} ცალი</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. Header Bar with Actions */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-zinc-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF5F2] text-[#FF5238] border border-[#FED7CC] rounded-full text-xs">
            <Package className="w-3.5 h-3.5" />
            <span>კატალოგის მართვა</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-zinc-900 tracking-tight">
            პროდუქტები ({filteredProducts.length})
          </h1>
          <p className="text-xs md:text-sm text-zinc-500">
            მართეთ პროდუქციის კატალოგი, ფასები, მარაგები, SKU და მახასიათებლები
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="h-11 px-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
            title="განახლება"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">განახლება</span>
          </button>

          <button
            type="button"
            onClick={() => exportProductsToCSV(products)}
            className="h-11 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>ექსპორტი (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="h-11 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>იმპორტი</span>
          </button>

          <Link
            href="/admin/products/new"
            className="h-11 px-5 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-2xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>ახალი პროდუქტი</span>
          </Link>
        </div>
      </div>

      {/* 2. Interactive KPI Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "სულ პროდუქტი", value: metrics.total, icon: Package, filter: "ALL", bg: "bg-zinc-50 border-zinc-200 text-zinc-800" },
          { label: "მარაგშია", value: metrics.inStock, icon: CheckCircle2, filter: "IN_STOCK", bg: "bg-emerald-50/70 border-emerald-200/80 text-emerald-800" },
          { label: "მარაგი იწურება", value: metrics.lowStock, icon: AlertTriangle, filter: "LOW_STOCK", bg: "bg-amber-50/70 border-amber-200/80 text-amber-800" },
          { label: "ამოწურულია", value: metrics.outOfStock, icon: X, filter: "OUT_OF_STOCK", bg: "bg-red-50/70 border-red-200/80 text-red-800" },
          { label: "ფასდაკლებული", value: metrics.discounted, icon: TrendingDown, filter: "DISCOUNTED", bg: "bg-[#FFF5F2] border-[#FED7CC] text-[#FF5238]" },
          { label: "Featured / აქცია", value: metrics.featured, icon: Sparkles, filter: "FEATURED", bg: "bg-purple-50/70 border-purple-200/80 text-purple-800" },
        ].map((m, idx) => {
          const Icon = m.icon;
          const isActive = stockFilter === m.filter;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setStockFilter(isActive ? "ALL" : m.filter);
                setCurrentPage(1);
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer select-none ${m.bg} ${
                isActive ? "ring-2 ring-[#FF5238] shadow-xs scale-[1.02]" : "hover:shadow-2xs opacity-90 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] opacity-75">{m.label}</span>
                <Icon className="w-3.5 h-3.5 opacity-60" />
              </div>
              <p className="text-xl text-zinc-900 mt-1 tracking-tight">{m.value}</p>
            </button>
          );
        })}
      </div>

      {/* 3. Multi-Filter & Search Toolbar (Custom Controls) */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-xs space-y-4">
        
        {/* Top Search & View Switcher Row */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ძებნა: დასახელება, SKU, კოდი, ბრენდი..."
              className="w-full h-11 pl-10 pr-10 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#FF5238]/15 focus:border-[#FF5238] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* View Mode Toggle */}
            <div className="p-1 bg-zinc-100 rounded-xl flex items-center gap-1 border border-zinc-200/60">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === "table" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-500 hover:text-zinc-900"
                }`}
                title="ცხრილის ხედი"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === "grid" ? "bg-white text-zinc-900 shadow-2xs" : "text-zinc-500 hover:text-zinc-900"
                }`}
                title="ბარათების ხედი"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="h-10 px-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>გასუფთავება</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom CustomSelect Filter Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-zinc-100">
          <CustomSelect
            placeholder="კატეგორია"
            options={categoryOptions}
            value={selectedCategory}
            onChange={(val) => {
              setSelectedCategory(val);
              setCurrentPage(1);
            }}
          />

          <CustomSelect
            placeholder="ბრენდი"
            options={brandOptions}
            value={selectedBrand}
            onChange={(val) => {
              setSelectedBrand(val);
              setCurrentPage(1);
            }}
          />

          <CustomSelect
            placeholder="მარაგის სტატუსი"
            options={stockFilterOptions}
            value={stockFilter}
            onChange={(val) => {
              setStockFilter(val);
              setCurrentPage(1);
            }}
          />

          <CustomSelect
            placeholder="დალაგება"
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
          />
        </div>

      </div>

      {/* 4. Bulk Action Notification Bar (When items selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-[#18181B] text-white p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-xl bg-[#FF5238] text-white text-xs flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-xs text-zinc-200">პროდუქტი მონიშნულია</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportProductsToCSV(products.filter((p) => selectedIds.includes(p.id)))}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>მონიშნულის ექსპორტი</span>
            </button>

            <button
              type="button"
              onClick={handleOpenBulkDeleteModal}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>მონიშნულის წაშლა</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-2 text-zinc-400 hover:text-white text-xs transition-colors cursor-pointer"
            >
              გაუქმება
            </button>
          </div>
        </div>
      )}

      {/* 5. Main Product Content: Table or Grid View */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 border border-zinc-200/80 shadow-xs flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#FF5238]" />
          <p className="text-xs text-zinc-500">იტვირთება პროდუქტების მონაცემთა ბაზა...</p>
        </div>
      ) : paginatedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200/80 shadow-xs space-y-4">
          <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-3xl flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base text-zinc-900">პროდუქტი ვერ მოიძებნა</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              მითითებული ფილტრებით ჩანაწერი არ არსებობს. სცადეთ ძიების გასუფთავება.
            </p>
          </div>
          {isFiltered && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs cursor-pointer transition-colors"
            >
              ფილტრების გასუფთავება
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 text-[11px] select-none">
                  <th className="py-3.5 px-4 w-12 text-center">
                    <div className="flex items-center justify-center">
                      <CustomCheckbox
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                      />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">პროდუქტი</th>
                  <th className="py-3.5 px-4">SKU / კოდი</th>
                  <th className="py-3.5 px-4">კატეგორია</th>
                  <th className="py-3.5 px-4">ბრენდი</th>
                  <th className="py-3.5 px-4">ფასი</th>
                  <th className="py-3.5 px-4">მარაგი</th>
                  <th className="py-3.5 px-4 text-right pr-6">მოქმედებები</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {paginatedProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const prodImg = (p.images && p.images[0]) || p.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";
                  const effectivePrice = p.discountPrice || p.price;
                  const discountPct = p.discountPercentage || (p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-zinc-50/80 transition-colors group ${
                        isSelected ? "bg-[#FFF5F2]/50" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center">
                          <CustomCheckbox
                            checked={isSelected}
                            onChange={() => toggleSelectOne(p.id)}
                          />
                        </div>
                      </td>

                      {/* Product Thumbnail & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => setPreviewProduct(p)}
                            className="w-12 h-12 rounded-xl bg-white border border-zinc-200 p-1 shrink-0 cursor-pointer overflow-hidden flex items-center justify-center hover:border-[#FF5238] transition-colors"
                            title="სწრაფი დათვალიერება"
                          >
                            <img
                              src={prodImg}
                              alt={p.title}
                              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0 max-w-[280px]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {p.isFeatured && (
                                <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded font-sans">Featured</span>
                              )}
                              {p.isFlashDeal && (
                                <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-sans">Flash Deal</span>
                              )}
                            </div>
                            <Link
                              href={`/admin/products/${p.id}/edit`}
                              className="text-zinc-900 hover:text-[#FF5238] transition-colors line-clamp-1 block leading-snug"
                              title={p.title}
                            >
                              {p.title}
                            </Link>
                            <span className="text-[10px] text-zinc-400 font-mono">ID: {p.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* SKU & Code */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-600">
                        <div>{p.sku || "-"}</div>
                        {p.code && <div className="text-[10px] text-zinc-400">{p.code}</div>}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 bg-zinc-100 rounded-lg text-[11px] text-zinc-700 whitespace-nowrap">
                          {p.categoryName || p.categoryId}
                        </span>
                      </td>

                      {/* Brand */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 bg-zinc-100 rounded-lg text-[11px] text-zinc-700 whitespace-nowrap">
                          {p.brandName || p.brandId}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="text-zinc-900">{effectivePrice.toFixed(0)} ₾</span>
                          {p.discountPrice && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-zinc-400 line-through">
                                {p.price.toFixed(0)} ₾
                              </span>
                              {discountPct > 0 && (
                                <span className="text-[9px] bg-[#10B981] text-white px-1 py-0.2 rounded">
                                  -{discountPct}%
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Stock Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">{getStockBadge(p)}</td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewProduct(p)}
                            title="სწრაფი გადახედვა"
                            className="p-2 text-zinc-400 hover:text-[#FF5238] hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <Link
                            href={`/product/${p.id}`}
                            target="_blank"
                            title="მაღაზიაში გახსნა"
                            className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            disabled={actionLoadingId === p.id}
                            onClick={() => handleDuplicate(p)}
                            title="დუბლირება (ასლი)"
                            className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {actionLoadingId === p.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            title="რედაქტირება"
                            className="p-2 text-zinc-400 hover:text-amber-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(p)}
                            title="პროდუქტის წაშლა"
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
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
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {paginatedProducts.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            const prodImg = (p.images && p.images[0]) || p.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";

            return (
              <div
                key={p.id}
                className={`bg-white rounded-3xl p-4 border transition-all flex flex-col justify-between gap-3 relative group ${
                  isSelected ? "border-[#FF5238] ring-2 ring-[#FF5238]/20 bg-[#FFF5F2]/20" : "border-zinc-200/80 hover:border-zinc-300 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <CustomCheckbox
                    checked={isSelected}
                    onChange={() => toggleSelectOne(p.id)}
                  />
                  {getStockBadge(p)}
                </div>

                <div
                  onClick={() => setPreviewProduct(p)}
                  className="w-full h-40 flex items-center justify-center p-2 cursor-pointer overflow-hidden"
                >
                  <img
                    src={prodImg}
                    alt={p.title}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="space-y-1.5">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="text-xs text-zinc-900 hover:text-[#FF5238] line-clamp-2 block leading-snug"
                  >
                    {p.title}
                  </Link>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
                    <div>
                      <span className="text-sm text-zinc-900">₾{(p.discountPrice || p.price).toFixed(0)}</span>
                      {p.discountPrice && (
                        <span className="text-[10px] text-zinc-400 line-through block">
                          ₾{p.price.toFixed(0)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="p-1.5 text-zinc-400 hover:text-amber-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                        title="რედაქტირება"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleOpenDeleteModal(p)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="წაშლა"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Modern Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-zinc-500">
            ნაჩვენებია <span className="text-zinc-900">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
            <span className="text-zinc-900">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> სულ{" "}
            <span className="text-zinc-900">{filteredProducts.length}</span> პროდუქტიდან
          </div>

          <div className="flex items-center gap-2 self-center">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                let pageNum = idx + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + idx;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - idx);
                }
                const isActive = currentPage === pageNum;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#FF5238] text-white shadow-2xs"
                        : "text-zinc-700 hover:bg-zinc-100 border border-zinc-200/60"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 7. Safe Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base text-zinc-900">
                {isBulkDeleting ? `${selectedIds.length} პროდუქტის წაშლა` : "პროდუქტის წაშლის დადასტურება"}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {isBulkDeleting
                  ? "ნამდვილად გსურთ არჩეული პროდუქტების წაშლა? ეს ქმედება შეუქცევადია და წაშლის მონაცემებს ბაზიდან."
                  : `ნამდვილად გსურთ "${productToDelete?.title}"-ის წაშლა?`}
              </p>
            </div>

            {productToDelete && (
              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80 flex items-center gap-3">
                <img
                  src={(productToDelete.images && productToDelete.images[0]) || productToDelete.image || "/placeholder.png"}
                  alt={productToDelete.title}
                  className="w-10 h-10 object-contain rounded-lg bg-white border border-zinc-200 p-0.5"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-zinc-900 truncate">{productToDelete.title}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">SKU: {productToDelete.sku || productToDelete.id}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs transition-colors cursor-pointer"
              >
                გაუქმება
              </button>

              <button
                type="button"
                disabled={actionLoadingId === "delete"}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {actionLoadingId === "delete" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>წაშლის დადასტურება</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Quick Inspection Modal */}
      {previewProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-zinc-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm text-zinc-900">სწრაფი დათვალიერება</h3>
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-2">
              <ProductCard
                id={previewProduct.id}
                title={previewProduct.title}
                price={previewProduct.price}
                discountPrice={previewProduct.discountPrice}
                image={(previewProduct.images && previewProduct.images[0]) || previewProduct.image || "/placeholder.png"}
                images={previewProduct.images}
                stock={previewProduct.stock}
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
              <Link
                href={`/admin/products/${previewProduct.id}/edit`}
                className="flex-1 py-2.5 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>რედაქტირება</span>
              </Link>

              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs cursor-pointer transition-colors"
              >
                დახურვა
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Product Import Modal */}
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
