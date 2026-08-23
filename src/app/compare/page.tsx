"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  ChevronRight, 
  Trash2, 
  Plus, 
  X, 
  Search, 
  GitCompare, 
  Share2, 
  Check,
  Loader2,
  ShoppingBag
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { Product } from "@/types";

interface ParsedSpecRow {
  label: string;
  values: Record<string, string>; // productId -> value string
}

interface ParsedSpecSection {
  title: string;
  rows: ParsedSpecRow[];
}

export default function ComparePage() {
  const { compareList, addToCompare, removeFromCompare, clearCompare, addToast } = useStore();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");

  // 1. Fetch real products dynamically from MySQL database
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          if (isMounted) {
            setAllProducts(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load products for comparison:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Determine active compared products & sync with database
  const activeProducts = useMemo(() => {
    if (allProducts.length === 0 || compareList.length === 0) return [];
    return allProducts.filter((p) => compareList.includes(p.id)).slice(0, 4);
  }, [allProducts, compareList]);

  // Synchronize and auto-prune stale/non-existent IDs from compareList once products are loaded
  useEffect(() => {
    if (!isLoading && allProducts.length > 0 && compareList.length > 0) {
      const validProductIds = allProducts.map((p) => p.id);
      const validList = compareList.filter((id) => validProductIds.includes(id));
      if (validList.length === 0) {
        clearCompare();
      } else if (validList.length !== compareList.length) {
        useStore.setState({ compareList: validList });
      }
    }
  }, [isLoading, allProducts, compareList, clearCompare]);

  const primaryCategory = activeProducts[0]?.categoryName || "ყველა პროდუქტი";

  // 3. Dynamically build specification sections from Product.specs and core fields
  const specSections = useMemo(() => {
    if (activeProducts.length === 0) return [];

    const sections: ParsedSpecSection[] = [];

    // Core Overview Section
    const coreRows: ParsedSpecRow[] = [
      {
        label: "ბრენდი",
        values: Object.fromEntries(
          activeProducts.map((p) => [p.id, p.brandName || "—"])
        ),
      },
      {
        label: "კატეგორია",
        values: Object.fromEntries(
          activeProducts.map((p) => [p.id, p.categoryName || "—"])
        ),
      },
      {
        label: "ფასი",
        values: Object.fromEntries(
          activeProducts.map((p) => [
            p.id,
            `${p.discountPrice ? `${p.discountPrice} ₾ (ძველი: ${p.price} ₾)` : `${p.price} ₾`}`,
          ])
        ),
      },
      {
        label: "მარაგი",
        values: Object.fromEntries(
          activeProducts.map((p) => [
            p.id,
            p.stock > 0 ? `მარაგშია (${p.stock} ცალი)` : "არ არის მარაგში",
          ])
        ),
      },
      {
        label: "საგარანტიო ვადა",
        values: Object.fromEntries(
          activeProducts.map((p) => [
            p.id,
            p.warrantyMonths ? `${p.warrantyMonths} თვე` : "—",
          ])
        ),
      },
    ];

    sections.push({
      title: "ძირითადი ინფორმაცია",
      rows: coreRows,
    });

    // Extract dynamic spec groups from all active products
    const groupMap = new Map<string, Map<string, Record<string, string>>>();

    activeProducts.forEach((p) => {
      let specsArray = p.specs;

      // Handle JSON string if not parsed
      if (typeof specsArray === "string") {
        try {
          specsArray = JSON.parse(specsArray);
        } catch {
          specsArray = undefined;
        }
      }

      if (Array.isArray(specsArray)) {
        specsArray.forEach((group) => {
          const groupTitle = (group.title || "ტექნიკური მახასიათებლები").trim();
          if (!groupMap.has(groupTitle)) {
            groupMap.set(groupTitle, new Map<string, Record<string, string>>());
          }

          const labelMap = groupMap.get(groupTitle)!;

          if (Array.isArray(group.items)) {
            group.items.forEach((item) => {
              const label = (item.label || "").trim();
              const value = (item.value || "—").trim();
              if (!label) return;

              if (!labelMap.has(label)) {
                labelMap.set(label, {});
              }
              labelMap.get(label)![p.id] = value || "—";
            });
          }
        });
      }
    });

    // Convert map to sections
    groupMap.forEach((labelMap, groupTitle) => {
      const rows: ParsedSpecRow[] = [];
      labelMap.forEach((productValues, label) => {
        const fullValues: Record<string, string> = {};
        activeProducts.forEach((p) => {
          fullValues[p.id] = productValues[p.id] || "მონაცემები არ არის";
        });
        rows.push({
          label,
          values: fullValues,
        });
      });

      if (rows.length > 0) {
        sections.push({
          title: groupTitle,
          rows,
        });
      }
    });

    return sections;
  }, [activeProducts]);

  // 4. Modal Search Results for Adding Products
  const searchResults = useMemo(() => {
    const q = modalSearchQuery.trim().toLowerCase();
    const activeIds = activeProducts.map((p) => p.id);

    return allProducts.filter((p) => {
      if (activeIds.includes(p.id)) return false;
      if (!q) return true;
      const titleMatch = p.title.toLowerCase().includes(q);
      const brandMatch = (p.brandName || "").toLowerCase().includes(q);
      const catMatch = (p.categoryName || "").toLowerCase().includes(q);
      return titleMatch || brandMatch || catMatch;
    });
  }, [allProducts, modalSearchQuery, activeProducts]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      addToast({
        title: "ბმული დაკოპირდა",
        message: "შედარების ბმული დაკოპირებულია ბუფერში",
        type: "success",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans pb-24 animate-pulse">
        {/* Top Breadcrumb Navigation */}
        <div className="py-3.5 bg-white mb-6">
          <div className="container mx-auto px-4 lg:px-6 max-w-[1560px]">
            <div className="h-4 bg-gray-200 rounded-md w-36" />
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 max-w-[1560px] space-y-6">
          {/* Header Skeleton */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-2xs flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-7 bg-gray-200 rounded-xl w-48" />
              <div className="h-4 bg-gray-100 rounded-md w-64" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-28 bg-gray-100 rounded-2xl" />
              <div className="h-10 w-28 bg-gray-100 rounded-2xl" />
            </div>
          </div>

          {/* Cards Skeleton Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs space-y-4">
                <div className="h-48 bg-gray-100 rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded-md w-3/4" />
                  <div className="h-5 bg-gray-200 rounded-md w-1/3" />
                </div>
                <div className="h-10 bg-gray-100 rounded-2xl w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Proper Empty State when user has not selected any products to compare
  if (activeProducts.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans pb-24">
        {/* Top Breadcrumb Navigation */}
        <div className="py-3.5 bg-white mb-6">
          <div className="container mx-auto px-4 lg:px-6 max-w-[1560px]">
            <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
              <Link href="/" className="hover:text-[#059669] transition-colors">
                მთავარი
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              <span className="text-gray-900">შედარება</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 max-w-lg text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-[#FFF5F2] text-[#FF5238] flex items-center justify-center mx-auto shadow-2xs">
            <GitCompare className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl text-gray-900 tracking-tight">
              შედარების სია ცარიელია
            </h1>
            <p className="text-xs md:text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
              თქვენ არ გაქვთ არჩეული პროდუქტები შედარებისთვის. დაათვალიერეთ კატალოგი და დააჭირეთ შედარების ღილაკს სასურველ ნივთებზე.
            </p>
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center gap-2 bg-[#FF5238] hover:bg-[#EA3A20] text-white px-7 py-3.5 rounded-2xl text-xs md:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>კატალოგის დათვალიერება</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans pb-24">
      
      {/* Top Breadcrumb Navigation */}
      <div className="py-3.5 bg-white mb-6">
        <div className="container mx-auto px-4 lg:px-6 max-w-[1560px]">
          <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
            <Link href="/" className="hover:text-[#FF5238] transition-colors">
              მთავარი
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-900">შედარება ({primaryCategory})</span>
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 lg:px-6 max-w-[1560px] space-y-6">
        
        {/* Top Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight">
              პროდუქტების შედარება
            </h1>
            <span className="bg-[#FFF5F2] text-[#FF5238] border border-[#FED7CC] text-xs md:text-sm px-3.5 py-1.5 rounded-xl">
              კატეგორია: {primaryCategory}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {activeProducts.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="flex items-center gap-1.5 text-xs md:text-sm text-gray-600 hover:text-red-600 transition-colors cursor-pointer px-3.5 py-2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.015)]"
              >
                <Trash2 className="w-4 h-4 text-gray-400" />
                <span>გასუფთავება</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 bg-[#FF5238] hover:bg-[#EA3A20] text-white text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>გაზიარება</span>
            </button>
          </div>
        </div>

        {/* Notice Message */}
        <p className="text-xs md:text-sm text-gray-500">
          შეადარეთ ტექნიკური მახასიათებლები, ფასები და მონაცემები პირდაპირ მონაცემთა ბაზიდან.
        </p>

        {/* Comparison Stage */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden p-5 md:p-6 space-y-6">
          
          {/* Header Row: Product Slots + Differences Checkbox */}
          <div className="grid grid-cols-12 gap-4 items-center bg-[#F8FAFD] rounded-2xl p-4">
            
            {/* Left Slot: Differences Toggle Checkbox */}
            <div className="col-span-3 flex items-center gap-2">
              <label
                onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
                className="flex items-center gap-2.5 cursor-pointer text-xs md:text-sm text-gray-800 select-none group"
              >
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                    showOnlyDifferences
                      ? "bg-[#FF5238] text-white shadow-xs"
                      : "bg-white border border-gray-200 group-hover:border-[#FF5238]"
                  }`}
                >
                  {showOnlyDifferences && <Check className="w-3.5 h-3.5" />}
                </div>
                <span>განსხვავებები</span>
              </label>
            </div>

            {/* Product Slots Columns (Up to 4 Slots) */}
            <div className="col-span-9 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              
              {/* Active Products Slots */}
              {activeProducts.map((product) => {
                const prodImage = product.images?.[0] || product.image || "/placeholder.png";
                return (
                  <div
                    key={product.id}
                    className="relative bg-white rounded-xl p-3 flex items-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.015)] group"
                  >
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                      title="წაშლა"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Product Thumbnail */}
                    <div className="w-13 h-13 shrink-0 bg-[#F8FAFD] rounded-lg p-1 flex items-center justify-center">
                      <img
                        src={prodImage}
                        alt={product.title}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 pr-4">
                      <Link
                        href={`/product/${product.id}`}
                        className="text-xs md:text-sm text-gray-900 leading-snug line-clamp-2 hover:text-[#FF5238] transition-colors"
                      >
                        {product.title}
                      </Link>
                      <p className="text-xs md:text-sm text-[#FF5238] mt-1">
                        {product.discountPrice ? `${product.discountPrice} ₾` : `${product.price} ₾`}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Empty Product Slot (Add Button) */}
              {activeProducts.length < 4 && (
                <div
                  onClick={() => setIsSearchModalOpen(true)}
                  className="bg-white hover:bg-[#FFF5F2] rounded-xl p-4 flex items-center justify-center gap-2 text-xs md:text-sm text-[#FF5238] border border-dashed border-[#FED7CC] hover:border-[#FF5238] cursor-pointer transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.015)] min-h-[76px]"
                >
                  <Plus className="w-4 h-4 text-[#FF5238]" />
                  <span>დაამატეთ</span>
                </div>
              )}

            </div>
          </div>

          {/* Dynamic Spec Table Sections */}
          <div className="space-y-6 text-xs md:text-sm">
            {specSections.map((section, secIdx) => {
              const visibleRows = section.rows.filter((row) => {
                if (!showOnlyDifferences) return true;
                if (activeProducts.length < 2) return true;

                const firstVal = row.values[activeProducts[0].id];
                return activeProducts.some((p) => row.values[p.id] !== firstVal);
              });

              if (visibleRows.length === 0) return null;

              return (
                <div key={secIdx} className="space-y-2">
                  
                  {/* Floating Soft Section Header */}
                  <div className="bg-[#F8FAFD] px-5 py-3 rounded-xl text-xs md:text-sm text-gray-900">
                    <span>{section.title}</span>
                  </div>

                  {/* Spec Rows */}
                  <div className="space-y-1">
                    {visibleRows.map((row, rowIdx) => (
                      <div
                        key={row.label}
                        className={`grid grid-cols-12 px-5 py-3 rounded-xl items-center gap-4 ${
                          rowIdx % 2 === 0 ? "bg-white" : "bg-[#F8FAFD]/50"
                        }`}
                      >
                        {/* Row Label (Left Column) */}
                        <div className="col-span-3 text-xs md:text-sm text-gray-500">
                          {row.label}
                        </div>

                        {/* Product Values (Right Columns) */}
                        <div className="col-span-9 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs md:text-sm text-gray-900 text-center md:text-left leading-relaxed">
                          {activeProducts.map((product) => (
                            <div key={product.id} className="px-1 break-words">
                              {row.values[product.id] || "მონაცემები არ არის"}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </main>

      {/* Dynamic Product Selection Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header: Search Box + Close Button */}
            <div className="flex items-center gap-3 pt-1">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  placeholder="მოძებნეთ პროდუქტი მონაცემთა ბაზიდან..."
                  className="w-full bg-[#F8FAFD] rounded-full py-3.5 pl-11 pr-4 text-xs md:text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF5238]/20 transition-all"
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-xs"
                title="დახურვა"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Product List */}
            <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
              {searchResults.length > 0 ? (
                searchResults.map((product) => {
                  const prodImage = product.images?.[0] || product.image || "/placeholder.png";
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFD] hover:bg-[#FFF5F2] transition-colors group cursor-pointer"
                      onClick={() => {
                        addToCompare(product.id);
                        setIsSearchModalOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={prodImage}
                          alt={product.title}
                          className="w-11 h-11 object-contain rounded-lg shrink-0 bg-white p-1"
                        />
                        <div>
                          <h4 className="text-xs md:text-sm text-gray-900 leading-tight">
                            {product.title}
                          </h4>
                          <p className="text-xs md:text-sm text-[#FF5238] mt-0.5">
                            {product.discountPrice ? `${product.discountPrice} ₾` : `${product.price} ₾`}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="w-9 h-9 rounded-xl bg-[#FF5238] hover:bg-[#EA3A20] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-colors"
                      >
                        <GitCompare className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs md:text-sm text-gray-500">
                  შესადარებელი პროდუქტი ვერ მოიძებნა
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
