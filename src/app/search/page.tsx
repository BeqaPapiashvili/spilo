"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  ChevronRight, 
  ChevronDown, 
  ArrowUpDown,
  Check
} from "lucide-react";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  monthlyInstallment?: number;
  image: string;
  sku: string;
  brand: string;
  category: string;
  color: string;
  storage?: string;
  inStock: boolean;
}

const CATALOG_DATABASE: Product[] = [
  {
    id: "dji-neo",
    title: "დრონი DJI Neo Drone Gray",
    price: 799,
    discountPrice: 699,
    discountPercentage: 12,
    monthlyInstallment: 28,
    image: "https://veli.store/media-cdn/__sized__/product/DJI_Neo_Drone-1-thumbnail-200x200-95.jpeg",
    sku: "172122",
    brand: "DJI",
    category: "დრონები",
    color: "ნაცრისფერი",
    inStock: true,
  },
  {
    id: "dji-mini-4",
    title: "დრონი DJI Mini 4 Pro Fly More Combo",
    price: 3899,
    discountPrice: 3299,
    discountPercentage: 15,
    monthlyInstallment: 132,
    image: "https://veli.store/media-cdn/__sized__/product/DJI-ZM700_20250710210650-thumbnail-200x200-95.jpg",
    sku: "172123",
    brand: "DJI",
    category: "დრონები",
    color: "ნაცრისფერი",
    inStock: true,
  },
  {
    id: "dji-pocket-3",
    title: "სტაბილიზატორი DJI Osmo Pocket 3 Creator Combo",
    price: 2499,
    discountPrice: 2199,
    discountPercentage: 12,
    monthlyInstallment: 88,
    image: "https://veli.store/media-cdn/__sized__/product/DJI-ZPK300-C1-8_20250710160051-thumbnail-200x200-95.jpg",
    sku: "172124",
    brand: "DJI",
    category: "სტაბილიზატორები",
    color: "შავი",
    inStock: true,
  },
  {
    id: "dji-osmo-6",
    title: "სმარტფონის სტაბილიზატორი DJI Osmo Mobile 6",
    price: 599,
    discountPrice: 499,
    discountPercentage: 17,
    monthlyInstallment: 20,
    image: "https://veli.store/media-cdn/__sized__/product/DJI_Osmo_Mobile_7P-thumbnail-200x200-95.jpg",
    sku: "172125",
    brand: "DJI",
    category: "სტაბილიზატორები",
    color: "შავი",
    inStock: true,
  },
  {
    id: "dji-rc-n3",
    title: "დისტანციური მართვის პულტი DJI RC-N3 Remote Controller",
    price: 449,
    discountPrice: 379,
    discountPercentage: 15,
    monthlyInstallment: 15,
    image: "https://veli.store/media-cdn/__sized__/product/DJI_RC-N3-1-thumbnail-200x200-95.jpg",
    sku: "172126",
    brand: "DJI",
    category: "აქსესუარები",
    color: "ნაცრისფერი",
    inStock: true,
  },
  {
    id: "iphone-15-pro",
    title: "სმარტფონი Apple iPhone 15 Pro 128GB Natural Titanium",
    price: 3699,
    discountPrice: 3399,
    discountPercentage: 8,
    monthlyInstallment: 135,
    image: "https://veli.store/media-cdn/__sized__/product/DJI-ZM700_20250710210650-thumbnail-200x200-95.jpg",
    sku: "180900",
    brand: "Apple",
    category: "სმარტფონები",
    color: "ნაცრისფერი",
    storage: "128GB",
    inStock: true,
  },
  {
    id: "samsung-s24-ultra",
    title: "სმარტფონი Samsung Galaxy S24 Ultra 512GB Titanium Black",
    price: 4299,
    discountPrice: 3899,
    discountPercentage: 9,
    monthlyInstallment: 155,
    image: "https://veli.store/media-cdn/__sized__/product/DJI-ZPK300-C1-8_20250710160051-thumbnail-200x200-95.jpg",
    sku: "180901",
    brand: "Samsung",
    category: "სმარტფონები",
    color: "შავი",
    storage: "512GB",
    inStock: true,
  },
  {
    id: "xiaomi-14-ultra",
    title: "სმარტფონი Xiaomi 14 Ultra 512GB Black",
    price: 3199,
    discountPrice: 2899,
    discountPercentage: 9,
    monthlyInstallment: 115,
    image: "https://veli.store/media-cdn/__sized__/product/DJI_Osmo_Mobile_7P-thumbnail-200x200-95.jpg",
    sku: "180902",
    brand: "Xiaomi",
    category: "სმარტფონები",
    color: "შავი",
    storage: "512GB",
    inStock: true,
  },
];

