"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Loader2, Sparkles } from "lucide-react";
import { Category, SubCategory } from "@/types";
import { getCategoryIcon } from "@/lib/categoryIcons";

export interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/* =========================================================================
   MEGA MENU COMPONENT (Dynamic from MySQL Database)
   ========================================================================= */

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
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

  // 2. Lock body scroll while MegaMenu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
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

  const activeCategory = categories.find((cat) => cat.id === activeCategoryId || cat.slug === activeCategoryId) || categories[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-0 right-0 w-full h-[calc(100vh-100%)] min-h-[calc(100vh-100%)] bg-white z-50 border-t border-[#F0F0F2] flex flex-col shadow-2xl"
        >
          {/* Full Screen Content Canvas constrained to 1560px */}
          <div className="w-full max-w-[1560px] mx-auto px-4 lg:px-6 flex-1 flex h-full overflow-hidden">

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
                        <span className={`shrink-0 transition-colors ${isSelected ? "text-[#1D1D1F]" : "text-[#0D9488]"}`}>
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
                        href={`/catalog?category=${sub.slug || activeCategory.slug}`}
                        onClick={onClose}
                        className="text-[15px] text-[#111827] hover:text-[#1D1D1F] transition-colors block tracking-tight"
                      >
                        {sub.name}
                      </Link>

                      {/* Subcategory Items List */}
                      {sub.items && sub.items.length > 0 && (
                        <div className="space-y-2 pt-0.5">
                          {sub.items.map((item) => {
                            const href = `/catalog?category=${item.slug || sub.slug || activeCategory.slug}${item.brandQuery ? `&brand=${item.brandQuery}` : ""}`;
                            return (
                              <Link
                                key={item.id}
                                href={href}
                                onClick={onClose}
                                className="text-[13.5px] text-[#4B5563] hover:text-[#1D1D1F] transition-colors block leading-relaxed"
                              >
                                {item.name}
                              </Link>
                            );
                          })}

                          {/* 'მეტი' Link */}
                          <Link
                            href={`/catalog?category=${sub.slug || activeCategory.slug}`}
                            onClick={onClose}
                            className="text-[12.5px] text-[#0284C7] hover:underline transition-colors pt-1 block"
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
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 text-[#1D1D1F] flex items-center justify-center">
                    {activeCategory ? getCategoryIcon(activeCategory) : <Sparkles className="w-7 h-7" />}
                  </div>
                  <p className="text-[15px] text-gray-800">{activeCategory?.name || "კატეგორია"}</p>
                  <Link
                    href={`/catalog?category=${activeCategory?.slug || ""}`}
                    onClick={onClose}
                    className="text-xs text-[#0284C7] hover:underline"
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
