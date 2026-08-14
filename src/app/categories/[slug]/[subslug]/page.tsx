"use client";

import React, { use } from "react";
import Link from "next/link";
import { 
  ChevronRight, 
  Sparkles, 
  ArrowLeft,
  ArrowRight,
  Tv,
  Smartphone,
  Laptop,
  Headphones,
  Home,
  Gamepad2,
  Watch,
  Camera
} from "lucide-react";
import { CATEGORIES_DATA } from "@/data/categories";

const iconMap: Record<string, React.ReactNode> = {
  Camera: <Camera className="w-12 h-12 stroke-[1.6]" />,
  Smartphone: <Smartphone className="w-12 h-12 stroke-[1.6]" />,
  Laptop: <Laptop className="w-12 h-12 stroke-[1.6]" />,
  Headphones: <Headphones className="w-12 h-12 stroke-[1.6]" />,
  Home: <Home className="w-12 h-12 stroke-[1.6]" />,
  Tv: <Tv className="w-12 h-12 stroke-[1.6]" />,
  Gamepad2: <Gamepad2 className="w-12 h-12 stroke-[1.6]" />,
  Watch: <Watch className="w-12 h-12 stroke-[1.6]" />,
};

interface PageProps {
  params: Promise<{ slug: string; subslug: string }>;
}

export default function DeepSubCategoryItemsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { slug, subslug } = resolvedParams;

  const category = CATEGORIES_DATA.find((c) => c.slug === slug || c.id === slug);
  const subCategory = category?.children?.find((s) => s.slug === subslug || s.id === subslug);

  if (!category || !subCategory) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center p-6">
        <h2 className="text-xl text-gray-900">სუბკატეგორია ვერ მოიძებნა</h2>
        <Link href="/categories" className="text-sm text-blue-600 hover:underline">
          ყველა კატეგორიაში დაბრუნება
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      
      {/* 1. Header Banner */}
      <section className="bg-[#F8FAFC] border-b border-gray-100 py-8 md:py-10">
        <div className="container mx-auto px-4 lg:px-8 space-y-3">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
            <Link href="/" className="hover:text-blue-600 transition-colors">მთავარი</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href="/categories" className="hover:text-blue-600 transition-colors">ყველა კატეგორია</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href={`/categories/${category.slug}`} className="hover:text-blue-600 transition-colors">{category.name}</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900">{subCategory.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link 
                href={`/categories/${category.slug}`} 
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 mb-2 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>უკან {category.name}-ში</span>
              </Link>
              <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight">
                {subCategory.name}
              </h1>
            </div>

            <Link
              href={`/catalog?category=${subCategory.slug}`}
              className="inline-flex items-center gap-2 bg-[#111111] hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-colors self-start sm:self-auto cursor-pointer"
            >
              <span>{subCategory.name} — სრული კატალოგი</span>
            </Link>
          </div>

        </div>
      </section>

      {/* 2. Level-3 Deep Items / Brands Cards Grid */}
      <section className="pt-8">
        <div className="container mx-auto px-4 lg:px-8 space-y-10">
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {subCategory.items ? (
              subCategory.items.map((item) => {
                const href = `/catalog?category=${item.slug}${item.brandQuery ? `&brand=${item.brandQuery}` : ""}`;

                return (
                  <Link
                    key={item.id}
                    href={href}
                    className="w-full h-[160px] bg-[#EAECEF] hover:bg-[#E2E5EA] rounded-xl p-3.5 flex flex-col justify-between items-start cursor-pointer relative overflow-hidden select-none transition-all group block text-left"
                  >
                    <div className="z-10 space-y-1">
                      <h4 className="text-xs sm:text-sm text-[#111111] group-hover:text-blue-600 transition-colors leading-tight pt-0.5 z-10 text-left">
                        {item.name}
                      </h4>
                      {item.productCount ? (
                        <span className="text-[11px] text-gray-500 block">
                          {item.productCount} პროდუქტი
                        </span>
                      ) : null}
                    </div>

                    <div className="absolute bottom-1.5 right-1.5 w-14 h-14 flex items-end justify-end pointer-events-none opacity-40 text-black">
                      {category.icon && iconMap[category.icon] ? iconMap[category.icon] : <Sparkles className="w-12 h-12 stroke-[1.6]" />}
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-gray-500 text-sm">
                ამ სუბკატეგორიაში პროდუქტები მალე დაემატება
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
