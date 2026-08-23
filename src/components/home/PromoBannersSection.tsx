"use client";

import React from "react";
import PromoCarousel from "@/components/PromoCarousel";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, ShieldCheck } from "lucide-react";

interface PromoBannersSectionProps {
  title?: string | null;
  subtitle?: string | null;
  config?: any;
}

export default function PromoBannersSection({}: PromoBannersSectionProps = {}) {
  return (
    <div className="space-y-12 md:space-y-16">
      {/* 1. Promo Banner Swiper */}
      <PromoCarousel />

      {/* 2. FULL-WIDTH FLAGSHIP BANNER 1: Apple iPhone 16 Pro Series */}
      <section className="py-2 select-none">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
          <div className="group relative rounded-[32px] sm:rounded-[36px] overflow-hidden min-h-[320px] sm:min-h-[360px] md:min-h-[380px] flex items-center p-6 sm:p-10 md:p-14 bg-[#09090b] text-white shadow-xl">
            
            {/* Background Image with Cinematic Depth */}
            <img
              src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1600&q=85"
              alt="iPhone 16 Pro Series"
              className="absolute inset-0 w-full h-full object-cover object-center sm:object-right group-hover:scale-105 transition-transform duration-700 ease-out opacity-60 sm:opacity-75"
            />
            
            {/* Deep Contrast Multi-Layer Gradients for Razor-Sharp Legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 sm:via-[#09090b]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/90 via-transparent to-black/30" />
            
            {/* Subtle Brand Lighting Glow */}
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#FF5238]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Foreground Content */}
            <div className="relative z-10 max-w-xl space-y-3.5 sm:space-y-4">
              
              {/* Badge Pill */}
              <div className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/20 backdrop-blur-md border border-white/20 px-3.5 py-1 rounded-full text-xs text-white shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#FF5238]" />
                <span className="font-sans">Apple Official Flagship</span>
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-4xl md:text-[42px] leading-[1.12] tracking-tight text-white font-sans">
                iPhone 16 Pro Series
              </h3>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed font-sans max-w-lg">
                ტიტანის კორპუსი, A18 Pro ჩიპი და ინოვაციური კამერის მართვა. 0%-იანი ონლაინ განვადებით.
              </p>

              {/* Tech Specs Micro-Chips */}
              <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] text-zinc-300">
                <span className="bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg">
                  ⚡ A18 Pro Chip
                </span>
                <span className="bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg">
                  📸 48MP Fusion
                </span>
                <span className="bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg">
                  🛡️ Grade 5 Titanium
                </span>
              </div>

              {/* Action Area */}
              <div className="pt-2 sm:pt-3 flex items-center gap-3 flex-wrap">
                <Link
                  href="/catalog?brand=apple"
                  className="inline-flex items-center gap-2 bg-[#FF5238] hover:bg-[#EA3A20] text-white px-7 py-3.5 rounded-2xl text-xs sm:text-sm shadow-lg shadow-[#FF5238]/30 hover:shadow-[#FF5238]/45 transition-all duration-200 active:scale-[0.98] cursor-pointer group/btn"
                >
                  <span>შეთავაზების ნახვა</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>

                <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl text-xs text-white/90">
                  <span className="text-[#FF5238]">თვეში</span>
                  <span>₾115-დან</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 3. FULL-WIDTH FLAGSHIP BANNER 2: PlayStation 5 Gaming Banner */}
      <section className="py-2 select-none">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
          <div className="group relative rounded-[32px] sm:rounded-[36px] overflow-hidden min-h-[320px] sm:min-h-[360px] md:min-h-[380px] flex items-center p-6 sm:p-10 md:p-14 bg-[#070b14] text-white shadow-xl">
            
            {/* Background Image with Cinematic Depth */}
            <img
              src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600&q=85"
              alt="PlayStation 5 Slim & DualSense"
              className="absolute inset-0 w-full h-full object-cover object-center sm:object-right group-hover:scale-105 transition-transform duration-700 ease-out opacity-55 sm:opacity-70"
            />
            
            {/* Deep Contrast Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#070b14] via-[#070b14]/85 sm:via-[#070b14]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b14]/90 via-transparent to-black/30" />
            
            {/* Ambient Cyan/Indigo Aura */}
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Foreground Content */}
            <div className="relative z-10 max-w-xl space-y-3.5 sm:space-y-4">
              
              {/* Badge Pill */}
              <div className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/20 backdrop-blur-md border border-white/20 px-3.5 py-1 rounded-full text-xs text-white shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-[#FF5238]" />
                <span className="font-sans">Next-Gen Gaming Experience</span>
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-4xl md:text-[42px] leading-[1.12] tracking-tight text-white font-sans">
                PlayStation 5 Slim & DualSense
              </h3>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed font-sans max-w-lg">
                ჩაერთე გეიმინგის ახალ ეპოქაში. 4K 120Hz გრაფიკა, ულტრა-სწრაფი SSD და Haptic Feedback.
              </p>

              {/* Tech Specs Micro-Chips */}
              <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] text-zinc-300">
                <span className="bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg">
                  🎮 4K HDR 120FPS
                </span>
                <span className="bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg">
                  🔊 Tempest 3D Audio
                </span>
                <span className="bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg">
                  🚀 1TB Ultra-Fast SSD
                </span>
              </div>

              {/* Action Area */}
              <div className="pt-2 sm:pt-3 flex items-center gap-3 flex-wrap">
                <Link
                  href="/catalog?category=gaming"
                  className="inline-flex items-center gap-2 bg-[#FF5238] hover:bg-[#EA3A20] text-white px-7 py-3.5 rounded-2xl text-xs sm:text-sm shadow-lg shadow-[#FF5238]/30 hover:shadow-[#FF5238]/45 transition-all duration-200 active:scale-[0.98] cursor-pointer group/btn"
                >
                  <span>კონსოლების ნახვა</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>

                <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl text-xs text-white/90">
                  <span className="text-[#FF5238]">თვეში</span>
                  <span>₾65-დან</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
