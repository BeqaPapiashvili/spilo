"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronRight, ArrowUpDown } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { ProductGridSkeleton } from "@/components/skeletons/ProductGridSkeleton";
import { useCatalogFilters } from "@/hooks/useCatalogFilters";

function SearchContent() {
  const { filters, setSort } = useCatalogFilters();
  const query = filters.searchQuery;

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchSearchResults = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (query.trim()) {
          queryParams.set("q", query.trim());
        }
        if (filters.sort && filters.sort !== "default") {
          queryParams.set("sort", filters.sort);
        }

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        const json = await res.json();

        if (isMounted) {
          if (json.success && Array.isArray(json.data)) {
            setProductsList(json.data);
          } else {
            setProductsList([]);
          }
        }
      } catch (err) {
        console.error("SearchContent: fetch error:", err);
        if (isMounted) setProductsList([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSearchResults();

    return () => {
      isMounted = false;
    };
  }, [query, filters.sort]);

  return (
    <div className="container mx-auto px-4 lg:px-8 max-w-[1560px] space-y-8">
      {/* Top Search Results Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight flex items-center gap-2">
            <span>{query ? `ძიების შედეგები: "${query}"` : "ძიება"}</span>
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            სულ მოიძებნა <span className="text-gray-900">{productsList.length}</span> პროდუქტი
          </p>
        </div>

        {/* Sort Menu */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-10 shadow-2xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={filters.sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent text-xs text-gray-800 focus:outline-none cursor-pointer"
          >
            <option value="default">პოპულარობით</option>
            <option value="price-asc">ფასით: ზრდადი</option>
            <option value="price-desc">ფასით: კლებადი</option>
            <option value="rating">რეიტინგით</option>
            <option value="discount">ფასდაკლებით</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : productsList.length > 0 ? (
        /* Search Results Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {productsList.map((product) => {
            const prodImg = product.images?.[0] || product.image || "";
            return (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                discountPrice={product.discountPrice}
                monthlyInstallment={product.monthlyInstallment}
                image={prodImg}
                discountPercentage={product.discountPercentage}
                stock={product.stock}
              />
            );
          })}
        </div>
      ) : (
        /* Empty Search Result */
        <div className="bg-white rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-2xs my-8 border border-gray-100">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-lg md:text-xl text-gray-900">
            საძიებო სიტყვით ნივთი ვერ მოიძებნა
          </h2>
          <p className="text-xs text-gray-500">
            სცადეთ სხვა სიტყვის ან პროდუქტის კოდის მითითება.
          </p>
          <Link
            href="/catalog"
            className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs hover:bg-blue-700 transition-colors"
          >
            კატალოგის დათვალიერება
          </Link>
        </div>
      )}
    </div>
  );
}

export function SearchClient() {
  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 font-sans pb-24">
      {/* Top Breadcrumbs */}
      <div className="py-3.5 bg-white border-b border-gray-100 mb-8">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              მთავარი
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-900">ძიების შედეგები</span>
          </nav>
        </div>
      </div>

      <main>
        <Suspense
          fallback={
            <div className="container mx-auto px-4 py-12 text-center text-gray-400 text-sm">
              იტვირთება ძიების შედეგები...
            </div>
          }
        >
          <SearchContent />
        </Suspense>
      </main>
    </div>
  );
}
