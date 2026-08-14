"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ChevronRight, ArrowUpDown, Check } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS_DATA } from "@/data/products";

type SortOption = "default" | "price-desc" | "price-asc" | "rating";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const cleanQuery = query.trim().toLowerCase();

  const [sortBy, setSortBy] = useState<SortOption>("default");

  // Search Results Matching Logic
  const filteredProducts = useMemo(() => {
    return PRODUCTS_DATA.filter((product) => {
      if (!cleanQuery) return true;

      return (
        product.title.toLowerCase().includes(cleanQuery) ||
        product.sku.toLowerCase().includes(cleanQuery) ||
        product.categoryName.toLowerCase().includes(cleanQuery) ||
        product.brandName.toLowerCase().includes(cleanQuery)
      );
    }).sort((a, b) => {
      const priceA = a.discountPrice || a.price;
      const priceB = b.discountPrice || b.price;
      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [cleanQuery, sortBy]);

  return (
    <div className="container mx-auto px-4 lg:px-8 max-w-7xl space-y-8">
      {/* Top Search Results Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight flex items-center gap-2">
            <span>{query ? `ძიების შედეგები: "${query}"` : "ძიება"}</span>
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            სულ მოიძებნა <span className="text-gray-900">{filteredProducts.length}</span> პროდუქტი
          </p>
        </div>

        {/* Sort Menu */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 h-10 shadow-2xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-xs text-gray-800 focus:outline-none cursor-pointer"
          >
            <option value="default">პოპულარობით</option>
            <option value="price-asc">ფასით: ზრდადი</option>
            <option value="price-desc">ფასით: კლებადი</option>
            <option value="rating">რეიტინგით</option>
          </select>
        </div>
      </div>

      {/* Search Results Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              discountPrice={product.discountPrice}
              monthlyInstallment={product.monthlyInstallment}
              image={product.images[0]}
              discountPercentage={product.discountPercentage}
            />
          ))}
        </div>
      ) : (
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

export default function SearchResultsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 font-sans pb-24">
      {/* Top Breadcrumbs */}
      <div className="py-3.5 bg-white border-b border-gray-100 mb-8">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
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
