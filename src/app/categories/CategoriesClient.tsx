"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronRight, 
  Search,
  Loader2,
  ArrowUpRight,
  Layers
} from "lucide-react";
import { Category } from "@/types";
import { getCategoryIcon } from "@/lib/categoryIcons";

// Distinct pastel color palette cycles for each category card
const colorVariants = [
  { bg: "bg-[#FFE4E6]", text: "text-[#E11D48]", border: "hover:border-[#E11D48]/30", chipBg: "bg-[#FFF1F2]" },
  { bg: "bg-[#CCFBF1]", text: "text-[#0D9488]", border: "hover:border-[#0D9488]/30", chipBg: "bg-[#F0FDFA]" },
  { bg: "bg-[#FEF3C7]", text: "text-[#D97706]", border: "hover:border-[#D97706]/30", chipBg: "bg-[#FFFBEB]" },
  { bg: "bg-[#E0F2FE]", text: "text-[#0284C7]", border: "hover:border-[#0284C7]/30", chipBg: "bg-[#F0F9FF]" },
  { bg: "bg-[#D1FAE5]", text: "text-[#059669]", border: "hover:border-[#059669]/30", chipBg: "bg-[#ECFDF5]" },
  { bg: "bg-[#FFEDD5]", text: "text-[#EA580C]", border: "hover:border-[#EA580C]/30", chipBg: "bg-[#FFF7ED]" },
  { bg: "bg-[#F3E8FF]", text: "text-[#9333EA]", border: "hover:border-[#9333EA]/30", chipBg: "bg-[#FAF5FF]" },
  { bg: "bg-[#FCE7F3]", text: "text-[#DB2777]", border: "hover:border-[#DB2777]/30", chipBg: "bg-[#FDF2F8]" },
];

interface CategoriesClientProps {
  initialCategories?: Category[];
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [isLoading, setIsLoading] = useState(!initialCategories);

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
        console.error("MainCategoriesPage: Failed to load categories:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1560px] pt-6 md:pt-8">
        
        {/* 1. Breadcrumbs & Header Section */}
        <div className="pb-8">
          {/* Breadcrumb trail */}
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-5">
            <Link href="/" className="hover:text-[#1D1D1F] transition-colors">
              მთავარი
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-900">კატეგორიები</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 bg-gray-100 text-[#1D1D1F] px-3 py-1 rounded-full text-xs">
                <Layers className="w-3.5 h-3.5 text-gray-600" />
                <span>სრული კატალოგი</span>
              </div>
              <h1 className="text-3xl md:text-4xl text-gray-900 tracking-tight">
                პროდუქციის კატეგორიები
              </h1>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                დაათვალიერეთ ჩვენი ყველა კატეგორია და იპოვეთ სასურველი პროდუქტი საუკეთესო ფასად.
              </p>
            </div>

            {/* Header Search Input */}
            <div className="w-full md:w-80 lg:w-96 relative shrink-0">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="მოძებნეთ კატეგორია..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full h-12 bg-white border-2 border-gray-200 rounded-full pl-11 pr-4 text-xs md:text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1D1D1F] shadow-2xs transition-all"
              />
            </div>
          </div>
        </div>

        {/* 2. Categories Grid */}
        <div className="pt-2">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-7 h-7 animate-spin text-[#1D1D1F]" />
            <p className="text-xs text-gray-400">იტვირთება კატეგორიები...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((cat, idx) => {
              const color = colorVariants[idx % colorVariants.length];
              const iconNode = getCategoryIcon(cat, "w-7 h-7 stroke-[1.8]");
              const childrenCount = cat.children?.length || 0;

              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug || cat.id}`}
                  className={`group relative p-6 rounded-3xl border border-gray-200/80 bg-white hover:border-[#1D1D1F] hover:shadow-xl hover:shadow-black/5 transition-all duration-200 flex flex-col justify-between min-h-[220px] select-none ${color.border}`}
                >
                  {/* Top Bar: Icon Badge & Arrow */}
                  <div className="flex items-start justify-between">
                    <div className={`w-14 h-14 rounded-2xl ${color.bg} ${color.text} flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform duration-200`}>
                      {iconNode}
                    </div>

                    <span className="w-9 h-9 rounded-full bg-gray-100/80 group-hover:bg-[#1D1D1F] group-hover:text-white text-gray-500 flex items-center justify-center transition-colors">
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </div>

                  {/* Middle & Bottom: Title, Count, and Subcategories preview */}
                  <div className="space-y-2.5 pt-4">
                    <div>
                      <h3 className="text-base text-gray-900 group-hover:text-[#1D1D1F] transition-colors tracking-tight">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {childrenCount > 0
                          ? `${childrenCount} ქვეკატეგორია`
                          : "დაათვალიერეთ მოდელები"}
                      </p>
                    </div>

                    {/* Subcategories preview chips if available */}
                    {cat.children && cat.children.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {cat.children.slice(0, 3).map((sub) => (
                          <span
                            key={sub.id}
                            className={`text-[11px] px-2 py-0.5 rounded-lg text-gray-600 bg-gray-100 group-hover:${color.chipBg} transition-colors`}
                          >
                            {sub.name}
                          </span>
                        ))}
                        {cat.children.length > 3 && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded-lg text-gray-400">
                            +{cat.children.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center space-y-4 max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm text-gray-700">კატეგორია ვერ მოიძებნა</p>
            <button
              onClick={() => setFilterQuery("")}
              className="text-xs text-[#1D1D1F] underline hover:no-underline cursor-pointer"
            >
              ფილტრის გასუფთავება
            </button>
          </div>
        )}
        </div>

      </div>
    </div>
  );
}
