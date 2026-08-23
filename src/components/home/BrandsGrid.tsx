"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Mousewheel } from "swiper/modules";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import { ResolvedBrandItem } from "@/lib/storefrontFeed";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

interface BrandsGridProps {
  title?: string | null;
  subtitle?: string | null;
  brands?: ResolvedBrandItem[];
  config?: any;
}

const DEFAULT_FALLBACK_BRANDS: ResolvedBrandItem[] = [
  { id: "brand-apple", name: "Apple", slug: "apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", productCount: 150 },
  { id: "brand-samsung", name: "Samsung", slug: "samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg", productCount: 190 },
  { id: "brand-sony", name: "Sony", slug: "sony", logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg", productCount: 85 },
  { id: "brand-dji", name: "DJI", slug: "dji", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/DJI_Logo.svg", productCount: 25 },
  { id: "brand-marshall", name: "Marshall", slug: "marshall", logo: "https://upload.wikimedia.org/wikipedia/commons/3/36/Marshall_Amplification_logo.svg", productCount: 30 },
  { id: "brand-jbl", name: "JBL", slug: "jbl", logo: "https://upload.wikimedia.org/wikipedia/commons/9/91/JBL_logo.svg", productCount: 45 },
  { id: "brand-asus", name: "ASUS", slug: "asus", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg", productCount: 65 },
  { id: "brand-xiaomi", name: "Xiaomi", slug: "xiaomi", logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg", productCount: 120 },
  { id: "brand-dyson", name: "Dyson", slug: "dyson", logo: "https://upload.wikimedia.org/wikipedia/commons/8/87/Dyson_logo.svg", productCount: 20 },
  { id: "brand-canon", name: "Canon", slug: "canon", logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Canon_wordmark.svg", productCount: 40 },
  { id: "brand-lenovo", name: "Lenovo", slug: "lenovo", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg", productCount: 75 },
  { id: "brand-philips", name: "Philips", slug: "philips", logo: "https://upload.wikimedia.org/wikipedia/commons/5/52/Philips_logo_new.svg", productCount: 50 },
];

export default function BrandsGrid({
  title,
  subtitle,
  brands = [],
  config,
}: BrandsGridProps) {
  const displayBrands = brands && brands.length > 0 ? brands : DEFAULT_FALLBACK_BRANDS;
  const swiperRef = useRef<any>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  return (
    <section className="w-full py-6 sm:py-8 relative select-none">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
        
        {/* Clean Architectural Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl md:text-2xl text-zinc-900 tracking-tight font-sans">
              {title || "ოფიციალური ბრენდები"}
            </h2>
            <span className="text-[11px] text-zinc-400 font-mono bg-zinc-100 px-2.5 py-0.5 rounded-full">
              {displayBrands.length} ბრენდი
            </span>
          </div>

          <p className="hidden md:block text-xs text-zinc-400 font-sans">
            {subtitle || "მსოფლიო დონის ტექნოლოგიური მწარმოებლები"}
          </p>
        </div>

        {/* Brand Showcase Ribbon */}
        <div className="w-full relative overflow-hidden group/track">
          
          {/* Left Navigation Arrow */}
          {!isBeginning && (
            <button
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 bg-white/95 hover:bg-white text-zinc-800 rounded-full shadow-md border border-zinc-200/80 backdrop-blur-md flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
              aria-label="Previous brands"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          <Swiper
            modules={[Navigation, FreeMode, Mousewheel]}
            spaceBetween={14}
            slidesPerView="auto"
            freeMode={true}
            grabCursor={true}
            mousewheel={{ forceToAxis: true }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            onSlideChange={(swiper) => {
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            className="w-full py-2"
          >
            {displayBrands.map((brand, idx) => (
              <SwiperSlide key={brand.id || idx} className="!w-[160px] sm:!w-[185px]">
                <Link
                  href={`/catalog?brand=${encodeURIComponent(brand.slug || brand.name.toLowerCase())}`}
                  className="group relative flex items-center justify-center w-[160px] sm:!w-[185px] h-[76px] sm:h-[84px] px-6 py-4 bg-white hover:bg-[#111111] rounded-[20px] border border-zinc-200/80 hover:border-[#111111] shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden block"
                >
                  {/* Subtle Top-Right Explore Indicator on Hover */}
                  <div className="absolute top-2.5 right-2.5 text-[#FF5238] opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0">
                    <ArrowUpRight size={14} />
                  </div>

                  {/* Brand Logo or Typographic Wordmark */}
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="max-h-7 sm:max-h-8 max-w-[110px] sm:max-w-[125px] object-contain filter grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 group-hover:brightness-0 group-hover:invert transition-all duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-xs sm:text-sm text-zinc-800 group-hover:text-white font-sans tracking-wide transition-colors">
                      {brand.name}
                    </span>
                  )}
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Right Navigation Arrow */}
          {!isEnd && (
            <button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 bg-white/95 hover:bg-white text-zinc-800 rounded-full shadow-md border border-zinc-200/80 backdrop-blur-md flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
              aria-label="Next brands"
            >
              <ChevronRight size={18} />
            </button>
          )}

        </div>
      </div>
    </section>
  );
}
