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
  Check,
  X
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { ProductGridSkeleton } from "@/components/skeletons/ProductGridSkeleton";
import { useCatalogFilters, ABSOLUTE_MAX_PRICE } from "@/hooks/useCatalogFilters";

const PAGE_SIZE = 12;

interface FilterOption {
  id: string;
  name: string;
  slug?: string;
  count: number;
  hex?: string;
  value?: string;
}

function CatalogContent() {
  const {
    filters,
    activeFiltersCount,
    toggleBrand,
    toggleCategory,
    toggleColor,
    toggleStorage,
    setPriceRange,
    setSort,
    setPage,
    toggleDiscountedOnly,
    toggleInStockOnly,
    resetFilters,
  } = useCatalogFilters();

  // Products & Pagination State
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Facets State from Backend API
  const [facets, setFacets] = useState<{
    categories: { id: string; name: string; slug: string; count: number }[];
    brands: { id: string; name: string; slug: string; count: number }[];
    colors: { name: string; hex: string; count: number }[];
    storages: { value: string; count: number }[];
    price: { min: number; max: number };
  }>({
    categories: [],
    brands: [],
    colors: [],
    storages: [],
    price: { min: 0, max: ABSOLUTE_MAX_PRICE },
  });

  // UI Specific State (open accordions, dropdowns)
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [priceOpen, setPriceOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(true);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [colorOpen, setColorOpen] = useState(true);
  const [storageOpen, setStorageOpen] = useState(true);

  // 1. Fetch available filter facets from /api/products/filters
  useEffect(() => {
    let isMounted = true;
    const fetchFacets = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (filters.category.length > 0) {
          queryParams.set("category", filters.category.join(","));
        }
        const res = await fetch(`/api/products/filters?${queryParams.toString()}`);
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setFacets(json.data);
        }
      } catch (err) {
        console.error("Failed to load filter facets:", err);
      }
    };

    fetchFacets();
    return () => {
      isMounted = false;
    };
  }, [filters.category.join(",")]);

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
        if (filters.color.length > 0) {
          queryParams.set("color", filters.color.join(","));
        }
        if (filters.storage.length > 0) {
          queryParams.set("storage", filters.storage.join(","));
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
    filters.category.join(","),
    filters.brand.join(","),
    filters.color.join(","),
    filters.storage.join(","),
    filters.minPrice,
    filters.maxPrice,
    filters.inStock,
    filters.onlyDiscounted,
    filters.sort,
    filters.page,
    filters.searchQuery,
  ]);

  const handleMinPriceChange = (val: number) => {
    const newMin = Math.min(val, filters.maxPrice - 50);
    setPriceRange(Math.max(0, newMin), filters.maxPrice);
  };

  const handleMaxPriceChange = (val: number) => {
    const newMax = Math.max(val, filters.minPrice + 50);
    setPriceRange(filters.minPrice, Math.min(ABSOLUTE_MAX_PRICE, newMax));
  };

  const minPercent = (filters.minPrice / ABSOLUTE_MAX_PRICE) * 100;
  const maxPercent = (filters.maxPrice / ABSOLUTE_MAX_PRICE) * 100;

  // Render Filter Sidebar Content (shared between Desktop and Mobile drawer)
  const renderFilterControls = () => (
    <>
      {/* 1. Category Filter */}
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
            {facets.categories.map((catObj) => {
              const isChecked = filters.category.some(
                (c) =>
                  c.toLowerCase() === catObj.slug.toLowerCase() ||
                  c.toLowerCase() === catObj.id.toLowerCase() ||
                  c.toLowerCase() === catObj.name.toLowerCase()
              );

              return (
                <div
                  key={catObj.id}
                  onClick={() => toggleCategory(catObj.slug || catObj.id)}
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
                    <span className="group-hover:text-zinc-900 transition-colors font-sans">{catObj.name}</span>
                  </div>
                  {catObj.count > 0 && (
                    <span className="text-[11px] text-zinc-400 font-mono">({catObj.count})</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Brand Filter */}
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
            {facets.brands.map((brandObj) => {
              const isChecked = filters.brand.some(
                (b) =>
                  b.toLowerCase() === brandObj.slug.toLowerCase() ||
                  b.toLowerCase() === brandObj.name.toLowerCase() ||
                  b.toLowerCase() === brandObj.id.toLowerCase()
              );

              return (
                <div
                  key={brandObj.id}
                  onClick={() => toggleBrand(brandObj.slug || brandObj.name)}
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
                    <span className="group-hover:text-zinc-900 transition-colors font-sans">{brandObj.name}</span>
                  </div>
                  {brandObj.count > 0 && (
                    <span className="text-[11px] text-zinc-400 font-mono">({brandObj.count})</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Price Filter */}
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
            <div className="flex items-center gap-2 text-xs">
              <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">დან</span>
                <span className="font-mono">{filters.minPrice} ₾</span>
              </div>
              <span className="text-zinc-300">-</span>
              <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">მდე</span>
                <span className="font-mono">{filters.maxPrice} ₾</span>
              </div>
            </div>

            {/* Custom Dual Range Slider */}
            <div className="relative h-6 flex items-center">
              <div className="relative w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-[#FF5238] rounded-full"
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

      {/* 4. Color Filter (Real Dynamic Colors from Database) */}
      {facets.colors.length > 0 && (
        <div className="space-y-3 pb-5 border-b border-zinc-100">
          <button
            type="button"
            onClick={() => setColorOpen(!colorOpen)}
            className="w-full flex items-center justify-between text-xs text-zinc-900 cursor-pointer font-sans"
          >
            <span>ფერი ({facets.colors.length})</span>
            {colorOpen ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {colorOpen && (
            <div className="space-y-2 pt-1 max-h-56 overflow-y-auto pr-1">
              {facets.colors.map((colorObj) => {
                const isSelected = filters.color.some(
                  (c) => c.toLowerCase() === colorObj.name.toLowerCase()
                );
                return (
                  <div
                    key={colorObj.name}
                    onClick={() => toggleColor(colorObj.name)}
                    className="flex items-center justify-between cursor-pointer group py-1 px-1 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-4 h-4 rounded-full border border-black/10 flex items-center justify-center shrink-0 shadow-2xs ${isSelected ? "ring-2 ring-[#FF5238] ring-offset-1" : ""
                          }`}
                        style={{ backgroundColor: colorObj.hex }}
                      >
                        {isSelected && (
                          <Check className={`w-2.5 h-2.5 ${colorObj.hex === "#F8FAFC" || colorObj.hex === "#FFFFFF" ? "text-zinc-900" : "text-white"}`} />
                        )}
                      </span>
                      <span className={`text-xs transition-colors font-sans ${isSelected ? "text-[#FF5238]" : "text-zinc-700 group-hover:text-zinc-900"}`}>
                        {colorObj.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono">({colorObj.count})</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Storage / Memory Filter (Real Dynamic Storage from Database) */}
      {facets.storages.length > 0 && (
        <div className="space-y-3 pb-5 border-b border-zinc-100">
          <button
            type="button"
            onClick={() => setStorageOpen(!storageOpen)}
            className="w-full flex items-center justify-between text-xs text-zinc-900 cursor-pointer font-sans"
          >
            <span>შიდა მეხსიერება</span>
            {storageOpen ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {storageOpen && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {facets.storages.map((storageObj) => {
                const isSelected = filters.storage.some(
                  (s) => s.toLowerCase() === storageObj.value.toLowerCase()
                );
                return (
                  <button
                    key={storageObj.value}
                    type="button"
                    onClick={() => toggleStorage(storageObj.value)}
                    className={`py-2 px-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between font-sans ${isSelected
                        ? "bg-[#FF5238] text-white shadow-xs"
                        : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border border-zinc-100"
                      }`}
                  >
                    <span>{storageObj.value}</span>
                    <span className={`text-[10px] ${isSelected ? "text-white/80" : "text-zinc-400"}`}>
                      ({storageObj.count})
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. Toggle Switch: In Stock */}
      <div
        onClick={toggleInStockOnly}
        className="flex items-center justify-between pt-1 text-xs text-zinc-900 cursor-pointer group font-sans"
      >
        <span>მხოლოდ მარაგში</span>
        <div
          className={`w-9 h-5 rounded-full p-0.5 transition-colors ${filters.inStock ? "bg-[#FF5238]" : "bg-zinc-200 group-hover:bg-zinc-300"
            }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform ${filters.inStock ? "translate-x-4" : ""
              }`}
          />
        </div>
      </div>

      {/* 7. Toggle Switch: Discounted Only */}
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
    </>
  );

  return (
    <div className="container mx-auto px-4 lg:px-6 max-w-[1560px] space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200/80">
        <div>
          <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight flex items-center gap-2 font-sans">
            <span>კატალოგი & პროდუქტები</span>
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            სულ მოიძებნა <span className="text-gray-900 font-mono">{totalProducts}</span> პროდუქტი
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

          {/* Clean Sort Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              onBlur={() => setTimeout(() => setIsSortDropdownOpen(false), 200)}
              className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl text-xs text-zinc-700 shadow-sm cursor-pointer select-none border border-transparent hover:border-zinc-200/60 transition-all"
            >
              <ArrowUpDown className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-900 font-sans">
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

      {/* Active Filter Badges Bar */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap pb-2 pt-1">
          <span className="text-xs text-gray-400 mr-1">არჩეული ფილტრები:</span>

          {filters.category.map((cat) => (
            <span
              key={`cat-${cat}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-zinc-100 text-zinc-800 border border-zinc-200/60"
            >
              <span>{cat}</span>
              <button
                type="button"
                onClick={() => toggleCategory(cat)}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          {filters.brand.map((brand) => (
            <span
              key={`brand-${brand}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-zinc-100 text-zinc-800 border border-zinc-200/60"
            >
              <span>{brand}</span>
              <button
                type="button"
                onClick={() => toggleBrand(brand)}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          {filters.color.map((col) => (
            <span
              key={`color-${col}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-zinc-100 text-zinc-800 border border-zinc-200/60"
            >
              <span>ფერი: {col}</span>
              <button
                type="button"
                onClick={() => toggleColor(col)}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          {filters.storage.map((st) => (
            <span
              key={`storage-${st}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-zinc-100 text-zinc-800 border border-zinc-200/60"
            >
              <span>მეხსიერება: {st}</span>
              <button
                type="button"
                onClick={() => toggleStorage(st)}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          {(filters.minPrice > 0 || filters.maxPrice < ABSOLUTE_MAX_PRICE) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-zinc-100 text-zinc-800 border border-zinc-200/60">
              <span>{filters.minPrice} ₾ - {filters.maxPrice} ₾</span>
              <button
                type="button"
                onClick={() => setPriceRange(0, ABSOLUTE_MAX_PRICE)}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {filters.inStock && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-zinc-100 text-zinc-800 border border-zinc-200/60">
              <span>მარაგში</span>
              <button
                type="button"
                onClick={toggleInStockOnly}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {filters.onlyDiscounted && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-zinc-100 text-zinc-800 border border-zinc-200/60">
              <span>ფასდაკლებული</span>
              <button
                type="button"
                onClick={toggleDiscountedOnly}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-[#FF5238] hover:underline cursor-pointer ml-1 font-sans"
          >
            ყველას გასუფთავება
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
        {/* Left Desktop Filter Sidebar */}
        <aside className="w-full lg:w-[290px] xl:w-[320px] bg-white rounded-[26px] p-6 shadow-sm border border-zinc-200/80 space-y-6 shrink-0 hidden lg:block">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#FF5238]" />
              <span className="text-xs text-zinc-900 font-sans">ფილტრები</span>
            </div>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] text-[#FF5238] hover:underline flex items-center gap-1 cursor-pointer font-sans"
              >
                <RotateCcw className="w-3 h-3" />
                <span>გასუფთავება</span>
              </button>
            )}
          </div>

          {renderFilterControls()}
        </aside>

        {/* Mobile Filter Drawer Modal */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="relative w-full max-w-md bg-white h-full overflow-y-auto z-10 p-6 space-y-6 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-5">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#FF5238]" />
                    <span className="text-sm text-zinc-900 font-sans">ფილტრები</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 hover:text-zinc-900 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  {renderFilterControls()}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex-1 py-3 rounded-2xl border border-zinc-200 text-xs text-zinc-700 hover:bg-zinc-50 cursor-pointer text-center font-sans"
                >
                  გასუფთავება
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-[#FF5238] text-white text-xs hover:bg-[#e0452d] cursor-pointer shadow-md text-center font-sans"
                >
                  შედეგების ნახვა ({totalProducts})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right Product Grid & Pagination */}
        <main className="flex-1 w-full space-y-6">
          {isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : productsList.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {productsList.map((product) => {
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
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-8 flex-wrap">
                  <button
                    type="button"
                    disabled={filters.page <= 1}
                    onClick={() => setPage(filters.page - 1)}
                    className="flex items-center gap-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors font-sans"
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
                        className={`w-8 h-8 rounded-xl text-xs flex items-center justify-center transition-colors cursor-pointer font-sans ${isCurrent
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
                    className="flex items-center gap-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors font-sans"
                  >
                    <span>შემდეგი</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-24 text-center space-y-4 bg-white rounded-3xl border border-gray-100 max-w-md mx-auto p-8 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF5F2] text-[#FF5238] flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base text-gray-900 font-sans">პროდუქტი ვერ მოიძებნა</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-sans">
                მითითებული ფილტრებით პროდუქცია არ მოიძებნა. სცადეთ სხვა პარამეტრები ან გაასუფთავეთ ფილტრი.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1D1D1F] text-white text-xs hover:bg-[#2C2C2E] transition-colors cursor-pointer shadow-xs font-sans"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ფილტრების გასუფთავება</span>
              </button>
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
            <Link href="/" className="hover:text-blue-600 transition-colors font-sans">
              მთავარი
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-900 font-sans">კატალოგი</span>
          </nav>
        </div>
      </div>

      <main>
        <Suspense
          fallback={
            <div className="container mx-auto px-4 py-12 text-center text-gray-400 text-sm font-sans">
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
