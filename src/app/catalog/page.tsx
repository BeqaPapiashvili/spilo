"use client";

import { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Tag,
  Check
} from "lucide-react";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  monthlyInstallment?: number;
  image: string;
  sku: string;
  brand: string;
  category: string;
  color: string;
  storage?: string;
  inStock: boolean;
}

const CATALOG_DATABASE: Product[] = [
  {
    id: "dji-neo",
    title: "დრონი DJI Neo Drone Gray",
    price: 799,
    discountPrice: 699,
    discountPercentage: 12,
    monthlyInstallment: 28,
    image: "https://veli.store/media-cdn/__sized__/product/DJI_Neo_Drone-1-thumbnail-200x200-95.jpeg",
    sku: "172122",
    brand: "DJI",
    category: "დრონები",
    color: "ნაცრისფერი",
    inStock: true,
  },
  {
    id: "dji-mini-4",
    title: "დრონი DJI Mini 4 Pro Fly More Combo",
    price: 3899,
    discountPrice: 3299,
    discountPercentage: 15,
    monthlyInstallment: 132,
    image: "https://veli.store/media-cdn/__sized__/product/DJI-ZM700_20250710210650-thumbnail-200x200-95.jpg",
    sku: "172123",
    brand: "DJI",
    category: "დრონები",
    color: "ნაცრისფერი",
    inStock: true,
  },
  {
    id: "dji-pocket-3",
    title: "სტაბილიზატორი DJI Osmo Pocket 3 Creator Combo",
    price: 2499,
    discountPrice: 2199,
    discountPercentage: 12,
    monthlyInstallment: 88,
    image: "https://veli.store/media-cdn/__sized__/product/DJI-ZPK300-C1-8_20250710160051-thumbnail-200x200-95.jpg",
    sku: "172124",
    brand: "DJI",
    category: "სტაბილიზატორები",
    color: "შავი",
    inStock: true,
  },
  {
    id: "dji-osmo-6",
    title: "სმარტფონის სტაბილიზატორი DJI Osmo Mobile 6",
    price: 599,
    discountPrice: 499,
    discountPercentage: 17,
    monthlyInstallment: 20,
    image: "https://veli.store/media-cdn/__sized__/product/DJI_Osmo_Mobile_7P-thumbnail-200x200-95.jpg",
    sku: "172125",
    brand: "DJI",
    category: "სტაბილიზატორები",
    color: "შავი",
    inStock: true,
  },
  {
    id: "dji-rc-n3",
    title: "დისტანციური მართვის პულტი DJI RC-N3 Remote Controller",
    price: 449,
    discountPrice: 379,
    discountPercentage: 15,
    monthlyInstallment: 15,
    image: "https://veli.store/media-cdn/__sized__/product/DJI_RC-N3-1-thumbnail-200x200-95.jpg",
    sku: "172126",
    brand: "DJI",
    category: "აქსესუარები",
    color: "ნაცრისფერი",
    inStock: true,
  },
  {
    id: "iphone-15-pro",
    title: "სმარტფონი Apple iPhone 15 Pro 128GB Natural Titanium",
    price: 3699,
    discountPrice: 3399,
    discountPercentage: 8,
    monthlyInstallment: 135,
    image: "https://veli.store/media-cdn/__sized__/product/DJI-ZM700_20250710210650-thumbnail-200x200-95.jpg",
    sku: "180900",
    brand: "Apple",
    category: "სმარტფონები",
    color: "ნაცრისფერი",
    storage: "128GB",
    inStock: true,
  },
  {
    id: "samsung-s24-ultra",
    title: "სმარტფონი Samsung Galaxy S24 Ultra 512GB Titanium Black",
    price: 4299,
    discountPrice: 3899,
    discountPercentage: 9,
    monthlyInstallment: 155,
    image: "https://veli.store/media-cdn/__sized__/product/DJI-ZPK300-C1-8_20250710160051-thumbnail-200x200-95.jpg",
    sku: "180901",
    brand: "Samsung",
    category: "სმარტფონები",
    color: "შავი",
    storage: "512GB",
    inStock: true,
  },
  {
    id: "xiaomi-14-ultra",
    title: "სმარტფონი Xiaomi 14 Ultra 512GB Black",
    price: 3199,
    discountPrice: 2899,
    discountPercentage: 9,
    monthlyInstallment: 115,
    image: "https://veli.store/media-cdn/__sized__/product/DJI_Osmo_Mobile_7P-thumbnail-200x200-95.jpg",
    sku: "180902",
    brand: "Xiaomi",
    category: "სმარტფონები",
    color: "შავი",
    storage: "512GB",
    inStock: true,
  },
];

