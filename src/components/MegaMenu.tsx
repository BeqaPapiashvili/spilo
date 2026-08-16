"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  Camera,
  Smartphone,
  Laptop,
  Headphones,
  Home,
  Tv,
  Gamepad2,
  Watch,
  Tablet,
  Sparkle
} from "lucide-react";
import { Category } from "@/types";

const iconMap: Record<string, React.ReactNode> = {
  Camera: <Camera className="w-4 h-4 text-gray-600" />,
  Smartphone: <Smartphone className="w-4 h-4 text-gray-600" />,
  Tablet: <Tablet className="w-4 h-4 text-gray-600" />,
  Laptop: <Laptop className="w-4 h-4 text-gray-600" />,
  Headphones: <Headphones className="w-4 h-4 text-gray-600" />,
  Home: <Home className="w-4 h-4 text-gray-600" />,
  Tv: <Tv className="w-4 h-4 text-gray-600" />,
  Gamepad2: <Gamepad2 className="w-4 h-4 text-gray-600" />,
  Watch: <Watch className="w-4 h-4 text-gray-600" />,
};

export interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && isMounted) {
          setCategories(json.data);
          if (json.data.length > 0 && !activeCategoryId) {
            setActiveCategoryId(json.data[0].id);
          }
        }
      } catch (err) {
        console.error("MegaMenu: Failed to load categories from database:", err);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeCategory = categories.find((cat) => cat.id === activeCategoryId || cat.slug === activeCategoryId) || categories[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 w-full z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute top-0 left-0 right-0 h-[200vh] bg-black/40 backdrop-blur-sm z-10 pointer-events-auto"
          />

          {/* Mega Menu Content Card */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="relative z-20 bg-white border-b border-x border-gray-200 shadow-2xl max-w-7xl mx-auto rounded-b-2xl overflow-hidden pointer-events-auto"
          >
            <div className="flex h-[480px]">
              
              {/* 1. Left Sidebar: Main Categories List */}
              <div className="w-[250px] bg-[#F4F5F7] border-r border-gray-200/80 py-3 px-2.5 pr-1.5 overflow-y-auto shrink-0 select-none custom-sidebar-scrollbar">
                <div className="flex flex-col gap-1">
                  {categories.map((category) => {
                    const isSelected = category.id === activeCategoryId;
                    return (
                      <button
                        key={category.id}
                        onMouseEnter={() => setActiveCategoryId(category.id)}
                        onClick={() => setActiveCategoryId(category.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all text-left cursor-pointer ${
                          isSelected
                            ? "bg-[#E2E5EA] text-gray-900 shadow-2xs font-normal"
                            : "text-gray-700 hover:bg-gray-200/60 hover:text-gray-900"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isSelected ? "text-gray-900" : "text-gray-500"}>
                            {category.icon && iconMap[category.icon] ? iconMap[category.icon] : <Sparkle className="w-4 h-4 text-gray-500" />}
                          </span>
                          <span className={isSelected ? "text-gray-900" : "text-gray-700"}>{category.name}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? "text-gray-900" : "text-gray-400"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Main Right Panel: Subcategories Columns & Items Grid */}
              <div className="flex-1 bg-white p-6 overflow-y-auto relative flex flex-col justify-between">
                <div>
                  
                  {activeCategory?.children && activeCategory.children.length > 0 ? (
                    <div className="grid grid-cols-4 gap-6">
                      {activeCategory.children.map((sub) => (
                        <div key={sub.id} className="space-y-2.5">
                          
                          {/* Subcategory Title */}
                          <Link
                            href={`/categories/${activeCategory.slug}/${sub.slug}`}
                            onClick={onClose}
                            className="text-xs sm:text-sm text-gray-900 hover:text-blue-600 transition-colors block border-b border-gray-100 pb-1 tracking-tight"
                          >
                            {sub.name}
                          </Link>

                          {/* List of Level-3 Deep Items / Brands */}
                          {sub.items && sub.items.length > 0 ? (
                            <div className="space-y-1.5 pt-0.5">
                              {sub.items.map((item) => {
                                const href = `/catalog?category=${item.slug}${item.brandQuery ? `&brand=${item.brandQuery}` : ""}`;
                                return (
                                  <Link
                                    key={item.id}
                                    href={href}
                                    onClick={onClose}
                                    className="text-xs text-gray-600 hover:text-blue-600 transition-colors block leading-relaxed"
                                  >
                                    {item.name}
                                  </Link>
                                );
                              })}

                              {/* 'ყველას ნახვა' Link */}
                              <Link
                                href={`/categories/${activeCategory.slug}/${sub.slug}`}
                                onClick={onClose}
                                className="text-[11px] text-gray-400 hover:text-blue-600 transition-colors pt-1 block"
                              >
                                ყველას ნახვა
                              </Link>
                            </div>
                          ) : (
                            <Link
                              href={`/catalog?category=${sub.slug}`}
                              onClick={onClose}
                              className="text-xs text-gray-400 hover:text-blue-600 transition-colors block"
                            >
                              ყველას ნახვა
                            </Link>
                          )}

                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-400 text-xs">
                      კატეგორია მალე განახლდება
                    </div>
                  )}

                </div>

              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
