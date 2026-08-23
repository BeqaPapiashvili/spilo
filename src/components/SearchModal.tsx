"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, History, TrendingUp, ArrowRight, Tag, Loader2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Product, Category } from "@/types";

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { recentSearches, addRecentSearch, clearRecentSearches } = useStore();
  const [query, setQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 1. Fetch categories from database on modal mount
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

    if (isOpen) {
      fetchCategories();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // 2. Debounced search against live /api/products endpoint
  useEffect(() => {
    let isMounted = true;
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      setFilteredProducts([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(cleanQuery)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && isMounted) {
          setFilteredProducts(json.data);
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative min-h-screen sm:min-h-0 sm:max-w-2xl sm:mx-auto sm:mt-16 bg-white sm:rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col"
          >
            {/* Search Bar Input */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center gap-3">
              {isSearching ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
              ) : (
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
              )}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchSubmit();
                }}
                placeholder="ძიება: DJI, iPhone 16 Pro, MacBook..."
                autoFocus
                className="w-full text-base text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
              >
                დახურვა
              </button>
            </div>

            {/* Results / Suggestions Container */}
            <div className="p-5 overflow-y-auto max-h-[70vh] flex flex-col gap-6">
              {/* If query exists, show live suggestions */}
              {cleanQuery ? (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                    ძიების შედეგები ({filteredProducts.length})
                  </p>
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8 gap-2 text-xs text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin text-[#FF5238]" />
                      <span>იძებნება მონაცემთა ბაზაში...</span>
                    </div>
                  ) : filteredProducts.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {filteredProducts.slice(0, 5).map((product) => {
                        const prodImage = product.images?.[0] || product.image || "/placeholder.png";
                        return (
                          <div
                            key={product.id}
                            onClick={() => {
                              addRecentSearch(product.title);
                              onClose();
                              router.push(`/product/${product.id}`);
                            }}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 cursor-pointer transition-all"
                          >
                            <img
                              src={prodImage}
                              alt={product.title}
                              className="w-12 h-12 object-contain bg-white rounded-lg border border-gray-100"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-900 truncate">{product.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-[#FF5238]">
                                  ₾{product.discountPrice || product.price}
                                </span>
                                {product.discountPrice && (
                                  <span className="text-[11px] text-gray-400 line-through">
                                    ₾{product.price}
                                  </span>
                                )}
                                {product.categoryName && (
                                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                    {product.categoryName}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300" />
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => handleSearchSubmit()}
                        className="mt-2 w-full py-2.5 bg-[#FFF5F2] hover:bg-[#FED7CC] text-[#FF5238] rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        ყველა შედეგის ნახვა ({filteredProducts.length})
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-xs">
                      პროდუქტი დასახელებით &quot;{query}&quot; ვერ მოიძებნა.
                    </div>
                  )}
                </div>
              ) : (
                /* Default View: Recent & Popular Searches */
                <>
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5" />
                          ბოლო ძიებები
                        </p>
                        <button
                          type="button"
                          onClick={clearRecentSearches}
                          className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          გასუფთავება
                        </button>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {recentSearches.map((term) => (
                          <button
                            type="button"
                            key={term}
                            onClick={() => handleSearchSubmit(term)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>{term}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Searches */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#FF5238]" />
                      პოპულარული ძიებები
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {["DJI Neo", "iPhone 16 Pro", "MacBook Pro M3", "Sony WH-1000XM5", "DJI Mini 4"].map(
                        (popular) => (
                          <button
                            type="button"
                            key={popular}
                            onClick={() => handleSearchSubmit(popular)}
                            className="px-3 py-1.5 bg-[#FFF5F2] hover:bg-[#FED7CC] text-[#FF5238] rounded-xl text-xs transition-colors cursor-pointer"
                          >
                            {popular}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Popular Categories shortcuts */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      კატეგორიები
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.slice(0, 6).map((cat) => (
                        <div
                          key={cat.id}
                          onClick={() => {
                            onClose();
                            router.push(`/catalog?category=${cat.slug}`);
                          }}
                          className="p-3 rounded-xl border border-gray-100 hover:border-[#FED7CC] hover:bg-[#FFF5F2]/50 cursor-pointer transition-all flex items-center justify-between"
                        >
                          <span className="text-xs text-gray-800">{cat.name}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
