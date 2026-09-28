"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, History, TrendingUp, ArrowUpLeft, ArrowRight, ChevronLeft, Store, SearchX } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Product, Category } from "@/types";
import { getCategoryIcon } from "@/lib/categoryIcons";

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = ["DJI Neo", "iPhone 16 Pro", "MacBook Pro M3", "Sony WH-1000XM5", "DJI Mini 4"];

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { recentSearches, addRecentSearch, clearRecentSearches } = useStore();
  const [query, setQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [matchedStores, setMatchedStores] = useState<{ name: string; slug: string; logo?: string | null }[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && isMounted) {
          setCategories(json.data);
        }
      } catch (err) {
        console.error("SearchModal: Failed to fetch categories:", err);
      }
    };

    if (isOpen && categories.length === 0) {
      fetchCategories();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, categories.length]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    let isMounted = true;
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      setFilteredProducts([]);
      setMatchedStores([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const [res, storeRes] = await Promise.all([
          fetch(`/api/products?q=${encodeURIComponent(cleanQuery)}&limit=24`),
          fetch(`/api/stores?q=${encodeURIComponent(cleanQuery)}`),
        ]);
        const [json, storeJson] = await Promise.all([res.json(), storeRes.json()]);
        if (isMounted) {
          if (json.success && Array.isArray(json.data)) setFilteredProducts(json.data);
          if (storeJson.success && Array.isArray(storeJson.data)) setMatchedStores(storeJson.data);
        }
      } catch (err) {
        console.error("SearchModal: Live search error:", err);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  const cleanQuery = query.trim();

  const handleSearchSubmit = (searchKeyword?: string) => {
    const term = searchKeyword || query;
    if (!term.trim()) return;
    addRecentSearch(term.trim());
    onClose();
    router.push(`/search?q=${encodeURIComponent(term.trim())}`);
  };

  const sectionTitle = "text-[13px] text-zinc-900";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="hidden sm:block absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative h-dvh sm:h-auto sm:max-h-[80vh] sm:max-w-2xl sm:mx-auto sm:mt-16 bg-white sm:rounded-3xl sm:shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Search bar */}
            <div
              className="shrink-0 px-3 sm:px-5 pb-3 sm:pb-4 pt-3 sm:pt-5 flex items-center gap-2 border-b border-zinc-100"
              style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="უკან"
                className="sm:hidden w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-zinc-700 active:bg-zinc-100 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="relative flex-1">
                <Search className="w-[18px] h-[18px] text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  enterKeyHint="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchSubmit();
                  }}
                  placeholder="რას ეძებთ?"
                  autoFocus
                  className="w-full h-12 pl-11 pr-11 rounded-full bg-zinc-100 text-[15px] text-zinc-900 placeholder:text-zinc-400 border border-transparent focus:bg-white focus:border-[#FF5238]/40 focus:ring-4 focus:ring-[#FF5238]/10 focus:outline-none transition-all [&::-webkit-search-cancel-button]:hidden"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="გასუფთავება"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-200/70 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="hidden sm:flex h-12 px-4 shrink-0 items-center rounded-full text-sm text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                დახურვა
              </button>
            </div>

            {/* Content */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 pt-5"
              style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}
            >
              {cleanQuery ? (
                <div className="flex flex-col gap-6">
                  {matchedStores.length > 0 && (
                    <section>
                      <p className={`${sectionTitle} mb-3`}>მაღაზიები</p>
                      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 [scrollbar-width:none]">
                        {matchedStores.slice(0, 6).map((store) => (
                          <Link
                            key={store.slug}
                            href={`/stores/${store.slug}`}
                            onClick={onClose}
                            className="shrink-0 flex items-center gap-2.5 h-12 pl-1.5 pr-4 rounded-full bg-zinc-50 hover:bg-zinc-100 transition-colors"
                          >
                            <span className="w-9 h-9 rounded-full bg-white ring-1 ring-black/[0.06] overflow-hidden flex items-center justify-center">
                              {store.logo ? (
                                <img src={store.logo} alt="" className="w-full h-full object-contain p-1" />
                              ) : (
                                <Store className="w-4 h-4 text-zinc-400" />
                              )}
                            </span>
                            <span className="text-[13px] text-zinc-800 whitespace-nowrap">{store.name}</span>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}

                  <section>
                    <div className="flex items-center justify-between mb-2">
                      <p className={sectionTitle}>პროდუქტები</p>
                      {!isSearching && filteredProducts.length > 0 && (
                        <span className="text-xs text-zinc-400">{filteredProducts.length} შედეგი</span>
                      )}
                    </div>

                    {isSearching && filteredProducts.length === 0 ? (
                      <div className="flex flex-col">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3 py-2.5">
                            <div className="w-14 h-14 rounded-2xl bg-zinc-100 animate-pulse" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 w-3/4 rounded-full bg-zinc-100 animate-pulse" />
                              <div className="h-3 w-1/4 rounded-full bg-zinc-100 animate-pulse" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredProducts.length > 0 ? (
                      <div className={`flex flex-col transition-opacity ${isSearching ? "opacity-60" : ""}`}>
                        {filteredProducts.slice(0, 6).map((product) => {
                          const prodImage = product.images?.[0] || product.image || "/placeholder.png";
                          const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
                          return (
                            <Link
                              key={product.id}
                              href={`/product/${product.id}`}
                              onClick={() => {
                                addRecentSearch(product.title);
                                onClose();
                              }}
                              className="flex items-center gap-3 py-2.5 -mx-2 px-2 rounded-2xl hover:bg-zinc-50 active:bg-zinc-100 transition-colors"
                            >
                              <div className="w-14 h-14 shrink-0 rounded-2xl bg-zinc-50 overflow-hidden flex items-center justify-center">
                                <img src={prodImage} alt={product.title} className="w-full h-full object-contain p-1.5 mix-blend-multiply" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] leading-snug text-zinc-900 line-clamp-2">{product.title}</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                  <span className={`text-sm ${hasDiscount ? "text-[#FF5238]" : "text-zinc-900"}`}>
                                    ₾{product.discountPrice || product.price}
                                  </span>
                                  {hasDiscount && <span className="text-[11px] text-zinc-400 line-through">₾{product.price}</span>}
                                </div>
                              </div>
                            </Link>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() => handleSearchSubmit()}
                          className="mt-4 w-full h-12 rounded-full bg-[#FF5238] hover:bg-[#F0452C] text-white text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          ყველა შედეგის ნახვა
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center mb-4">
                          <SearchX className="w-7 h-7 text-zinc-300" />
                        </div>
                        <p className="text-sm text-zinc-900">ვერაფერი მოიძებნა</p>
                        <p className="text-xs text-zinc-500 mt-1 max-w-[260px]">
                          „{cleanQuery}“ — სცადეთ სხვა სიტყვა ან შეამოწმეთ მართლწერა
                        </p>
                      </div>
                    )}
                  </section>
                </div>
              ) : (
                <div className="flex flex-col gap-7">
                  {recentSearches.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-1">
                        <p className={sectionTitle}>ბოლო ძიებები</p>
                        <button
                          type="button"
                          onClick={clearRecentSearches}
                          className="text-xs text-[#FF5238] hover:opacity-80 cursor-pointer"
                        >
                          გასუფთავება
                        </button>
                      </div>
                      <div className="flex flex-col">
                        {recentSearches.map((term) => (
                          <div key={term} className="flex items-center -mx-2 rounded-2xl hover:bg-zinc-50">
                            <button
                              type="button"
                              onClick={() => handleSearchSubmit(term)}
                              className="flex-1 min-w-0 flex items-center gap-3 h-11 px-2 text-left cursor-pointer"
                            >
                              <History className="w-[18px] h-[18px] text-zinc-400 shrink-0" />
                              <span className="text-sm text-zinc-700 truncate">{term}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuery(term)}
                              aria-label="ველში ჩასმა"
                              className="w-10 h-11 shrink-0 flex items-center justify-center text-zinc-300 hover:text-zinc-500 cursor-pointer"
                            >
                              <ArrowUpLeft className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section>
                    <p className={`${sectionTitle} mb-3`}>პოპულარული</p>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SEARCHES.map((popular) => (
                        <button
                          type="button"
                          key={popular}
                          onClick={() => handleSearchSubmit(popular)}
                          className="h-9 px-3.5 rounded-full bg-white ring-1 ring-zinc-200 hover:ring-[#FF5238]/40 hover:bg-[#FFF5F2] text-[13px] text-zinc-700 flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-[#FF5238]" />
                          {popular}
                        </button>
                      ))}
                    </div>
                  </section>

                  {categories.length > 0 && (
                    <section>
                      <p className={`${sectionTitle} mb-3`}>კატეგორიები</p>
                      <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                        {categories.slice(0, 8).map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/catalog?category=${cat.slug}`}
                            onClick={onClose}
                            className="group flex flex-col items-center gap-2 text-center"
                          >
                            <span className="w-14 h-14 rounded-2xl bg-zinc-50 group-hover:bg-[#FFF5F2] text-zinc-700 group-hover:text-[#FF5238] flex items-center justify-center transition-colors">
                              {getCategoryIcon(cat, "w-6 h-6 stroke-[1.6]")}
                            </span>
                            <span className="text-[11px] leading-tight text-zinc-600 line-clamp-2">{cat.name}</span>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
