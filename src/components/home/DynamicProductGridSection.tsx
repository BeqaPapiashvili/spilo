"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { ResolvedProductItem } from "@/lib/storefrontFeed";

interface DynamicProductGridProps {
  id?: string;
  title?: string | null;
  subtitle?: string | null;
  config?: {
    brand?: string;
    categoryId?: string;
    limit?: number;
    targetLink?: string;
    columns?: number;
    isFlash?: boolean;
    isFeatured?: boolean;
  } | null;
  products?: ResolvedProductItem[];
}

export default function DynamicProductGridSection({
  title,
  subtitle,
  config,
  products = [],
}: DynamicProductGridProps) {
  if (!products || products.length === 0) return null;

  const targetLink =
    config?.targetLink ||
    (config?.categoryId
      ? `/catalog?category=${encodeURIComponent(config.categoryId)}`
      : config?.brand
        ? `/catalog?brand=${encodeURIComponent(config.brand)}`
        : "/catalog");

  const columns = config?.columns || 4;

  const gridClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : columns === 5
          ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
          : columns === 6
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <section className="py-2">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl md:text-2xl text-gray-900 tracking-tight">
                {title || "პროდუქტების კატალოგი"}
              </h2>
              {config?.isFlash && (
                <span className="bg-red-50 text-red-600 border border-red-200/80 text-[10px] px-2.5 py-0.5 rounded-full">
                  HOT DEALS
                </span>
              )}
              {config?.isFeatured && (
                <span className="bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] text-[10px] px-2.5 py-0.5 rounded-full">
                  FEATURED
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          
          <Link
            href={targetLink}
            className="flex items-center gap-1.5 text-xs md:text-sm text-gray-600 hover:text-[#FF5238] transition-colors cursor-pointer"
          >
            <span>სრულად ნახვა</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className={`grid ${gridClass} gap-4`}>
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
