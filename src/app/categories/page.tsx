"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ChevronRight, 
  Sparkles, 
  Search,
  Tv,
  Smartphone,
  Laptop,
  Headphones,
  Home,
  Gamepad2,
  Watch,
  Camera,
  Tablet
} from "lucide-react";
import { CATEGORIES_DATA } from "@/data/categories";

const iconMap: Record<string, React.ReactNode> = {
  Camera: <Camera className="w-12 h-12 stroke-[1.6]" />,
  Smartphone: <Smartphone className="w-12 h-12 stroke-[1.6]" />,
  Tablet: <Tablet className="w-12 h-12 stroke-[1.6]" />,
  Laptop: <Laptop className="w-12 h-12 stroke-[1.6]" />,
  Headphones: <Headphones className="w-12 h-12 stroke-[1.6]" />,
  Home: <Home className="w-12 h-12 stroke-[1.6]" />,
  Tv: <Tv className="w-12 h-12 stroke-[1.6]" />,
  Gamepad2: <Gamepad2 className="w-12 h-12 stroke-[1.6]" />,
  Watch: <Watch className="w-12 h-12 stroke-[1.6]" />,
};

export default function MainCategoriesPage() {
  const [filterQuery, setFilterQuery] = useState("");

  const cleanQuery = filterQuery.trim().toLowerCase();

  const filteredCategories = CATEGORIES_DATA.filter((cat) => {
    if (!cleanQuery) return true;
    return (
      cat.name.toLowerCase().includes(cleanQuery) ||
      cat.children?.some((sub) => sub.name.toLowerCase().includes(cleanQuery))
    );
  });

  return (
    <div className="min-h-screen bg-white pb-24">
      
      {/* 1. Header Banner */}
      <section className="bg-[#F8FAFC] border-b border-gray-100 py-8 md:py-10">
        <div className="container mx-auto px-4 lg:px-8 space-y-3">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">მთავარი</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900">ყველა კატეგორია</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight">
                ყველა კატეგორია
              </h1>
            </div>

            {/* Search filter */}
            <div className="w-full md:w-80 relative">
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="ძიება კატეგორიებში..."
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-xs md:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

        </div>
      </section>

      {/* 2. Main Category Cards Grid (Clean design without hover scale animations) */}
      <section className="pt-8">
        <div className="container mx-auto px-4 lg:px-8">
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {filteredCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="w-full h-[160px] bg-[#EAECEF] hover:bg-[#E2E5EA] rounded-xl p-3.5 flex flex-col justify-between items-start cursor-pointer relative overflow-hidden select-none group block text-left"
              >
                <h4 className="text-xs sm:text-sm text-[#111111] leading-tight pt-0.5 z-10 text-left">
                  {cat.name}
                </h4>

                <div className="absolute bottom-1.5 right-1.5 w-14 h-14 flex items-end justify-end pointer-events-none opacity-40 text-black">
                  {cat.icon && iconMap[cat.icon] ? iconMap[cat.icon] : <Sparkles className="w-12 h-12 stroke-[1.6]" />}
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
