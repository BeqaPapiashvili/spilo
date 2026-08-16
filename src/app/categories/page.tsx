"use client";

import React, { useState, useEffect } from "react";
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

export default function MainCategoriesPage() {
  const [filterQuery, setFilterQuery] = useState("");
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

  const cleanQuery = filterQuery.trim().toLowerCase();

  const filteredCategories = categories.filter((cat) => {
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
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              მთავარი
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-900">კატეგორიები</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight flex items-center gap-2">
                <span>პროდუქციის კატალოგი</span>
              </h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                აირჩიეთ სასურველი კატეგორია და აღმოაჩინეთ უახლესი ტექნოლოგიები
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="კატეგორიის ძებნა..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600 shadow-2xs"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Grid */}
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl pt-10">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <span>იტვირთება კატეგორიები...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group p-6 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-lg transition-all flex flex-col justify-between h-48"
              >
                <div className="flex items-start justify-between">
                  <div className="text-gray-600 group-hover:text-blue-600 transition-colors">
                    {cat.icon && iconMap[cat.icon] ? iconMap[cat.icon] : <Sparkles className="w-10 h-10" />}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>

                <div>
                  <h3 className="text-base text-gray-900 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {cat.children?.length ? `${cat.children.length} ქვეკატეგორია` : "დათვალიერება"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
