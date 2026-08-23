"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Mousewheel } from "swiper/modules";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck
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
  { id: "brand-xiaomi", name: "Xiaomi", slug: "xiaomi", logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg", productCount: 120 },
  { id: "brand-asus", name: "ASUS", slug: "asus", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg", productCount: 65 },
  { id: "brand-lenovo", name: "Lenovo", slug: "lenovo", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg", productCount: 75 },
  { id: "brand-jbl", name: "JBL", slug: "jbl", logo: "https://upload.wikimedia.org/wikipedia/commons/9/91/JBL_logo.svg", productCount: 45 },
  { id: "brand-marshall", name: "Marshall", slug: "marshall", logo: "https://upload.wikimedia.org/wikipedia/commons/3/36/Marshall_Amplification_logo.svg", productCount: 30 },
  { id: "brand-dji", name: "DJI", slug: "dji", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/DJI_Logo.svg", productCount: 25 },
  { id: "brand-canon", name: "Canon", slug: "canon", logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Canon_wordmark.svg", productCount: 40 },
  { id: "brand-philips", name: "Philips", slug: "philips", logo: "https://upload.wikimedia.org/wikipedia/commons/5/52/Philips_logo_new.svg", productCount: 50 },
  { id: "brand-dyson", name: "Dyson", slug: "dyson", logo: "https://upload.wikimedia.org/wikipedia/commons/8/87/Dyson_logo.svg", productCount: 20 },
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
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-4 sm:mb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-[#FFF5F2] border border-[#FED7CC] px-2.5 py-0.5 rounded-full text-xs text-[#FF5238]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% ავტორიზებული</span>
            </div>
            <h2 className="text-xl sm:text-2xl text-zinc-900 tracking-tight font-sans">
              {title || "ოფიციალური ბრენდები"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-sans">
              {subtitle || "მსოფლიო დონის მწარმოებლები ოფიციალური გარანტიით"}
            </p>
          </div>
        </div>

        {/* Swiper Track */}
        <div className="w-full relative overflow-hidden">
            
            {/* Left Navigation Arrow */}
            {!isBeginning && (
              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 hover:bg-white text-zinc-800 rounded-full shadow-md border border-zinc-200/80 backdrop-blur-md flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
                aria-label="Previous brands"
              >
                <ChevronLeft size={18} />
              </button>
            )}

            <Swiper
              modules={[Navigation, FreeMode, Mousewheel]}
              spaceBetween={12}
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
              className="w-full py-1"
            >
              {displayBrands.map((brand, idx) => (
                <SwiperSlide key={brand.id || idx} className="!w-[130px] sm:!w-[145px]">
                  <Link
                    href={`/catalog?brand=${encodeURIComponent(brand.slug || brand.name.toLowerCase())}`}
                    className="group w-[130px] sm:w-[145px] h-[155px] sm:h-[165px] bg-white hover:bg-[#FFF5F2] border border-zinc-200/80 hover:border-[#FED7CC] rounded-[22px] p-3.5 flex flex-col justify-between items-center text-center cursor-pointer relative overflow-hidden select-none transition-all duration-200 shadow-2xs hover:shadow-xs block"
                  >
                    {/* Brand Logo Stage */}
                    <div className="w-full flex-1 flex items-center justify-center p-2 rounded-2xl bg-zinc-50/80 group-hover:bg-white border border-zinc-100 group-hover:border-[#FED7CC]/60 transition-all duration-200">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="max-h-8 sm:max-h-9 max-w-[80%] object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                        />
                      ) : (
                        <span className="text-xs text-zinc-800 font-mono">{brand.name}</span>
                      )}
                    </div>

                    {/* Brand Name & Details */}
                    <div className="pt-2 w-full">
                      <h4 className="text-xs sm:text-[13px] text-zinc-900 group-hover:text-[#FF5238] transition-colors leading-tight line-clamp-1">
                        {brand.name}
                      </h4>
                      <span className="text-[10px] text-zinc-400 font-mono block mt-0.5 group-hover:text-[#FF5238]/80 transition-colors">
                        {brand.productCount ? `${brand.productCount} მოდელი` : "ოფიციალური"}
                      </span>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Right Navigation Arrow */}
            {!isEnd && (
              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 hover:bg-white text-zinc-800 rounded-full shadow-md border border-zinc-200/80 backdrop-blur-md flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
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
