"use client";

import React from "react";
import PromoCarousel from "@/components/PromoCarousel";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PromoBannersSectionProps {
  title?: string | null;
  subtitle?: string | null;
  config?: any;
}

export default function PromoBannersSection({}: PromoBannersSectionProps = {}) {
  return (
    <div className="space-y-10 md:space-y-14">
      {/* 1. Top Promo Banner Swiper */}
      <PromoCarousel />

      {/* 2. FULL-WIDTH PANORAMIC BANNER 1: Apple iPhone 16 Pro Series */}
      <section className="py-2 select-none">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
          <div className="group relative rounded-[28px] sm:rounded-[36px] overflow-hidden min-h-[260px] sm:min-h-[300px] md:min-h-[340px] flex items-center p-6 sm:p-10 md:p-14 bg-[#09090b] text-white shadow-md">
            
            {/* High-Resolution Right-Aligned Product Visual */}
            <img
              src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1600&q=85"
              alt="iPhone 16 Pro Series"
              className="absolute inset-0 w-full h-full object-cover object-right sm:object-right group-hover:scale-[1.03] transition-transform duration-700 ease-out opacity-70 sm:opacity-85"
            />
            
            {/* Smooth Left-to-Right Gradients for Clean Typography Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/90 sm:via-[#09090b]/75 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/80 via-transparent to-transparent sm:hidden" />

            {/* Left Content Area */}
            <div className="relative z-10 max-w-lg space-y-2.5 sm:space-y-3.5">
              <span className="text-[11px] sm:text-xs text-[#FF5238] tracking-widest uppercase font-sans">
                Apple Flagship
              </span>

              <h3 className="text-2xl sm:text-3xl md:text-4xl text-white tracking-tight font-sans leading-tight">
                iPhone 16 Pro Series
              </h3>

              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed max-w-md">
                ტიტანის კორპუსი, A18 Pro ჩიპი და ინოვაციური კამერის მართვა. 0%-იანი ონლაინ განვადებით.
              </p>

              <div className="pt-2 sm:pt-3 flex items-center gap-4 flex-wrap">
                <Link
                  href="/catalog?brand=apple"
                  className="inline-flex items-center gap-2 bg-[#FF5238] hover:bg-[#EA3A20] text-white px-6 sm:px-7 py-3 rounded-full text-xs sm:text-sm shadow-md shadow-[#FF5238]/25 hover:shadow-lg hover:shadow-[#FF5238]/35 transition-all duration-200 active:scale-[0.98] cursor-pointer group/btn"
                >
                  <span>შეძენა</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>

                <span className="text-xs text-zinc-400 font-mono">
                  თვეში <span className="text-white">₾115</span>-დან
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FULL-WIDTH PANORAMIC BANNER 2: PlayStation 5 Gaming Banner */}
      <section className="py-2 select-none">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
          <div className="group relative rounded-[28px] sm:rounded-[36px] overflow-hidden min-h-[260px] sm:min-h-[300px] md:min-h-[340px] flex items-center p-6 sm:p-10 md:p-14 bg-[#080c16] text-white shadow-md">
            
            {/* High-Resolution Right-Aligned Product Visual */}
            <img
              src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600&q=85"
              alt="PlayStation 5 Slim & DualSense"
              className="absolute inset-0 w-full h-full object-cover object-right sm:object-right group-hover:scale-[1.03] transition-transform duration-700 ease-out opacity-70 sm:opacity-85"
            />
            
            {/* Smooth Left-to-Right Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#080c16] via-[#080c16]/90 sm:via-[#080c16]/75 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080c16]/80 via-transparent to-transparent sm:hidden" />

            {/* Left Content Area */}
            <div className="relative z-10 max-w-lg space-y-2.5 sm:space-y-3.5">
              <span className="text-[11px] sm:text-xs text-[#FF5238] tracking-widest uppercase font-sans">
                Next-Gen Gaming
              </span>

              <h3 className="text-2xl sm:text-3xl md:text-4xl text-white tracking-tight font-sans leading-tight">
                PlayStation 5 Slim & DualSense
              </h3>

              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed max-w-md">
                ჩაერთე გეიმინგის ახალ ეპოქაში. 4K 120Hz გრაფიკა და ულტრა-სწრაფი SSD.
              </p>

              <div className="pt-2 sm:pt-3 flex items-center gap-4 flex-wrap">
                <Link
                  href="/catalog?category=gaming"
                  className="inline-flex items-center gap-2 bg-[#FF5238] hover:bg-[#EA3A20] text-white px-6 sm:px-7 py-3 rounded-full text-xs sm:text-sm shadow-md shadow-[#FF5238]/25 hover:shadow-lg hover:shadow-[#FF5238]/35 transition-all duration-200 active:scale-[0.98] cursor-pointer group/btn"
                >
                  <span>კონსოლების ნახვა</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>

                <span className="text-xs text-zinc-400 font-mono">
                  თვეში <span className="text-white">₾65</span>-დან
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
