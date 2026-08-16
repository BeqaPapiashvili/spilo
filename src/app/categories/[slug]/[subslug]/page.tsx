"use client";

import React, { use, useState, useEffect } from "react";
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
  Camera,
  Loader2
} from "lucide-react";
import { Category } from "@/types";

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

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <p className="text-xs text-gray-400">იტვირთება მონაცემები...</p>
      </div>
    );
  }

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
      
      {/* 1. Breadcrumbs & Header */}
      <section className="bg-[#F8FAFC] border-b border-gray-100 py-8 md:py-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4 flex-wrap">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              მთავარი
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <Link href="/categories" className="hover:text-blue-600 transition-colors">
              კატეგორიები
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <Link href={`/categories/${category.slug}`} className="hover:text-blue-600 transition-colors">
              {category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-900">{subCategory.name}</span>
          </nav>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight">
                {subCategory.name}
              </h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {category.name} › {subCategory.name} - აირჩიეთ მოდელი ან გადადით კატალოგში
              </p>
            </div>

            <Link
              href={`/catalog?category=${category.slug}`}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <span>კატალოგში ნახვა</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Level 3 Items Grid */}
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl pt-10">
        <h2 className="text-lg text-gray-900 mb-6">მოდელები & ჯგუფები</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {subCategory.items && subCategory.items.length > 0 ? (
            subCategory.items.map((item) => (
              <Link
                key={item.id}
                href={`/catalog?category=${category.slug}${item.brandQuery ? `&brand=${item.brandQuery}` : ""}`}
                className="p-4 rounded-xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-600 group-hover:scale-125 transition-transform" />
                  <span className="text-xs text-gray-800 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-xs text-gray-400">
              ჯგუფები არ არის დამატებული.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
