"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronRight, 
  Search,
  Loader2,
  ArrowUpRight,
  Layers,
  ShoppingBag
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

interface PageProps {
  params: Promise<{ slug: string; subslug: string }>;
}

export default function DeepSubCategoryItemsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { slug, subslug } = resolvedParams;

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");

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
        console.error("DeepSubCategoryItemsPage: Failed to load categories:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const category = categories.find((c) => c.slug === slug || c.id === slug);
  const subCategory = category?.children?.find((s) => s.slug === subslug || s.id === subslug);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-7 h-7 animate-spin text-[#1D1D1F]" />
        <p className="text-xs text-gray-400">იტვირთება ბრენდები & მოდელები...</p>
      </div>
    );
  }

  if (!category || !subCategory) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center p-6">
        <h2 className="text-xl text-gray-900">ქვეკატეგორია ვერ მოიძებნა</h2>
        <Link href="/categories" className="text-xs text-[#1D1D1F] underline hover:no-underline">
          ყველა კატეგორიაში დაბრუნება
        </Link>
      </div>
    );
  }

  const items = subCategory.items || [];
  const filteredItems = items.filter((item: any) =>
    item.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1560px] pt-6 md:pt-8">
        
        {/* 1. Breadcrumbs & Header */}
        <div className="pb-8">
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-5 flex-wrap">
            <Link href="/" className="hover:text-[#1D1D1F] transition-colors">
              მთავარი
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <Link href="/categories" className="hover:text-[#1D1D1F] transition-colors">
              კატეგორიები
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <Link href={`/categories/${category.slug}`} className="hover:text-[#1D1D1F] transition-colors">
              {category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-900">{subCategory.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-gray-100 text-[#1D1D1F] px-3 py-1 rounded-full text-xs">
                <Layers className="w-3.5 h-3.5 text-gray-600" />
                <span>{category.name} › {subCategory.name}</span>
              </div>
              <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight">
                {subCategory.name}
              </h1>
              <p className="text-xs md:text-sm text-gray-500">
                სულ {items.length} ბრენდი & მოდელი ხელმისაწვდომია
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Quick Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ძებნა ჩამონათვალში..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full h-11 bg-white border-2 border-gray-200 rounded-full pl-10 pr-4 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1D1D1F] shadow-2xs transition-all"
                />
              </div>

              {/* View all in catalog */}
              <Link
                href={`/catalog?category=${category.slug}`}
                className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-full bg-[#1D1D1F] text-white hover:bg-[#2C2C2E] text-xs shadow-2xs transition-colors shrink-0 cursor-pointer"
              >
                <span>სრული კატალოგი</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Level 3 Items / Brands Grid */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg text-gray-900">ბრენდები & მოდელები</h2>
            <span className="text-xs text-gray-400">
              {filteredItems.length} შედეგი
            </span>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredItems.map((item: any, idx: number) => {
                const color = colorVariants[idx % colorVariants.length];
                const brandTarget = item.brandQuery || item.name;
                const itemHref = `/catalog?category=${category.slug}${brandTarget ? `&brand=${encodeURIComponent(brandTarget)}` : ""}`;
                const itemIcon = getCategoryIcon(item, "w-6 h-6 stroke-[1.8]");

                return (
                  <Link
                    key={item.id}
                    href={itemHref}
                    className={`group p-5 rounded-3xl border border-gray-200/80 bg-white hover:border-[#1D1D1F] hover:shadow-xl hover:shadow-black/5 transition-all duration-200 flex items-center justify-between select-none ${color.border}`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl ${color.bg} ${color.text} flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0`}>
                        {itemIcon}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm md:text-base text-gray-900 group-hover:text-[#1D1D1F] transition-colors truncate tracking-tight">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.productCount ? `${item.productCount} პროდუქტი` : "პროდუქციის ნახვა"}
                        </p>
                      </div>
                    </div>

                    <span className="w-8 h-8 rounded-full bg-gray-100/80 group-hover:bg-[#1D1D1F] group-hover:text-white text-gray-500 flex items-center justify-center transition-colors shrink-0 ml-2">
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-gray-200/70">
              <p className="text-sm text-gray-500">მოდელი ვერ მოიძებნა</p>
              {filterQuery && (
                <button
                  onClick={() => setFilterQuery("")}
                  className="text-xs text-[#1D1D1F] underline hover:no-underline cursor-pointer"
                >
                  ფილტრის გასუფთავება
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
