"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Tag,
  Check
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { ProductGridSkeleton } from "@/components/skeletons/ProductGridSkeleton";
import { useCatalogFilters, ABSOLUTE_MAX_PRICE } from "@/hooks/useCatalogFilters";

const COLOR_OPTIONS = [
  { id: "ნაცრისფერი", label: "ნაცრისფერი", hex: "#9CA3AF" },
  { id: "შავი", label: "შავი", hex: "#111827" },
  { id: "თეთრი", label: "თეთრი", hex: "#FFFFFF" },
  { id: "Natural Titanium", label: "Natural Titanium", hex: "#C5C1B8" },
  { id: "Space Black", label: "Space Black", hex: "#1F2937" },
  { id: "ბეჟი", label: "ბეჟი", hex: "#F5F5DC" },
];

const STORAGE_OPTIONS = ["128GB", "256GB", "512GB", "1TB", "22GB"];
const PAGE_SIZE = 12;

function CatalogContent() {
  const {
    filters,
    activeFiltersCount: hookActiveCount,
    toggleBrand,
    toggleCategory,
    setPriceRange,
    setSort,
    setPage,
    toggleDiscountedOnly,
    resetFilters: resetHookFilters,
  } = useCatalogFilters();

  // Products & Pagination State fetched live from MySQL
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Categories and Brands for sidebar facets
  const [allCategories, setAllCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [allBrands, setAllBrands] = useState<{ id: string; name: string; slug: string }[]>([]);

  // 1. Fetch available Categories & Brands once on mount for filter list
  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/brands"),
        ]);
        const [catJson, brandJson] = await Promise.all([
          catRes.json(),
          brandRes.json(),
        ]);
        if (isMounted) {
          if (catJson.success && Array.isArray(catJson.data)) {
            setAllCategories(catJson.data);
          }
          if (brandJson.success && Array.isArray(brandJson.data)) {
            setAllBrands(brandJson.data);
          }
        }
      } catch (err) {
        console.error("Failed to load category/brand metadata:", err);
      }
    };

    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Filtered Products & Pagination live from /api/products
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchCatalogProducts = async () => {
      try {
        const queryParams = new URLSearchParams();

        if (filters.category.length > 0) {
          queryParams.set("category", filters.category.join(","));
        }
        if (filters.brand.length > 0) {
          queryParams.set("brand", filters.brand.join(","));
        }
        if (filters.minPrice > 0) {
          queryParams.set("minPrice", filters.minPrice.toString());
        }
        if (filters.maxPrice < ABSOLUTE_MAX_PRICE) {
          queryParams.set("maxPrice", filters.maxPrice.toString());
        }
        if (filters.inStock) {
          queryParams.set("inStock", "true");
        }
        if (filters.onlyDiscounted) {
          queryParams.set("discount", "true");
        }
        if (filters.sort && filters.sort !== "default") {
          queryParams.set("sort", filters.sort);
        }
        if (filters.searchQuery.trim()) {
          queryParams.set("q", filters.searchQuery.trim());
        }

        queryParams.set("page", (filters.page || 1).toString());
        queryParams.set("limit", PAGE_SIZE.toString());

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        const json = await res.json();

        if (isMounted) {
          if (json.success && Array.isArray(json.data)) {
            setProductsList(json.data);
            setTotalProducts(json.total ?? json.count ?? json.data.length);
            setTotalPages(json.totalPages ?? Math.ceil((json.total ?? json.data.length) / PAGE_SIZE) ?? 1);
          } else {
            setProductsList([]);
            setTotalProducts(0);
            setTotalPages(1);
          }
        }
      } catch (err) {
        console.error("Failed to load catalog products:", err);
        if (isMounted) {
          setProductsList([]);
          setTotalProducts(0);
          setTotalPages(1);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCatalogProducts();

    return () => {
      isMounted = false;
    };
  }, [
    filters.category,
    filters.brand,
    filters.minPrice,
    filters.maxPrice,
    filters.inStock,
    filters.onlyDiscounted,
    filters.sort,
    filters.page,
    filters.searchQuery,
  ]);

  // UI Specific State (colors, storage, open accordions)
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Accordion Toggles
  const [priceOpen, setPriceOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(true);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [colorOpen, setColorOpen] = useState(true);
  const [storageOpen, setStorageOpen] = useState(true);

  // Dynamic Brand & Category counts
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allBrands.forEach((b) => {
      counts[b.name] = 0;
    });
    productsList.forEach((p: Product) => {
      if (p.brandName) counts[p.brandName] = (counts[p.brandName] || 0) + 1;
    });
    return counts;
  }, [allBrands, productsList]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allCategories.forEach((c) => {
      counts[c.name] = 0;
    });
    productsList.forEach((p: Product) => {
      if (p.categoryName) counts[p.categoryName] = (counts[p.categoryName] || 0) + 1;
    });
    return counts;
  }, [allCategories, productsList]);

  // Dynamic colors from products & palette
  const dynamicColors = useMemo(() => {
    const foundColors = new Set<string>();
    productsList.forEach((p) => {
      p.variants?.forEach((v) => {
        if (v.type === "color") {
          v.options.forEach((opt) => foundColors.add(opt.label));
        }
      });
      p.specs?.forEach((sg) => {
        sg.items.forEach((item) => {
          if (item.label.toLowerCase().includes("ფერ") || item.label.toLowerCase().includes("color")) {
            foundColors.add(item.value);
          }
        });
      });
    });

    const list = [...COLOR_OPTIONS];
    foundColors.forEach((fc) => {
      if (fc && !list.some((c) => c.label.toLowerCase() === fc.toLowerCase())) {
        list.push({ id: fc, label: fc, hex: "#6366F1" });
      }
    });
    return list;
  }, [productsList]);

  // Dynamic storage options from products
  const dynamicStorageOptions = useMemo(() => {
    const foundStorage = new Set<string>(STORAGE_OPTIONS);
    productsList.forEach((p) => {
      p.specs?.forEach((sg) => {
        sg.items.forEach((item) => {
          if (item.label.toLowerCase().includes("მეხსიერება") || item.label.toLowerCase().includes("storage") || item.label.toLowerCase().includes("rom")) {
            foundStorage.add(item.value);
          }
        });
      });
    });
    return Array.from(foundStorage);
  }, [productsList]);

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleStorageToggle = (storage: string) => {
    setSelectedStorage((prev) =>
      prev.includes(storage) ? prev.filter((s) => s !== storage) : [...prev, storage]
    );
  };

  const handleMinPriceChange = (val: number) => {
    const newMin = Math.min(val, filters.maxPrice - 50);
    setPriceRange(Math.max(0, newMin), filters.maxPrice);
  };

  const handleMaxPriceChange = (val: number) => {
    const newMax = Math.max(val, filters.minPrice + 50);
    setPriceRange(filters.minPrice, Math.min(ABSOLUTE_MAX_PRICE, newMax));
  };

  const resetFilters = () => {
    resetHookFilters();
    setSelectedColors([]);
    setSelectedStorage([]);
  };

  const activeFiltersCount = hookActiveCount + selectedColors.length + selectedStorage.length;

  // Secondary In-Memory Filter for Dynamic Variant Facets (Color & Storage)
  const displayedProducts = useMemo(() => {
    if (selectedColors.length === 0 && selectedStorage.length === 0) {
      return productsList;
    }
    return productsList.filter((product: Product) => {
      if (selectedColors.length > 0 && product.colorName && !selectedColors.includes(product.colorName)) {
        return false;
      }
      if (selectedStorage.length > 0 && product.storage && !selectedStorage.includes(product.storage)) {
        return false;
      }
      return true;
    });
  }, [productsList, selectedColors, selectedStorage]);

  // Dual Slider Math
  const minPercent = (filters.minPrice / ABSOLUTE_MAX_PRICE) * 100;
  const maxPercent = (filters.maxPrice / ABSOLUTE_MAX_PRICE) * 100;

  return (
    <div className="container mx-auto px-4 lg:px-6 max-w-[1560px] space-y-8">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200/80">
        <div>
          <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight flex items-center gap-2">
            <span>კატალოგი & კატეგორიები</span>
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            სულ მოიძებნა <span className="text-gray-900">{totalProducts}</span> პროდუქტი
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-xl text-xs text-zinc-700 shadow-sm cursor-pointer border border-zinc-200"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#FF5238]" />
            <span>ფილტრები ({activeFiltersCount})</span>
          </button>

          {/* Clean Sort Dropdown Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              onBlur={() => setTimeout(() => setIsSortDropdownOpen(false), 200)}
              className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl text-xs text-zinc-700 shadow-sm cursor-pointer select-none border border-transparent hover:border-zinc-200/60 transition-all"
            >
              <ArrowUpDown className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-900">
                {filters.sort === "default" && "სორტირება"}
                {filters.sort === "all" && "ყველა"}
                {filters.sort === "price-desc" && "ფასი: კლებადობით"}
                {filters.sort === "price-asc" && "ფასი: ზრდადობით"}
                {filters.sort === "discount" && "ფასდაკლებით"}
                {filters.sort === "rating" && "რეიტინგით"}
                {filters.sort === "newest" && "უახლესი"}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 ml-0.5 transition-transform duration-200 ${isSortDropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {isSortDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-zinc-100 py-1.5 min-w-[200px] z-30 space-y-0.5">
                {[
                  { id: "all", label: "ყველა" },
                  { id: "price-desc", label: "ფასი: კლებადობით" },
                  { id: "price-asc", label: "ფასი: ზრდადობით" },
                  { id: "discount", label: "ფასდაკლებით" },
                  { id: "rating", label: "რეიტინგით" },
                  { id: "newest", label: "უახლესი" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSort(s.id);
                      setIsSortDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${filters.sort === s.id
                        ? "bg-[#FFF5F2] text-[#FF5238]"
                        : "text-zinc-700 hover:bg-zinc-50"
                      }`}
                  >
                    <span>{s.label}</span>
                    {filters.sort === s.id && <Check className="w-3.5 h-3.5 text-[#FF5238]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
        {/* Left Filter Sidebar (Expanded Width & Luxury Styling) */}
        <aside
          className={`w-full lg:w-[290px] xl:w-[320px] bg-white rounded-[26px] p-6 shadow-sm border border-zinc-200/80 space-y-6 shrink-0 ${isMobileFilterOpen ? "block" : "hidden lg:block"
            }`}
        >
          {/* Filter Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#FF5238]" />
              <span className="text-xs text-zinc-900 font-sans">ფილტრები</span>
            </div>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] text-zinc-400 hover:text-[#FF5238] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>გასუფთავება</span>
              </button>
            )}
          </div>

          {/* Dual Range Price Slider */}
          <div className="space-y-4 pb-5 border-b border-zinc-100">
            <button
              type="button"
              onClick={() => setPriceOpen(!priceOpen)}
              className="w-full flex items-center justify-between text-xs text-zinc-900 cursor-pointer font-sans"
            >
              <span>ფასი (₾)</span>
              {priceOpen ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {priceOpen && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 bg-zinc-50 border border-zinc-200/80 rounded-xl px-2.5 py-1.5 focus-within:border-[#FF5238]">
                    <span className="text-[10px] text-zinc-400 block leading-none">დან</span>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleMinPriceChange(Number(e.target.value))}
                      className="w-full bg-transparent text-xs text-zinc-900 focus:outline-none"
                    />
                  </div>

                  <span className="text-zinc-300">-</span>

                  <div className="flex-1 bg-zinc-50 border border-zinc-200/80 rounded-xl px-2.5 py-1.5 focus-within:border-[#FF5238]">
                    <span className="text-[10px] text-zinc-400 block leading-none">მდე</span>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                      className="w-full bg-transparent text-xs text-zinc-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Dual Slider Bar */}
                <div className="relative h-5 flex items-center">
                  <div className="absolute left-0 right-0 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF5238] rounded-full"
                      style={{
                        left: `${minPercent}%`,
                        width: `${maxPercent - minPercent}%`,
                        position: "absolute",
                      }}
                    />
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={ABSOLUTE_MAX_PRICE}
                    step={25}
                    value={filters.minPrice}
                    onChange={(e) => handleMinPriceChange(Number(e.target.value))}
                    className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FF5238] [&::-webkit-slider-thumb]:shadow-[0_4px_12px_rgba(255,82,56,0.3)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                  />

                  <input
                    type="range"
                    min={0}
                    max={ABSOLUTE_MAX_PRICE}
                    step={25}
                    value={filters.maxPrice}
                    onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
                    className="absolute top-1/2 -translate-y-1/2 w-full appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FF5238] [&::-webkit-slider-thumb]:shadow-[0_4px_12px_rgba(255,82,56,0.3)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
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
                      type="button"
                      onClick={() => {
                        setPriceRange(preset.min, preset.max);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${filters.minPrice === preset.min && filters.maxPrice === preset.max
                          ? "bg-[#FFF5F2] text-[#FF5238] border border-[#FED7CC]"
                          : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                        }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Brand Filter */}
          <div className="space-y-3 pb-5 border-b border-zinc-100">
            <button
              type="button"
              onClick={() => setBrandOpen(!brandOpen)}
              className="w-full flex items-center justify-between text-xs text-zinc-900 cursor-pointer font-sans"
            >
              <span>ბრენდი</span>
              {brandOpen ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {brandOpen && (
              <div className="space-y-2.5 pt-1 text-xs text-zinc-700 max-h-48 overflow-y-auto pr-1">
                {Object.entries(brandCounts).map(([brand, count]) => {
                  const isChecked = filters.brand.some(
                    (b) => b.toLowerCase() === brand.toLowerCase()
                  );

                  return (
                    <div
                      key={brand}
                      onClick={() => toggleBrand(brand)}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${isChecked
                              ? "bg-[#FF5238] border border-[#FF5238] text-white shadow-xs"
                              : "bg-zinc-50 border border-zinc-200 group-hover:border-[#FF5238]/60"
                            }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="group-hover:text-zinc-900 transition-colors font-sans">{brand}</span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono">({count})</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-3 pb-5 border-b border-zinc-100">
            <button
              type="button"
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="w-full flex items-center justify-between text-xs text-zinc-900 cursor-pointer font-sans"
            >
              <span>კატეგორია</span>
              {categoryOpen ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {categoryOpen && (
              <div className="space-y-2.5 pt-1 text-xs text-zinc-700 max-h-48 overflow-y-auto pr-1">
                {Object.entries(categoryCounts).map(([cat, count]) => {
                  const isChecked = filters.category.some(
                    (c) => c.toLowerCase() === cat.toLowerCase()
                  );

                  return (
                    <div
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${isChecked
                              ? "bg-[#FF5238] border border-[#FF5238] text-white shadow-xs"
                              : "bg-zinc-50 border border-zinc-200 group-hover:border-[#FF5238]/60"
                            }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="group-hover:text-zinc-900 transition-colors font-sans">{cat}</span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono">({count})</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Color Selector */}
          <div className="space-y-3 pb-5 border-b border-zinc-100">
            <button
              type="button"
              onClick={() => setColorOpen(!colorOpen)}
              className="w-full flex items-center justify-between text-xs text-zinc-900 cursor-pointer font-sans"
            >
              <span>ფერი</span>
              {colorOpen ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {colorOpen && (
              <div className="flex flex-wrap gap-2 pt-1">
                {dynamicColors.map((color) => {
                  const isSelected = selectedColors.includes(color.label);
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => handleColorToggle(color.label)}
                      title={color.label}
                      className={`relative w-7 h-7 rounded-full border transition-all cursor-pointer flex items-center justify-center ${isSelected
                          ? "ring-2 ring-[#FF5238] ring-offset-2 scale-105 border-transparent"
                          : "border-zinc-200 hover:scale-105"
                        }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && (
                        <Check
                          className={`w-3.5 h-3.5 ${["#FFFFFF", "#F5F5DC", "#C5C1B8"].includes(color.hex)
                              ? "text-zinc-900"
                              : "text-white"
                            }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Storage Filter */}
          <div className="space-y-3 pb-5 border-b border-zinc-100">
            <button
              type="button"
              onClick={() => setStorageOpen(!storageOpen)}
              className="w-full flex items-center justify-between text-xs text-zinc-900 cursor-pointer font-sans"
            >
              <span>მეხსიერება</span>
              {storageOpen ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {storageOpen && (
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {dynamicStorageOptions.map((s) => {
                  const isSelected = selectedStorage.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleStorageToggle(s)}
                      className={`py-2 px-3 rounded-xl text-xs transition-all cursor-pointer text-center font-sans ${isSelected
                          ? "bg-[#FF5238] text-white shadow-xs"
                          : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border border-zinc-100"
                        }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Toggle Switch: Discounted Only */}
          <div
            onClick={toggleDiscountedOnly}
            className="flex items-center justify-between pt-1 text-xs text-zinc-900 cursor-pointer group font-sans"
          >
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#FF5238]" />
              <span>მხოლოდ ფასდაკლებული</span>
            </div>

            <div
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${filters.onlyDiscounted ? "bg-[#FF5238]" : "bg-zinc-200 group-hover:bg-zinc-300"
                }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${filters.onlyDiscounted ? "translate-x-4" : ""
                  }`}
              />
            </div>
          </div>
        </aside>

        {/* Right Product Grid & Pagination */}
        <main className="flex-1 w-full space-y-6">
          {isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : displayedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {displayedProducts.map((product) => {
                  const prodImg = product.images?.[0] || product.image || "";
                  const prodImages = product.images && product.images.length > 0 ? product.images : [prodImg];
                  return (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      title={product.title}
                      price={product.price}
                      discountPrice={product.discountPrice}
                      monthlyInstallment={product.monthlyInstallment}
                      image={prodImg}
                      images={prodImages}
                      discountPercentage={product.discountPercentage}
                      stock={product.stock}
                    />
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                  <button
                    type="button"
                    disabled={filters.page <= 1}
                    onClick={() => setPage(filters.page - 1)}
                    className="flex items-center gap-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>წინა</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isCurrent = p === (filters.page || 1);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-xl text-xs flex items-center justify-center transition-colors cursor-pointer ${isCurrent
                            ? "bg-[#FF5238] text-white shadow-xs"
                            : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                          }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={filters.page >= totalPages}
                    onClick={() => setPage(filters.page + 1)}
                    className="flex items-center gap-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <span>შემდეგი</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
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
                  type="button"
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

export function CatalogClient() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-24">
      {/* Top Breadcrumbs */}
      <div className="py-3.5 bg-white border-b border-gray-100 mb-8">
        <div className="container mx-auto px-4 lg:px-6 max-w-[1560px]">
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
        <Suspense
          fallback={
            <div className="container mx-auto px-4 py-12 text-center text-gray-400 text-sm">
              იტვირთება კატალოგი...
            </div>
          }
        >
          <CatalogContent />
        </Suspense>
      </main>
    </div>
  );
}
