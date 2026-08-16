"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronRight, 
  Sparkles, 
  ArrowLeft,
  Tv,
  Smartphone,
  Laptop,
  Headphones,
  Home,
  Gamepad2,
  Watch,
  Camera,
  Tablet,
  Loader2
} from "lucide-react";
import { Category } from "@/types";

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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function SubCategoriesPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

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

  const category = categories.find((c) => c.slug === slug || c.id === slug);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <p className="text-xs text-gray-400">იტვირთება მონაცემები...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center p-6">
        <h2 className="text-xl text-gray-900">კატეგორია ვერ მოიძებნა</h2>
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
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              მთავარი
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <Link href="/categories" className="hover:text-blue-600 transition-colors">
              კატეგორიები
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-900">{category.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-blue-600 p-3 bg-white border border-gray-200 rounded-2xl shadow-2xs">
              {category.icon && iconMap[category.icon] ? iconMap[category.icon] : <Sparkles className="w-8 h-8" />}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight">
                {category.name}
              </h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                აირჩიეთ ქვეკატეგორია ან დაათვალიერეთ ყველა პროდუქტი
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Subcategories Grid */}
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl pt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg text-gray-900">ქვეკატეგორიები</h2>
          <Link
            href={`/catalog?category=${category.slug}`}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>ყველა პროდუქტის ნახვა ({category.name})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {category.children && category.children.length > 0 ? (
            category.children.map((sub) => (
              <Link
                key={sub.id}
                href={`/categories/${category.slug}/${sub.slug}`}
                className="group p-5 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-lg transition-all flex flex-col justify-between h-40"
              >
                <div className="flex items-start justify-between">
                  <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>

                <div>
                  <h3 className="text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                    {sub.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {sub.items?.length ? `${sub.items.length} ჯგუფი / მოდელი` : "დათვალიერება"}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-xs text-gray-400">
              ქვეკატეგორიები არ არის დამატებული.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
