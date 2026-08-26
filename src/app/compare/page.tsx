"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  PlusCircle,
  X,
  Search,
  GitCompare,
  Share2,
  Check,
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
  const router = useRouter();
  const { compareList, addToCompare, removeFromCompare, clearCompare, addToast } = useStore();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [targetSlotIndex, setTargetSlotIndex] = useState<number | null>(null);

  // Accordion collapsed state for mobile sections
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSectionCollapse = (title: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // 1. URL Query Param Hydration: Load products from shared link (e.g. /compare?products=id1,id2,id3)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlProducts = params.get("products") || params.get("items") || params.get("ids");
      if (urlProducts) {
        const parsedIds = urlProducts
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
          .slice(0, 4);

        if (parsedIds.length > 0) {
          useStore.setState({ compareList: parsedIds });
        }
      }
    }
  }, []);

  // 2. Fetch real products from MySQL database
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

  // 3. Keep Browser URL synchronized with active compare items so every comparison has a unique link
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (compareList.length > 0) {
        const params = new URLSearchParams(window.location.search);
        const currentQuery = params.get("products");
        const targetQuery = compareList.join(",");
        if (currentQuery !== targetQuery) {
          const newUrl = `/compare?products=${encodeURIComponent(targetQuery)}`;
          window.history.replaceState(null, "", newUrl);
        }
      } else {
        const params = new URLSearchParams(window.location.search);
        if (params.has("products")) {
          window.history.replaceState(null, "", "/compare");
        }
      }
    }
  }, [compareList]);

  // 4. Active compared products (strictly max 4)
  const activeProducts = useMemo(() => {
    if (allProducts.length === 0 || compareList.length === 0) return [];
    return allProducts.filter((p) => compareList.includes(p.id)).slice(0, 4);
  }, [allProducts, compareList]);

  // Synchronize stale IDs
  useEffect(() => {
    if (!isLoading && allProducts.length > 0 && compareList.length > 0) {
      const validProductIds = allProducts.map((p) => p.id);
      const validList = compareList.filter((id) => validProductIds.includes(id));
      if (validList.length === 0 && compareList.length > 0) {
        clearCompare();
      } else if (validList.length !== compareList.length) {
        useStore.setState({ compareList: validList });
      }
    }
  }, [isLoading, allProducts, compareList, clearCompare]);

  // Handle adding product with 4-item limit validation
  const handleAddProduct = (productId: string) => {
    if (activeProducts.length >= 4) {
      addToast({
        title: "ლიმიტი მიღწეულია",
        message: "ერთდროულად მაქსიმუმ 4 პროდუქტის შედარებაა შესაძლებელი",
        type: "error",
      });
      return;
    }
    if (compareList.includes(productId)) {
      addToast({
        title: "უკვე დამატებულია",
        message: "ეს პროდუქტი უკვე არის შედარების სიაში",
        type: "info",
      });
      return;
    }
    addToCompare(productId);
    setIsSearchModalOpen(false);
    setSearchQuery("");
    setModalSearchQuery("");
    addToast({
      title: "დაემატა შედარებას",
      message: "პროდუქტი წარმატებით დაემატა შედარების სიას",
      type: "success",
    });
  };

  const handleOpenSearchForSlot = (slotIdx: number) => {
    setTargetSlotIndex(slotIdx);
    setModalSearchQuery("");
    setIsSearchModalOpen(true);
  };

  // 3. Dynamically build specification sections from Product.specs
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
            `${p.discountPrice ? `${p.discountPrice} ₾` : `${p.price} ₾`}`,
          ])
        ),
      },
      {
        label: "მარაგი",
        values: Object.fromEntries(
          activeProducts.map((p) => [
            p.id,
            p.stock > 0 ? `მარაგშია (${p.stock})` : "არ არის მარაგში",
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

    // Extract dynamic spec groups from active products
    const groupMap = new Map<string, Map<string, Record<string, string>>>();

    activeProducts.forEach((p) => {
      let specsArray = p.specs;

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
          fullValues[p.id] = productValues[p.id] || "—";
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

  // Inline Page Search Results
  const inlineSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const activeIds = activeProducts.map((p) => p.id);

    return allProducts
      .filter((p) => {
        if (activeIds.includes(p.id)) return false;
        const titleMatch = p.title.toLowerCase().includes(q);
        const brandMatch = (p.brandName || "").toLowerCase().includes(q);
        const catMatch = (p.categoryName || "").toLowerCase().includes(q);
        return titleMatch || brandMatch || catMatch;
      })
      .slice(0, 8);
  }, [allProducts, searchQuery, activeProducts]);

  // Modal Search Results
  const modalSearchResults = useMemo(() => {
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

  // Popular Suggestions for Empty State
  const suggestedProducts = useMemo(() => {
    const activeIds = activeProducts.map((p) => p.id);
    return allProducts.filter((p) => !activeIds.includes(p.id)).slice(0, 6);
  }, [allProducts, activeProducts]);

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      const shareUrl =
        activeProducts.length > 0
          ? `${window.location.origin}/compare?products=${encodeURIComponent(
              activeProducts.map((p) => p.id).join(",")
            )}`
          : `${window.location.origin}/compare`;

      if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
        try {
          await navigator.share({
            title: "პროდუქტების შედარება - Spilo",
            text: `შეადარეთ ${activeProducts.map((p) => p.title).join(" vs ")}`,
            url: shareUrl,
          });
          return;
        } catch (e) {}
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      addToast({
        title: "უნიკალური ბმული დაკოპირდა",
        message: "ამ ბმულის გახსნისას ყველას გამოუჩნდება ზუსტად ეს შედარება",
        type: "success",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans pb-24 animate-pulse">
        <div className="py-3 bg-white mb-4 sm:mb-6 border-b border-gray-100">
          <div className="container mx-auto px-4 lg:px-6 max-w-[1560px]">
            <div className="h-4 bg-gray-200 rounded-md w-36" />
          </div>
        </div>
        <div className="container mx-auto px-4 lg:px-6 max-w-[1560px] space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-2xs">
            <div className="h-6 bg-gray-200 rounded-xl w-48 mb-2" />
            <div className="h-3 bg-gray-100 rounded-md w-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white sm:bg-[#F8FAFC] text-gray-900 font-sans pb-24">
      
      {/* Desktop Breadcrumb Navigation */}
      <div className="hidden sm:block py-3.5 bg-white mb-6 border-b border-gray-100">
        <div className="container mx-auto px-4 lg:px-6 max-w-[1560px]">
          <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
            <Link href="/" className="hover:text-[#FF5238] transition-colors">
              მთავარი
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-900">
              შედარება ({activeProducts.length}/4)
            </span>
          </nav>
        </div>
      </div>

      <main className="container mx-auto sm:px-4 lg:px-6 max-w-[1560px]">
        
        {/* =========================================================
            1. MOBILE VIEW (sm:hidden) - EXACT User Design Matching
            ========================================================= */}
        <div className="sm:hidden">
          
          {/* Mobile Top Header: < შედარება + 🗑️ გასუფთავება */}
          <div className="px-4 py-3.5 flex items-center justify-between border-b border-gray-100 bg-white">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1 text-sm text-gray-900 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
              <span className="text-base">შედარება</span>
            </button>

            {activeProducts.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                <span>გასუფთავება</span>
              </button>
            )}
          </div>

          {/* SCREENSHOT 1: EMPTY / SETUP STATE (When 0 products are chosen) */}
          {activeProducts.length === 0 ? (
            <div className="p-4 space-y-4 pt-6">
              {/* 4 Clean Selector Slots */}
              <div className="space-y-3">
                {[0, 1, 2, 3].map((slotIdx) => (
                  <button
                    key={slotIdx}
                    type="button"
                    onClick={() => handleOpenSearchForSlot(slotIdx)}
                    className="w-full bg-[#F2F4F7] hover:bg-[#E9ECEF] py-3.5 px-4 rounded-xl flex items-center justify-between text-gray-500 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <PlusCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600">აირჩიე პროდუქტი</span>
                    </div>
                    <Search className="w-4 h-4 text-[#FF5238]" />
                  </button>
                ))}
              </div>

              {/* Big Bottom Action Button: შედარება */}
              <button
                type="button"
                onClick={() => handleOpenSearchForSlot(0)}
                className="w-full bg-[#F69679] hover:bg-[#FF5238] text-white py-3 rounded-xl text-sm transition-colors cursor-pointer text-center mt-6"
              >
                შედარება
              </button>

              {/* Quick Suggestions below */}
              {suggestedProducts.length > 0 && (
                <div className="pt-6 space-y-2.5">
                  <span className="text-xs text-gray-400 block px-1">
                    ან აირჩიეთ პოპულარული მოდელები:
                  </span>
                  <div className="space-y-2">
                    {suggestedProducts.slice(0, 4).map((p) => {
                      const pImg = p.images?.[0] || p.image || "/placeholder.png";
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleAddProduct(p.id)}
                          className="flex items-center justify-between p-2.5 bg-[#F8FAFC] border border-gray-100 rounded-xl cursor-pointer hover:bg-[#FFF5F2]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                            <img
                              src={pImg}
                              alt={p.title}
                              className="w-8 h-8 object-contain bg-white rounded-lg p-0.5"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-900 truncate">{p.title}</p>
                              <p className="text-[11px] text-[#FF5238] font-mono">
                                {p.discountPrice ? `${p.discountPrice} ₾` : `${p.price} ₾`}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] bg-[#FF5238] text-white px-2 py-1 rounded-md shrink-0">
                            + დამატება
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* SCREENSHOT 2: ACTIVE COMPARISON TABLE VIEW */
            <div className="space-y-3 pb-8">
              
              {/* Top Controls Bar: [ ] განსხვავებები + [ გაზიარება ] */}
              <div className="px-4 py-3 flex items-center justify-between">
                <label
                  onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
                  className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 select-none"
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      showOnlyDifferences ? "bg-[#034ea2] text-white" : "border border-gray-300 bg-white"
                    }`}
                  >
                    {showOnlyDifferences && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs text-gray-700">განსხვავებები</span>
                </label>

                <button
                  type="button"
                  onClick={handleShare}
                  className="bg-[#034ea2] hover:bg-[#023d80] text-white text-xs px-4 py-1.5 rounded-full cursor-pointer transition-colors shadow-2xs"
                >
                  გაზიარება
                </button>
              </div>

              {/* Top Product Header Row (Exact 4 Column / Product Column Layout) */}
              <div className="px-2">
                <div
                  className="grid gap-1.5"
                  style={{
                    gridTemplateColumns: `repeat(${activeProducts.length < 4 ? activeProducts.length + 1 : 4}, minmax(0, 1fr))`,
                  }}
                >
                  {activeProducts.map((product) => {
                    const prodImg = product.images?.[0] || product.image || "/placeholder.png";
                    return (
                      <div
                        key={product.id}
                        className="bg-[#F8FAFC] rounded-lg p-1.5 border border-gray-100 relative flex flex-col justify-between"
                      >
                        {/* Top: Mini Image + Price + Remove X */}
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <div className="w-8 h-8 bg-white rounded-md p-0.5 shrink-0 flex items-center justify-center">
                            <img
                              src={prodImg}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>

                          <span className="text-[10px] text-gray-900 font-mono flex-1 text-center pt-0.5 leading-tight">
                            {product.discountPrice || product.price} ₾
                          </span>

                          <button
                            type="button"
                            onClick={() => removeFromCompare(product.id)}
                            className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                            title="წაშლა"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Bottom: Product Title */}
                        <p className="text-[9px] text-gray-700 line-clamp-2 leading-tight">
                          {product.title}
                        </p>
                      </div>
                    );
                  })}

                  {/* Add Slot Button if < 4 */}
                  {activeProducts.length < 4 && (
                    <button
                      type="button"
                      onClick={() => handleOpenSearchForSlot(activeProducts.length)}
                      className="bg-white hover:bg-[#FFF5F2] rounded-lg p-1.5 border-2 border-dashed border-gray-200 hover:border-[#FF5238] flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[58px]"
                    >
                      <Plus className="w-4 h-4 text-[#FF5238]" />
                      <span className="text-[9px] text-gray-500 mt-0.5">დამატება</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Accordion Specification Sections */}
              <div className="space-y-2 pt-1">
                {specSections.map((section, secIdx) => {
                  const isCollapsed = Boolean(collapsedSections[section.title]);
                  const visibleRows = section.rows.filter((row) => {
                    if (!showOnlyDifferences) return true;
                    if (activeProducts.length < 2) return true;
                    const firstVal = row.values[activeProducts[0].id];
                    return activeProducts.some((p) => row.values[p.id] !== firstVal);
                  });

                  if (visibleRows.length === 0) return null;

                  const colCount = activeProducts.length < 4 ? activeProducts.length + (activeProducts.length < 4 ? 0 : 0) : 4;

                  return (
                    <div key={secIdx} className="bg-white">
                      {/* Section Accordion Header Bar */}
                      <button
                        type="button"
                        onClick={() => toggleSectionCollapse(section.title)}
                        className="w-full bg-[#F4F5F7] px-4 py-2.5 flex items-center justify-between text-left cursor-pointer"
                      >
                        <span className="text-xs text-gray-900">{section.title}</span>
                        {isCollapsed ? (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-gray-600" />
                        )}
                      </button>

                      {/* Section Body Rows */}
                      {!isCollapsed && (
                        <div className="divide-y divide-gray-100">
                          {visibleRows.map((row) => (
                            <div key={row.label} className="py-2.5 px-2 space-y-1.5">
                              {/* Centered Spec Sub-label */}
                              <div className="text-center text-[11px] text-gray-700">
                                {row.label}
                              </div>

                              {/* 4 Synchronized Column Values */}
                              <div
                                className="grid gap-1.5"
                                style={{
                                  gridTemplateColumns: `repeat(${activeProducts.length}, minmax(0, 1fr))`,
                                }}
                              >
                                {activeProducts.map((product) => (
                                  <div
                                    key={product.id}
                                    className="bg-[#ECEEF1] p-2 rounded-md text-center text-[11px] text-gray-900 leading-snug break-words flex items-center justify-center min-h-[32px]"
                                  >
                                    {row.values[product.id] || "-"}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>

        {/* =========================================================
            2. DESKTOP VIEW (hidden sm:block) - Exact Original Layout
            ========================================================= */}
        <div className="hidden sm:block space-y-6">
          {/* Desktop Top Header Controls */}
          <div className="flex items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl text-gray-900 tracking-tight">
                  პროდუქტების შედარება
                </h1>
                <span className="bg-[#FFF5F2] text-[#FF5238] border border-[#FED7CC] text-xs px-3 py-1 rounded-full font-mono">
                  {activeProducts.length} / 4 პროდუქტი
                </span>
              </div>
              <p className="text-xs text-gray-500">
                შეადარეთ მაქსიმუმ 4 პროდუქტის მახასიათებლები და ფასები ერთმანეთს
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              {activeProducts.length < 4 && (
                <button
                  type="button"
                  onClick={() => setIsSearchModalOpen(true)}
                  className="flex items-center gap-1.5 bg-[#FF5238] hover:bg-[#EA3A20] text-white text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>პროდუქტის დამატება</span>
                </button>
              )}

              {activeProducts.length > 0 && (
                <button
                  type="button"
                  onClick={clearCompare}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-red-600 transition-colors cursor-pointer px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200"
                >
                  <Trash2 className="w-4 h-4 text-gray-400" />
                  <span>გასუფთავება</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 transition-colors cursor-pointer"
                title="ბმულის გაზიარება"
              >
                <Share2 className="w-4 h-4" />
                <span>გაზიარება</span>
              </button>
            </div>
          </div>

          {/* Desktop Inline Search Bar */}
          {activeProducts.length < 4 && (
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs space-y-3 relative">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-700 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-[#FF5238]" />
                  <span>მოძებნეთ და დაამატეთ პროდუქტი შედარებისთვის:</span>
                </label>
                <span className="text-[11px] text-gray-400">
                  დარჩენილია {4 - activeProducts.length} ადგილი
                </span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ჩაწერეთ მოდელი, ბრენდი ან კატეგორია (მაგ: iPhone 16, Galaxy S24, MacBook, Sony)..."
                  className="w-full bg-[#F8FAFC] rounded-2xl py-3 pl-11 pr-10 text-xs text-gray-900 border border-gray-200 focus:outline-none focus:border-[#FF5238] focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown */}
              {searchQuery.trim().length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-2 space-y-1 max-h-[280px] overflow-y-auto z-20">
                  {inlineSearchResults.length > 0 ? (
                    inlineSearchResults.map((product) => {
                      const prodImage = product.images?.[0] || product.image || "/placeholder.png";
                      return (
                        <div
                          key={product.id}
                          onClick={() => handleAddProduct(product.id)}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF5F2] transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img
                              src={prodImage}
                              alt={product.title}
                              className="w-10 h-10 object-contain rounded-lg shrink-0 bg-white p-1 border border-gray-100"
                            />
                            <div className="min-w-0 flex-1 pr-2">
                              <h4 className="text-xs text-gray-900 truncate group-hover:text-[#FF5238] transition-colors">
                                {product.title}
                              </h4>
                              <p className="text-xs text-[#FF5238] font-mono mt-0.5">
                                {product.discountPrice ? `${product.discountPrice} ₾` : `${product.price} ₾`}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-xl bg-[#FF5238] hover:bg-[#EA3A20] text-white text-xs flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>დამატება</span>
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center text-xs text-gray-500">
                      პროდუქტი ვერ მოიძებნა
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Desktop 4 Comparison Slots Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((slotIndex) => {
              const product = activeProducts[slotIndex];

              if (product) {
                const prodImage = product.images?.[0] || product.image || "/placeholder.png";
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl p-4 border border-gray-100 shadow-2xs relative flex flex-col justify-between group hover:border-[#FED7CC] transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer"
                      title="წაშლა"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="w-full h-36 bg-[#F8FAFC] rounded-2xl p-3 flex items-center justify-center mb-3">
                      <img
                        src={prodImage}
                        alt={product.title}
                        className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                        {product.brandName || "პროდუქტი"}
                      </span>
                      <Link
                        href={`/product/${product.id}`}
                        className="text-xs text-gray-900 line-clamp-2 hover:text-[#FF5238] transition-colors leading-snug"
                      >
                        {product.title}
                      </Link>
                      <p className="text-sm text-[#FF5238] font-mono pt-1">
                        {product.discountPrice ? `${product.discountPrice} ₾` : `${product.price} ₾`}
                      </p>
                    </div>
                  </div>
                );
              }

              // Desktop Empty Slot
              return (
                <div
                  key={`empty-slot-${slotIndex}`}
                  onClick={() => setIsSearchModalOpen(true)}
                  className="bg-white hover:bg-[#FFF5F2] rounded-3xl p-6 border-2 border-dashed border-gray-200 hover:border-[#FF5238] flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all min-h-[220px] group shadow-2xs"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF5F2] group-hover:bg-[#FF5238] text-[#FF5238] group-hover:text-white flex items-center justify-center transition-colors">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-gray-700 group-hover:text-[#FF5238] transition-colors">
                    პროდუქტის დამატება
                  </span>
                  <span className="text-[10px] text-gray-400">
                    სლოტი #{slotIndex + 1}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Desktop Dynamic Spec Table */}
          {activeProducts.length > 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs p-6 space-y-6 overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <label
                  onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
                  className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-800 select-none group"
                >
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                      showOnlyDifferences
                        ? "bg-[#FF5238] text-white shadow-xs"
                        : "bg-white border border-gray-300 group-hover:border-[#FF5238]"
                    }`}
                  >
                    {showOnlyDifferences && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span>მხოლოდ განსხვავებები</span>
                </label>

                <span className="text-xs text-gray-400">
                  {specSections.length} მახასიათებლების ჯგუფი
                </span>
              </div>

              <div className="overflow-x-auto pb-2">
                <div className="min-w-[600px] space-y-6">
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
                        <div className="bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs text-gray-900">
                          <span>{section.title}</span>
                        </div>

                        <div className="space-y-1">
                          {visibleRows.map((row, rowIdx) => (
                            <div
                              key={row.label}
                              className={`grid grid-cols-12 px-4 py-3 rounded-xl items-center gap-3 text-xs ${
                                rowIdx % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]/50"
                              }`}
                            >
                              <div className="col-span-4 text-gray-500 pr-2">
                                {row.label}
                              </div>

                              <div className="col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-gray-900">
                                {activeProducts.map((product) => (
                                  <div key={product.id} className="break-words">
                                    {row.values[product.id] || "—"}
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
            </div>
          ) : (
            /* Desktop Empty State Quick Suggestions */
            <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-6 text-center shadow-2xs">
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF5F2] text-[#FF5238] flex items-center justify-center mx-auto shadow-2xs">
                  <GitCompare className="w-7 h-7" />
                </div>
                <h2 className="text-lg text-gray-900">
                  სია ცარიელია — აირჩიეთ პროდუქტები
                </h2>
                <p className="text-xs text-gray-500">
                  გამოიყენეთ ზედა საძიებო ველი ან დაამატეთ პოპულარული მოდელები ქვემოთ
                </p>
              </div>

              {suggestedProducts.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="text-left text-xs text-gray-400">
                    რეკომენდებული პროდუქტები შესადარებლად:
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {suggestedProducts.map((prod) => {
                      const prodImg = prod.images?.[0] || prod.image || "/placeholder.png";
                      return (
                        <div
                          key={prod.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#FFF5F2] border border-gray-100 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                            <img
                              src={prodImg}
                              alt={prod.title}
                              className="w-10 h-10 object-contain rounded-xl bg-white p-1 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs text-gray-900 truncate">
                                {prod.title}
                              </h4>
                              <p className="text-xs text-[#FF5238] font-mono">
                                {prod.discountPrice ? `${prod.discountPrice} ₾` : `${prod.price} ₾`}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddProduct(prod.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#FF5238] hover:bg-[#EA3A20] text-white text-xs flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>შედარება</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Product Selection Modal (up to 4 products) */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm sm:text-base text-gray-900">
                  პროდუქტის დამატება შედარებაში
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500">
                  მაქსიმუმ 4 პროდუქტი (არჩეულია {activeProducts.length}/4)
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                placeholder="მოძებნეთ პროდუქტი..."
                className="w-full bg-[#F8FAFC] rounded-2xl py-2.5 sm:py-3 pl-10 pr-4 text-xs text-gray-900 border border-gray-200 focus:outline-none focus:border-[#FF5238] focus:bg-white transition-all"
                autoFocus
              />
            </div>

            {/* Modal Product List */}
            <div className="max-h-[300px] sm:max-h-[340px] overflow-y-auto space-y-2 pr-1">
              {modalSearchResults.length > 0 ? (
                modalSearchResults.map((product) => {
                  const prodImage = product.images?.[0] || product.image || "/placeholder.png";
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleAddProduct(product.id)}
                      className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-[#F8FAFC] hover:bg-[#FFF5F2] border border-gray-100 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 pr-2">
                        <img
                          src={prodImage}
                          alt={product.title}
                          className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-xl shrink-0 bg-white p-1"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs text-gray-900 truncate group-hover:text-[#FF5238] transition-colors">
                            {product.title}
                          </h4>
                          <p className="text-xs text-[#FF5238] font-mono mt-0.5">
                            {product.discountPrice ? `${product.discountPrice} ₾` : `${product.price} ₾`}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="px-2.5 py-1.5 rounded-xl bg-[#FF5238] hover:bg-[#EA3A20] text-white text-xs flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>დამატება</span>
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-gray-500">
                  პროდუქტი ვერ მოიძებნა
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
