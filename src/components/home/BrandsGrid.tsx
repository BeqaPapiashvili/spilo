"use client";

import Link from "next/link";
import { ResolvedBrandItem } from "@/lib/storefrontFeed";

interface BrandsGridProps {
  title?: string | null;
  subtitle?: string | null;
  brands?: ResolvedBrandItem[];
  config?: any;
}

export default function BrandsGrid({
  title,
  subtitle,
  brands = [],
}: BrandsGridProps) {
  if (!brands || brands.length === 0) return null;

  return (
    <section className="py-4">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl md:text-2xl text-gray-900 tracking-tight">
              {title || "ოფიციალური ბრენდები"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {subtitle || "მსოფლიო დონის მწარმოებლები ოფიციალური გარანტიით"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/catalog?brand=${encodeURIComponent(brand.slug || brand.name.toLowerCase())}`}
              className="group flex flex-col items-center justify-center p-3 md:p-4 bg-[#F8FAFC] hover:bg-white rounded-2xl border border-gray-100/80 hover:border-gray-200 hover:shadow-md transition-all h-20 md:h-24"
            >
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-8 md:max-h-10 max-w-[80%] object-contain filter grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100"
                />
              ) : (
                <span className="text-xs text-gray-700">{brand.name}</span>
              )}
              <span className="text-[11px] text-gray-500 mt-1 group-hover:text-gray-900 transition-colors truncate">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
