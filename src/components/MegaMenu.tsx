"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ArrowRight, 
  Sparkles,
  Camera,
  Smartphone,
  Laptop,
  Headphones,
  Home,
  Tv,
  Gamepad2,
  Watch
} from "lucide-react";
import { CATEGORIES_DATA } from "@/data/categories";
import { BRANDS_DATA } from "@/data/brands";

const iconMap: Record<string, React.ReactNode> = {
  Camera: <Camera className="w-5 h-5" />,
  Smartphone: <Smartphone className="w-5 h-5" />,
  Laptop: <Laptop className="w-5 h-5" />,
  Headphones: <Headphones className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  Tv: <Tv className="w-5 h-5" />,
  Gamepad2: <Gamepad2 className="w-5 h-5" />,
  Watch: <Watch className="w-5 h-5" />,
};

export interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(CATEGORIES_DATA[0].id);

  const activeCategory = CATEGORIES_DATA.find((cat) => cat.id === activeCategoryId) || CATEGORIES_DATA[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute top-full left-0 w-full z-40">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 top-[120px] bg-black/30 backdrop-blur-xs z-10"
          />

          {/* Mega Menu Content Card */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="relative z-20 bg-white border-b border-gray-200 shadow-2xl max-w-7xl mx-auto rounded-b-2xl overflow-hidden"
          >
            <div className="flex h-[420px]">
              {/* Left Column: Categories List */}
              <div className="w-1/4 bg-gray-50 border-r border-gray-200 py-4 overflow-y-auto">
                <p className="px-5 pb-3 text-[11px] text-gray-400 uppercase tracking-wider">
                  ყველა კატეგორია
                </p>
                <div className="flex flex-col gap-1 px-3">
                  {CATEGORIES_DATA.map((category) => {
                    const isSelected = category.id === activeCategoryId;
                    return (
                      <button
                        key={category.id}
                        onMouseEnter={() => setActiveCategoryId(category.id)}
                        onClick={() => {
                          setActiveCategoryId(category.id);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs transition-all text-left cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-gray-700 hover:bg-gray-200/60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isSelected ? "text-white" : "text-gray-500"}>
                            {category.icon && iconMap[category.icon] ? iconMap[category.icon] : <Sparkles className="w-4 h-4" />}
                          </span>
                          <span>{category.name}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isSelected ? "text-white" : "text-gray-400"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Middle Column: Subcategories */}
              <div className="w-2/4 p-6 overflow-y-auto bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                    <h3 className="text-base text-gray-900 flex items-center gap-2">
                      {activeCategory.name}
                    </h3>
                    <Link
                      href={`/catalog?category=${activeCategory.slug}`}
                      onClick={onClose}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
                    >
                      ყველას ნახვა
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {activeCategory.children && activeCategory.children.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {activeCategory.children.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/catalog?category=${sub.slug}`}
                          onClick={onClose}
                          className="p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all flex items-center justify-between group"
                        >
                          <div>
                            <p className="text-xs text-gray-800 group-hover:text-blue-600 transition-colors">
                              {sub.name}
                            </p>
                            {sub.productCount && (
                              <p className="text-[11px] text-gray-400">{sub.productCount} პროდუქტი</p>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Popular Brands under active category */}
                {activeCategory.featuredBrands && (
                  <div className="pt-4 border-t border-gray-100 mt-4">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-2">
                      პოპულარული ბრენდები
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {activeCategory.featuredBrands.map((brandName) => (
                        <Link
                          key={brandName}
                          href={`/catalog?brand=${brandName.toLowerCase()}`}
                          onClick={onClose}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-700 transition-colors"
                        >
                          {brandName}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Promotional Banner */}
              <div className="w-1/4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50/40 border-l border-gray-100 flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2.5 py-1 bg-blue-600 text-white text-[10px] rounded-full mb-3">
                    სპეციალური შეთავაზება
                  </span>
                  <h4 className="text-sm text-gray-900 mb-2">
                    {activeCategory.promoBanner?.title || "0% ონლაინ განვადება Spilo-ზე"}
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">
                    შეიძინეთ უპროცენტო განვადებით და მიიღეთ უფასო მიწოდება მთელ საქართველოში.
                  </p>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-white border border-gray-200 p-2 shadow-xs">
                  <img
                    src={activeCategory.image || activeCategory.promoBanner?.image}
                    alt={activeCategory.name}
                    className="w-full h-32 object-contain rounded-lg"
                  />
                  <Link
                    href={`/catalog?category=${activeCategory.slug}`}
                    onClick={onClose}
                    className="mt-3 w-full py-2 bg-gray-900 text-white rounded-lg text-xs flex items-center justify-center gap-1 hover:bg-gray-800 transition-colors"
                  >
                    იხილეთ პროდუქტები
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
