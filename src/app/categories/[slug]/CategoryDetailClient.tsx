"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronRight, 
  Loader2,
  ArrowUpRight,
  Layers
} from "lucide-react";
import { Category } from "@/types";
import { getCategoryIcon } from "@/lib/categoryIcons";

const colorVariants = [
  { bg: "bg-[#FFE4E6]", text: "text-[#E11D48]", border: "hover:border-[#E11D48]/30" },
  { bg: "bg-[#CCFBF1]", text: "text-[#0D9488]", border: "hover:border-[#0D9488]/30" },
  { bg: "bg-[#FEF3C7]", text: "text-[#D97706]", border: "hover:border-[#D97706]/30" },
  { bg: "bg-[#E0F2FE]", text: "text-[#0284C7]", border: "hover:border-[#0284C7]/30" },
  { bg: "bg-[#D1FAE5]", text: "text-[#059669]", border: "hover:border-[#059669]/30" },
  { bg: "bg-[#FFEDD5]", text: "text-[#EA580C]", border: "hover:border-[#EA580C]/30" },
  { bg: "bg-[#F3E8FF]", text: "text-[#9333EA]", border: "hover:border-[#9333EA]/30" },
  { bg: "bg-[#FCE7F3]", text: "text-[#DB2777]", border: "hover:border-[#DB2777]/30" },
];

interface CategoryDetailClientProps {
  slug: string;
  initialCategory?: Category | null;
}

export function CategoryDetailClient({ slug, initialCategory }: CategoryDetailClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategory ? [initialCategory] : []);
  const [isLoading, setIsLoading] = useState(!initialCategory);

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
        console.error("SubCategoriesPage: Failed to load categories:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const category = categories.find((c) => c.slug === slug || c.id === slug) || initialCategory;

  if (isLoading && !category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-7 h-7 animate-spin text-[#1D1D1F]" />
        <p className="text-xs text-gray-400">იტვირთება მონაცემები...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center p-6">
        <h2 className="text-xl text-gray-900">კატეგორია ვერ მოიძებნა</h2>
        <Link href="/categories" className="text-xs text-[#1D1D1F] underline hover:no-underline">
          ყველა კატეგორიაში დაბრუნება
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1560px] pt-6 md:pt-8">
        
        {/* 1. Breadcrumbs & Header */}
        <div className="pb-8">
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-5">
            <Link href="/" className="hover:text-[#1D1D1F] transition-colors">
              მთავარი
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <Link href="/categories" className="hover:text-[#1D1D1F] transition-colors">
              კატეგორიები
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-900">{category.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center shrink-0 shadow-2xs">
                {getCategoryIcon(category, "w-8 h-8 stroke-[1.8]")}
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-gray-100 text-[#1D1D1F] px-2.5 py-0.5 rounded-full text-[11px]">
                  <Layers className="w-3 h-3 text-gray-500" />
                  <span>კატეგორია</span>
                </div>
                <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight">
                  {category.name}
                </h1>
                <p className="text-xs md:text-sm text-gray-500">
                  აირჩიეთ ქვეკატეგორია ან დაათვალიერეთ ყველა პროდუქტი
                </p>
              </div>
            </div>

            {/* Quick action button to catalog */}
            <Link
              href={`/catalog?category=${category.slug}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#1D1D1F] text-white hover:bg-[#2C2C2E] text-xs md:text-[13px] shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              <span>ყველა პროდუქტი ({category.name})</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 2. Subcategories Grid */}
        <div className="pt-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg text-gray-900">ქვეკატეგორიები</h2>
          <span className="text-xs text-gray-400">
            სულ {category.children?.length || 0} ქვეკატეგორია
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {category.children && category.children.length > 0 ? (
            category.children.map((sub, idx) => {
              const color = colorVariants[idx % colorVariants.length];
              const subItems = sub.items || [];
              const subHref = `/categories/${category.slug}/${sub.slug || sub.id}`;
              const subIcon = getCategoryIcon(sub, "w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]");

              return (
                <div
                  key={sub.id}
                  className={`group p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-white hover:border-[#1D1D1F] hover:shadow-xl hover:shadow-black/5 transition-all duration-200 flex flex-col justify-between select-none ${color.border}`}
                >
                  <div>
                    {/* Top Row: Icon Badge + Subcategory Title + Direct Subpage Arrow */}
                    <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`w-12 h-12 rounded-2xl ${color.bg} ${color.text} flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform`}>
                          {subIcon}
                        </span>
                        <div>
                          <Link
                            href={subHref}
                            className="text-base md:text-lg text-gray-900 hover:text-[#1D1D1F] transition-colors tracking-tight block"
                          >
                            {sub.name}
                          </Link>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {subItems.length > 0
                              ? `${subItems.length} ბრენდი / მოდელი`
                              : sub.productCount ? `${sub.productCount} პროდუქტი` : "დათვალიერება"}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={subHref}
                        title={`${sub.name} - სრულად ნახვა`}
                        className="w-8 h-8 rounded-full bg-gray-100/80 hover:bg-[#1D1D1F] hover:text-white text-gray-500 flex items-center justify-center transition-colors shrink-0"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Interactive Brands / Items Chips List */}
                    {subItems.length > 0 && (
                      <div className="pt-2">
                        <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-hidden">
                          {subItems.map((item: any) => {
                            const brandTarget = item.brandQuery || item.name;
                            const itemHref = `/catalog?category=${category.slug}${brandTarget ? `&brand=${encodeURIComponent(brandTarget)}` : ""}`;
                            const itemIcon = getCategoryIcon(item, "w-3 h-3 stroke-[2] shrink-0 opacity-70");

                            return (
                              <Link
                                key={item.id}
                                href={itemHref}
                                className="text-xs px-2.5 py-1 rounded-xl bg-gray-100/80 hover:bg-[#1D1D1F] text-gray-700 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1.5 border border-gray-200/50 hover:border-[#1D1D1F]"
                              >
                                {itemIcon}
                                <span>{item.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <Link
                      href={subHref}
                      className="text-xs text-gray-900 hover:text-[#1D1D1F] flex items-center gap-1 transition-colors"
                    >
                      <span>ყველა ბრენდი & მოდელი</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href={`/catalog?category=${category.slug}`}
                      className="text-xs text-gray-400 hover:text-[#1D1D1F] transition-colors"
                    >
                      კატალოგი
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center text-xs text-gray-400 bg-white rounded-3xl border border-gray-200/70">
              ქვეკატეგორიები არ არის დამატებული.
            </div>
          )}
        </div>
        </div>

      </div>
    </div>
  );
}
