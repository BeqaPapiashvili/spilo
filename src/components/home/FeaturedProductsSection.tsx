"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCarousel from "@/components/ProductCarousel";
import { Product } from "@/types";
import { ProductGridSkeleton } from "@/components/skeletons/ProductGridSkeleton";

interface FeaturedProductsSectionProps {
  title?: string | null;
  subtitle?: string | null;
  config?: {
    limit?: number;
    categoryId?: string;
  } | null;
}

export default function FeaturedProductsSection({
  title,
  subtitle,
  config,
}: FeaturedProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchFeaturedProducts = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (config?.categoryId) {
          queryParams.set("category", config.categoryId);
        } else {
          queryParams.set("featured", "true");
        }

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        const json = await res.json();

        if (isMounted) {
          if (json.success && Array.isArray(json.data)) {
            setProducts(json.data);
          } else {
            setProducts([]);
          }
        }
      } catch (err) {
        console.error("FeaturedProductsSection: fetch error:", err);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
    return () => {
      isMounted = false;
    };
  }, [config?.categoryId]);

  const formatForCarousel = (items: Product[]) =>
    items.map((p) => ({
      ...p,
      image: p.image || (p.images && p.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    }));

  const limit = config?.limit || 8;
  const displayList = formatForCarousel(products.slice(0, limit));

  if (isLoading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProductGridSkeleton count={4} />
      </div>
    );
  }

  // If no products match the featured criteria, cleanly hide the section
  if (displayList.length === 0) return null;

  return (
    <section className="py-4">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl text-slate-900 leading-tight">
                {title || "რჩეული პროდუქტები"}
              </h2>
              {subtitle && (
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <Link
            href="/catalog"
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>ყველას ნახვა</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProductCarousel products={displayList} />
      </div>
    </section>
  );
}