type SortOption = "default" | "all" | "price-desc" | "price-asc" | "name-asc" | "name-desc";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const cleanQuery = query.trim().toLowerCase();

  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Search Results Matching Logic
  const filteredProducts = useMemo(() => {
    return CATALOG_DATABASE.filter(product => {
      if (!cleanQuery) return true;

      return (
        product.title.toLowerCase().includes(cleanQuery) ||
        product.sku.toLowerCase().includes(cleanQuery) ||
        product.category.toLowerCase().includes(cleanQuery) ||
        product.brand.toLowerCase().includes(cleanQuery)
      );
    }).sort((a, b) => {
      const priceA = a.discountPrice || a.price;
      const priceB = b.discountPrice || b.price;
      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "name-asc") return a.title.localeCompare(b.title, "ka");
      if (sortBy === "name-desc") return b.title.localeCompare(a.title, "ka");
      return 0;
    });
  }, [cleanQuery, sortBy]);

  return (
    <div className="container mx-auto px-4 lg:px-6 max-w-[1600px] space-y-8">
      
      {/* Top Search Results Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200/80">
        <div>
          <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight flex items-center gap-2">
            <span>{query ? `ძიების შედეგები: "${query}"` : "ძიება"}</span>
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            სულ მოიძებნა <span className="text-gray-900">{filteredProducts.length}</span> პროდუქტი
          </p>
        </div>

        {/* Sort Menu */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              onBlur={() => setTimeout(() => setIsSortDropdownOpen(false), 200)}
              className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl text-xs text-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.015)] cursor-pointer select-none border border-transparent hover:border-gray-200/60 transition-all"
            >
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900">
                {sortBy === "default" && "სორტირება"}
                {sortBy === "all" && "ყველა"}
                {sortBy === "price-desc" && "ფასი: კლებადობით"}
                {sortBy === "price-asc" && "ფასი: ზრდადობით"}
                {sortBy === "name-asc" && "დასახელება: A-Z"}
                {sortBy === "name-desc" && "დასახელება: Z-A"}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 ml-0.5 transition-transform duration-200 ${isSortDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isSortDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 min-w-[200px] z-30 space-y-0.5">
                {[
                  { id: "all", label: "ყველა" },
                  { id: "price-desc", label: "ფასი: კლებადობით" },
                  { id: "price-asc", label: "ფასი: ზრდადობით" },
                  { id: "name-asc", label: "დასახელება: A-Z" },
                  { id: "name-desc", label: "დასახელება: Z-A" },
                ].map((opt) => {
                  const isSelected = sortBy === opt.id;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setSortBy(opt.id as any);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-3.5 py-2 text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50/80 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clean Full-Width Search Results Grid (No Filter Sidebar) */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.015)] my-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-lg md:text-xl text-gray-900">
            საძიებო სიტყვით ნივთი ვერ მოიძებნა
          </h2>
          <p className="text-xs md:text-sm text-gray-500">
            სცადეთ სხვა სიტყვის ან პროდუქტის კოდის მითითება.
          </p>
        </div>
      )}

    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans pb-24">
      
      {/* Top Breadcrumbs */}
      <div className="py-3.5 bg-white border-b border-gray-100 mb-8">
        <div className="container mx-auto px-4 lg:px-6 max-w-[1600px]">
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
        <Suspense fallback={
          <div className="container mx-auto px-4 py-12 text-center text-gray-400 text-sm">
            იტვირთება ძიების შედეგები...
          </div>
        }>
          <SearchContent />
        </Suspense>
      </main>
    </div>
  );
}