const COLOR_OPTIONS = [
  { id: "შავი", label: "შავი", hex: "#111111" },
  { id: "ნაცრისფერი", label: "ნაცრისფერი", hex: "#9CA3AF" },
  { id: "თეთრი", label: "თეთრი", hex: "#FFFFFF" },
  { id: "ლურჯი", label: "ლურჯი", hex: "#2563EB" },
];

const STORAGE_OPTIONS = ["128GB", "256GB", "512GB", "1TB"];
const ABSOLUTE_MAX_PRICE = 5000;

type SortOption = "default" | "all" | "price-desc" | "price-asc" | "name-asc" | "name-desc";

function CatalogContent() {
  // Filter States
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(ABSOLUTE_MAX_PRICE);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // Mobile Filter Drawer Toggle
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Accordion Section Toggle States
  const [brandOpen, setBrandOpen] = useState(true);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [colorOpen, setColorOpen] = useState(true);
  const [storageOpen, setStorageOpen] = useState(true);

  // Available Brands & Categories with Counts
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATALOG_DATABASE.forEach(p => {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return counts;
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATALOG_DATABASE.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

  const handleMinPriceChange = (val: number) => {
    const newMin = Math.min(val, maxPrice - 50);
    setMinPrice(Math.max(0, newMin));
  };

  const handleMaxPriceChange = (val: number) => {
    const newMax = Math.max(val, minPrice + 50);
    setMaxPrice(Math.min(ABSOLUTE_MAX_PRICE, newMax));
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const handleStorageToggle = (storage: string) => {
    setSelectedStorage(prev =>
      prev.includes(storage) ? prev.filter(s => s !== storage) : [...prev, storage]
    );
  };

  const resetFilters = () => {
    setMinPrice(0);
    setMaxPrice(ABSOLUTE_MAX_PRICE);
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedStorage([]);
    setOnlyDiscounted(false);
    setSortBy("default");
  };

  const activeFiltersCount = 
    selectedBrands.length + 
    selectedCategories.length + 
    selectedColors.length + 
    selectedStorage.length + 
    (onlyDiscounted ? 1 : 0) + 
    (minPrice > 0 || maxPrice < ABSOLUTE_MAX_PRICE ? 1 : 0);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return CATALOG_DATABASE.filter(product => {
      // Price filter
      const effectivePrice = product.discountPrice || product.price;
      if (effectivePrice < minPrice || effectivePrice > maxPrice) return false;

      // Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false;

      // Color filter
      if (selectedColors.length > 0 && !selectedColors.includes(product.color)) return false;

      // Storage filter
      if (selectedStorage.length > 0 && product.storage && !selectedStorage.includes(product.storage)) return false;

      // Discount filter
      if (onlyDiscounted && !product.discountPrice) return false;

      return true;
    }).sort((a, b) => {
      const priceA = a.discountPrice || a.price;
      const priceB = b.discountPrice || b.price;
      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "name-asc") return a.title.localeCompare(b.title, "ka");
      if (sortBy === "name-desc") return b.title.localeCompare(a.title, "ka");
      return 0;
    });
  }, [minPrice, maxPrice, selectedBrands, selectedCategories, selectedColors, selectedStorage, onlyDiscounted, sortBy]);

  // Dual Slider Math
  const minPercent = (minPrice / ABSOLUTE_MAX_PRICE) * 100;
  const maxPercent = (maxPrice / ABSOLUTE_MAX_PRICE) * 100;

  return (
    <div className="container mx-auto px-4 lg:px-6 max-w-[1600px] space-y-8">
      
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200/80">
        <div>
          <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight flex items-center gap-2">
            <span>კატალოგი & კატეგორიები</span>
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            სულ მოიძებნა <span className="text-gray-900">{filteredProducts.length}</span> პროდუქტი
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-xl text-xs text-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.015)] cursor-pointer border border-gray-100"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>ფილტრები ({activeFiltersCount})</span>
          </button>

          {/* Clean Sort Pill Button */}
          <div className="relative">
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              onBlur={() => setTimeout(() => setIsSortDropdownOpen(false), 200)}
              className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl text-xs text-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.015)] cursor-pointer select-none border border-transparent hover:border-gray-200/60 transition-all"
            >
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900">
                {sortBy === "default" && "სორტირება"}
                {sortBy === "all" && "ყველა"}
                {sortBy === "price-desc" && "ფასი: კლებადობით"}
                {sortBy === "price-asc" && "ფასი: ზრდადობით"}
                {sortBy === "name-asc" && "დასახელება: A-Z"}
                {sortBy === "name-desc" && "დასახელება: Z-A"}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 ml-0.5 transition-transform duration-200 ${isSortDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isSortDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 min-w-[200px] z-30 space-y-0.5">
                {[
                  { id: "all", label: "ყველა" },
                  { id: "price-desc", label: "ფასი: კლებადობით" },
                  { id: "price-asc", label: "ფასი: ზრდადობით" },
                  { id: "name-asc", label: "დასახელება: A-Z" },
                  { id: "name-desc", label: "დასახელება: Z-A" },
                ].map((opt) => {
                  const isSelected = sortBy === opt.id;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setSortBy(opt.id as any);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-3.5 py-2 text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50/80 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Catalog Layout (Spacious 320px Sidebar + 4-Column Grid) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* 100% Custom Roomy Left Filter Sidebar (320px Width) */}
        <aside className={`w-full lg:w-[320px] shrink-0 bg-white rounded-2xl p-6 md:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6 ${
          isMobileFilterOpen ? "block" : "hidden lg:block"
        }`}>
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-900">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>ფილტრაცია</span>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-50 text-blue-600 text-[11px] px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>გასუფთავება</span>
              </button>
            )}
          </div>

          {/* 100% Custom Dual-Thumb Price Slider Section */}
          <div className="space-y-4 pb-5 border-b border-gray-100">
            <button
              onClick={() => setPriceOpen(!priceOpen)}
              className="w-full flex items-center justify-between text-xs text-gray-900 cursor-pointer"
            >
              <span>ფასის ინტერვალი (₾)</span>
              {priceOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {priceOpen && (
              <div className="space-y-4 pt-1">
                
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-[#F8FAFD] p-2.5 rounded-xl border border-gray-100 focus-within:border-blue-500 transition-colors">
                    <span className="text-[10px] text-gray-400 block">დან</span>
                    <div className="flex items-center justify-between pt-0.5">
                      <input
                        type="number"
                        min={0}
                        max={maxPrice - 50}
                        value={minPrice}
                        onChange={(e) => handleMinPriceChange(Number(e.target.value))}
                        className="w-full bg-transparent text-gray-900 focus:outline-none text-xs"
                      />
                      <span className="text-gray-400 text-xs shrink-0">₾</span>
                    </div>
                  </div>

                  <div className="bg-[#F8FAFD] p-2.5 rounded-xl border border-gray-100 focus-within:border-blue-500 transition-colors">
                    <span className="text-[10px] text-gray-400 block">მდე</span>
                    <div className="flex items-center justify-between pt-0.5">
                      <input
                        type="number"
                        min={minPrice + 50}
                        max={ABSOLUTE_MAX_PRICE}
                        value={maxPrice}
                        onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                        className="w-full bg-transparent text-gray-900 focus:outline-none text-xs"
                      />
                      <span className="text-gray-400 text-xs shrink-0">₾</span>
                    </div>
                  </div>
                </div>

                <div className="relative py-3">
                  <div className="h-2 bg-gray-100 rounded-full relative w-full overflow-hidden">
                    <div
                      className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      style={{
                        left: `${minPercent}%`,
                        width: `${maxPercent - minPercent}%`,
                      }}
                    />
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={ABSOLUTE_MAX_PRICE}
                    step={25}
                    value={minPrice}
                    onChange={(e) => handleMinPriceChange(Number(e.target.value))}
                    className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-[0_4px_12px_rgba(37,99,235,0.3)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                  />

                  <input
                    type="range"
                    min={0}
                    max={ABSOLUTE_MAX_PRICE}
                    step={25}
                    value={maxPrice}
                    onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                    className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-[0_4px_12px_rgba(37,99,235,0.3)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: "0 - 500 ₾", min: 0, max: 500 },
                    { label: "500 - 1500 ₾", min: 500, max: 1500 },
                    { label: "1500 - 3500 ₾", min: 1500, max: 3500 },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setMinPrice(preset.min);
                        setMaxPrice(preset.max);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        minPrice === preset.min && maxPrice === preset.max
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-[#F8FAFD] text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

              </div>
            )}
          </div>

          {/* Custom Brand Filter */}
          <div className="space-y-3 pb-5 border-b border-gray-100">
            <button
              onClick={() => setBrandOpen(!brandOpen)}
              className="w-full flex items-center justify-between text-xs text-gray-900 cursor-pointer"
            >
              <span>ბრენდი</span>
              {brandOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {brandOpen && (
              <div className="space-y-2.5 pt-1 text-xs text-gray-700">
                {Object.entries(brandCounts).map(([brand, count]) => {
                  const isChecked = selectedBrands.includes(brand);

                  return (
                    <div
                      key={brand}
                      onClick={() => handleBrandToggle(brand)}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                            isChecked
                              ? "bg-blue-600 border border-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)]"
                              : "bg-[#F8FAFD] border border-gray-200 group-hover:border-blue-400"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="group-hover:text-gray-900 transition-colors">{brand}</span>
                      </div>
                      <span className="text-[11px] text-gray-400">({count})</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Category Filter */}
          <div className="space-y-3 pb-5 border-b border-gray-100">
            <button
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="w-full flex items-center justify-between text-xs text-gray-900 cursor-pointer"
            >
              <span>კატეგორია</span>
              {categoryOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {categoryOpen && (
              <div className="space-y-2.5 pt-1 text-xs text-gray-700">
                {Object.entries(categoryCounts).map(([cat, count]) => {
                  const isChecked = selectedCategories.includes(cat);

                  return (
                    <div
                      key={cat}
                      onClick={() => handleCategoryToggle(cat)}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                            isChecked
                              ? "bg-blue-600 border border-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)]"
                              : "bg-[#F8FAFD] border border-gray-200 group-hover:border-blue-400"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="group-hover:text-gray-900 transition-colors">{cat}</span>
                      </div>
                      <span className="text-[11px] text-gray-400">({count})</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Color Selector */}
          <div className="space-y-3 pb-5 border-b border-gray-100">
            <button
              onClick={() => setColorOpen(!colorOpen)}
              className="w-full flex items-center justify-between text-xs text-gray-900 cursor-pointer"
            >
              <span>ფერი</span>
              {colorOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {colorOpen && (
              <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                {COLOR_OPTIONS.map((c) => {
                  const isSelected = selectedColors.includes(c.id);

                  return (
                    <button
                      key={c.id}
                      onClick={() => handleColorToggle(c.id)}
                      title={c.label}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                        isSelected 
                          ? "ring-2 ring-blue-600 border-white shadow-xs" 
                          : "border-gray-200 hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && (
                        <Check className={`w-4 h-4 ${c.id === "თეთრი" ? "text-gray-900" : "text-white"}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Storage Option Pills */}
          <div className="space-y-3 pb-5 border-b border-gray-100">
            <button
              onClick={() => setStorageOpen(!storageOpen)}
              className="w-full flex items-center justify-between text-xs text-gray-900 cursor-pointer"
            >
              <span>შიდა მეხსიერება</span>
              {storageOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {storageOpen && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {STORAGE_OPTIONS.map((s) => {
                  const isSelected = selectedStorage.includes(s);

                  return (
                    <button
                      key={s}
                      onClick={() => handleStorageToggle(s)}
                      className={`py-2 px-3 rounded-xl text-xs transition-all cursor-pointer text-center ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)]"
                          : "bg-[#F8FAFD] text-gray-700 hover:bg-gray-100 border border-gray-100"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Toggle Switch */}
          <div
            onClick={() => setOnlyDiscounted(!onlyDiscounted)}
            className="flex items-center justify-between pt-1 text-xs text-gray-900 cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-red-500" />
              <span>მხოლოდ ფასდაკლებული</span>
            </div>

            <div
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                onlyDiscounted ? "bg-blue-600" : "bg-gray-200 group-hover:bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  onlyDiscounted ? "translate-x-4" : ""
                }`}
              />
            </div>
          </div>

        </aside>

        {/* Right Product Grid */}
        <main className="flex-1 w-full space-y-6">
          
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.015)] my-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h2 className="text-lg md:text-xl text-gray-900">
                არჩეული ფილტრებით ნივთი ვერ მოიძებნა
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                სცადეთ ფილტრების გასუფთავება.
              </p>
              <div className="pt-2">
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition-colors cursor-pointer"
                >
                  ფილტრების გასუფთავება
                </button>
              </div>
            </div>
          )}

        </main>

      </div>

    </div>
  );
}

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans pb-24">
      
      {/* Top Breadcrumbs */}
      <div className="py-3.5 bg-white border-b border-gray-100 mb-8">
        <div className="container mx-auto px-4 lg:px-6 max-w-[1600px]">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              მთავარი
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-900">კატალოგი</span>
          </nav>
        </div>
      </div>

      <main>
        <Suspense fallback={
          <div className="container mx-auto px-4 py-12 text-center text-gray-400 text-sm">
            იტვირთება კატალოგი...
          </div>
        }>
          <CatalogContent />
        </Suspense>
      </main>
    </div>
  );
}
