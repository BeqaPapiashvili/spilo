"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Loader2, Sparkles, ArrowRight, X } from "lucide-react";
import { Category, SubCategory } from "@/types";
import { getCategoryIcon } from "@/lib/categoryIcons";

export interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [mobileCategory, setMobileCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Fetch live categories directly from database
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && isMounted) {
          setCategories(json.data);
          if (json.data.length > 0) {
            setActiveCategoryId(json.data[0].id);
          }
        }
      } catch (err) {
        console.error("MegaMenu: Failed to load categories from database:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Lock body scroll while MegaMenu is open & reset mobile view on close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setMobileCategory(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // 3. Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const activeCategory =
    categories.find((cat) => cat.id === activeCategoryId || cat.slug === activeCategoryId) ||
    categories[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-0 right-0 w-full h-[calc(100dvh-100%)] min-h-[calc(100dvh-100%)] bg-white z-50 border-t border-[#F0F0F2] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* =========================================================
              MOBILE DRILL-DOWN VIEW (md:hidden)
              Step 1: Main Category List
              Step 2: Sub-category & Item View (with Back button)
              ========================================================= */}
          <div className="md:hidden flex-1 flex flex-col h-full overflow-hidden bg-white">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center text-gray-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#FF5238]" />
                <span className="text-xs">იტვირთება კატეგორიები...</span>
              </div>
            ) : mobileCategory ? (
              /* Mobile Step 2: Selected Category's Sub-categories View */
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header with Back button and Category Title */}
                <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between bg-[#F9FAFB] shrink-0">
                  <button
                    type="button"
                    onClick={() => setMobileCategory(null)}
                    className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-900 cursor-pointer py-1 pr-2"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                    <span>უკან</span>
                  </button>

                  <h3 className="text-sm text-gray-900 truncate max-w-[180px]">
                    {mobileCategory.name}
                  </h3>

                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Subcategories & Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                  {/* View All Products in this category quick tile */}
                  <Link
                    href={`/catalog?category=${mobileCategory.slug || mobileCategory.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF5F2] border border-[#FED7CC] text-xs text-[#FF5238] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#FF5238]" />
                      <span>ყველა {mobileCategory.name}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#FF5238]" />
                  </Link>

                  {mobileCategory.children && mobileCategory.children.length > 0 ? (
                    mobileCategory.children.map((sub: SubCategory) => (
                      <div key={sub.id} className="space-y-2 pb-3 border-b border-gray-100 last:border-b-0">
                        {/* Subcategory Name */}
                        <Link
                          href={`/categories/${mobileCategory.slug}/${sub.slug || sub.id}`}
                          onClick={onClose}
                          className="text-xs text-gray-900 hover:text-[#FF5238] block tracking-tight pt-1"
                        >
                          {sub.name}
                        </Link>

                        {/* Items under subcategory */}
                        {sub.items && sub.items.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            {sub.items.map((item) => {
                              const brand = item.brandQuery;
                              const href = brand
                                ? `/catalog?category=${mobileCategory.slug}&brand=${encodeURIComponent(brand)}`
                                : `/catalog?category=${mobileCategory.slug}&q=${encodeURIComponent(item.name)}`;
                              return (
                                <Link
                                  key={item.id}
                                  href={href}
                                  onClick={onClose}
                                  className="text-[12px] text-gray-600 hover:text-[#FF5238] p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors block truncate"
                                >
                                  {item.name}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-xs text-gray-500">
                      ამ კატეგორიაში ქვესექციები არ მოიძებნა
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Mobile Step 1: Full List of Categories to Choose */
              <div className="flex-1 overflow-y-auto p-3.5 space-y-1">
                <div className="px-2 py-2 text-xs text-gray-400">
                  აირჩიეთ კატეგორია:
                </div>
                {categories.map((category) => {
                  const iconElement = getCategoryIcon(category, "w-5 h-5");
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setMobileCategory(category)}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-gray-50 border border-gray-100 text-left transition-all active:scale-[0.99] cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-700 flex items-center justify-center shrink-0 border border-gray-100">
                          {iconElement}
                        </div>
                        <span className="text-xs text-gray-800 truncate">
                          {category.name}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* =========================================================
              DESKTOP VIEW (hidden md:flex)
              Left Sidebar + Right 3-column Subcategory Grid
              ========================================================= */}
          <div className="hidden md:flex w-full max-w-[1560px] mx-auto px-4 lg:px-6 flex-1 h-full overflow-hidden">
            {/* 1. Left Sidebar: Dynamic Categories from DB */}
            <div className="w-[280px] lg:w-[320px] shrink-0 border-r border-[#F0F0F2] py-4 pr-3 h-full overflow-y-auto custom-sidebar-scrollbar select-none">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center text-gray-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1D1D1F]" />
                  <span className="text-xs">იტვირთება კატეგორიები...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {categories.map((category) => {
                    const isSelected = category.id === activeCategory?.id;
                    const iconElement = getCategoryIcon(category);

                    return (
                      <button
                        key={category.id}
                        onMouseEnter={() => setActiveCategoryId(category.id)}
                        onClick={() => setActiveCategoryId(category.id)}
                        className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] transition-all text-left cursor-pointer ${
                          isSelected
                            ? "bg-[#F4F5F7] text-[#1D1D1F] shadow-2xs"
                            : "text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]"
                        }`}
                      >
                        <span
                          className={`shrink-0 transition-colors ${
                            isSelected ? "text-[#FF5238]" : "text-[#71717A]"
                          }`}
                        >
                          {iconElement}
                        </span>
                        <span className="truncate">{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Main Right Panel: 3 Columns Subcategory Grid */}
            <div className="flex-1 h-full overflow-y-auto custom-sidebar-scrollbar p-6 lg:p-10">
              {activeCategory?.children && activeCategory.children.length > 0 ? (
                <div className="grid grid-cols-3 gap-x-14 gap-y-9 items-start">
                  {activeCategory.children.map((sub: SubCategory) => (
                    <div key={sub.id} className="space-y-2.5">
                      {/* Subcategory Title */}
                      <Link
                        href={`/categories/${activeCategory.slug}/${sub.slug || sub.id}`}
                        onClick={onClose}
                        className="text-[15px] text-[#111827] hover:text-[#FF5238] transition-colors block tracking-tight"
                      >
                        {sub.name}
                      </Link>

                      {/* Subcategory Items List */}
                      {sub.items && sub.items.length > 0 && (
                        <div className="space-y-2 pt-0.5">
                          {sub.items.map((item) => {
                            const brand = item.brandQuery;
                            const href = brand
                              ? `/catalog?category=${activeCategory.slug}&brand=${encodeURIComponent(
                                  brand
                                )}`
                              : `/catalog?category=${activeCategory.slug}&q=${encodeURIComponent(
                                  item.name
                                )}`;
                            return (
                              <Link
                                key={item.id}
                                href={href}
                                onClick={onClose}
                                className="text-[13.5px] text-[#4B5563] hover:text-[#FF5238] transition-colors block leading-relaxed"
                              >
                                {item.name}
                              </Link>
                            );
                          })}

                          {/* 'მეტი' Link */}
                          <Link
                            href={`/categories/${activeCategory.slug}/${sub.slug || sub.id}`}
                            onClick={onClose}
                            className="text-[12.5px] text-[#FF5238] hover:underline transition-colors pt-1 block"
                          >
                            მეტი
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 flex flex-col items-center justify-center text-center text-gray-500 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF5F2] text-[#FF5238] flex items-center justify-center">
                    {activeCategory ? (
                      getCategoryIcon(activeCategory)
                    ) : (
                      <Sparkles className="w-7 h-7" />
                    )}
                  </div>
                  <p className="text-[15px] text-gray-800">
                    {activeCategory?.name || "კატეგორია"}
                  </p>
                  <Link
                    href={`/catalog?category=${activeCategory?.slug || ""}`}
                    onClick={onClose}
                    className="text-xs text-[#FF5238] hover:underline"
                  >
                    ყველა პროდუქტის ნახვა
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
