"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCarousel from "@/components/ProductCarousel";
import { ResolvedProductItem } from "@/lib/storefrontFeed";

interface DynamicProductCarouselProps {
  id?: string;
  title?: string | null;
  subtitle?: string | null;
  config?: {
    brand?: string;
    categoryId?: string;
    limit?: number;
    targetLink?: string;
    isFlash?: boolean;
    isFeatured?: boolean;
  } | null;
  products?: ResolvedProductItem[];
}

export default function DynamicProductCarouselSection({
  title,
  subtitle,
  config,
  products = [],
}: DynamicProductCarouselProps) {
  if (!products || products.length === 0) return null;

  const targetLink =
    config?.targetLink ||
    (config?.categoryId
      ? `/catalog?category=${encodeURIComponent(config.categoryId)}`
      : config?.brand
        ? `/catalog?brand=${encodeURIComponent(config.brand)}`
        : "/catalog");

  return (
    <section className="py-2">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl text-gray-900 tracking-tight">
                {title || "პროდუქტების კოლექცია"}
              </h2>
              {config?.isFlash && (
                <span className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded-full border border-red-100">
                  HOT DEALS
                </span>
              )}
              {config?.isFeatured && (
                <span className="bg-gray-100 text-[#1D1D1F] text-[10px] px-2 py-0.5 rounded-full border border-gray-200">
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
            className="flex items-center gap-1 text-xs md:text-sm text-gray-900 hover:text-[#1D1D1F] transition-colors cursor-pointer"
          >
            <span>სრულად ნახვა</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductCarousel products={products} />
      </div>
    </section>
  );
}
