"use client";

import Link from "next/link";
import { ArrowRight, Smartphone, Laptop, Watch, Headphones, Gamepad2, Tv, Camera, Home, Sparkles } from "lucide-react";
import { ResolvedCategoryItem } from "@/lib/storefrontFeed";

const iconMap: Record<string, any> = {
  Smartphone,
  Laptop,
  Watch,
  Headphones,
  Gamepad2,
  Tv,
  Camera,
  Home,
  Sparkles,
};

interface FeaturedCategoriesProps {
  title?: string | null;
  subtitle?: string | null;
  categories?: ResolvedCategoryItem[];
  config?: any;
}

export default function FeaturedCategories({
  title,
  subtitle,
  categories = [],
}: FeaturedCategoriesProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-4">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl text-gray-900 tracking-tight">
              {title || "პოპულარული კატეგორიები"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {subtitle || "დაათვალიერე ტოპ კატეგორიები და იპოვე სასურველი ნივთი"}
            </p>
          </div>
          <Link
            href="/categories"
            className="flex items-center gap-1 text-xs md:text-sm text-gray-900 hover:text-[#FF5238] transition-colors cursor-pointer"
          >
            <span>ყველა კატეგორია</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = (cat.icon && iconMap[cat.icon]) ? iconMap[cat.icon] : Sparkles;
            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-[#F8FAFC] hover:bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all text-center gap-2.5 h-28"
              >
                <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-[#FFF5F2] text-gray-700 group-hover:text-[#FF5238] flex items-center justify-center transition-colors shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-800 group-hover:text-[#FF5238] transition-colors line-clamp-1">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
