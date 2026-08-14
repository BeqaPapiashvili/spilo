"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Smartphone, Laptop, Watch, Headphones, Gamepad2, Tv, Camera, Home, Sparkles } from "lucide-react";
import { dataService } from "@/services/dataService";
import { Category } from "@/types";
import { CategoryBarSkeleton } from "@/components/skeletons/CategoryBarSkeleton";

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

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cats = dataService.getCategories();
    setCategories(cats);
    setIsLoading(false);
    const unsub = dataService.subscribe(() => {
      setCategories(dataService.getCategories());
    });
    return () => unsub();
  }, []);

  if (isLoading && categories.length === 0) {
    return <CategoryBarSkeleton />;
  }

  const topCategories = categories.slice(0, 8);

  return (
    <section className="py-4">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl text-gray-900 tracking-tight">
              პოპულარული კატეგორიები
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              დაათვალიერე ტოპ კატეგორიები და იპოვე სასურველი ნივთი
            </p>
          </div>
          <Link
            href="/categories"
            className="flex items-center gap-1 text-xs md:text-sm text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span>ყველა კატეგორია</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
          {topCategories.map((cat) => {
            const IconComponent = cat.icon && iconMap[cat.icon] ? iconMap[cat.icon] : Sparkles;
            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group flex flex-col items-center p-4 bg-[#F8FAFC] hover:bg-blue-50/60 rounded-2xl border border-gray-100/80 hover:border-blue-200 transition-all text-center space-y-2.5 shadow-2xs hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-white text-gray-800 group-hover:text-blue-600 flex items-center justify-center shadow-2xs transition-colors">
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate w-full">
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
