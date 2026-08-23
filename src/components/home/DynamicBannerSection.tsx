"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface DynamicBannerProps {
  id?: string;
  title?: string | null;
  subtitle?: string | null;
  config?: {
    bannerUrl?: string;
    link?: string;
    buttonText?: string;
    tagText?: string;
  } | null;
}

export default function DynamicBannerSection({
  title,
  subtitle,
  config,
}: DynamicBannerProps) {
  const bannerUrl =
    config?.bannerUrl ||
    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1600&q=85";
  const link = config?.link || "/catalog";
  const buttonText = config?.buttonText || "შეთავაზების ნახვა";
  const tagText = config?.tagText || "სპეციალური შეთავაზება";

  return (
    <section className="py-2 select-none">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
        <div className="group relative rounded-[32px] sm:rounded-[36px] overflow-hidden min-h-[320px] sm:min-h-[360px] md:min-h-[380px] flex items-center p-6 sm:p-10 md:p-14 bg-[#09090b] text-white shadow-xl">
          
          {/* Cinematic Background Image with Zoom on Hover */}
          <img
            src={bannerUrl}
            alt={title || "Promo Banner"}
            className="absolute inset-0 w-full h-full object-cover object-center sm:object-right group-hover:scale-105 transition-transform duration-700 ease-out opacity-60 sm:opacity-75"
          />
          
          {/* Deep Multi-Layer Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/85 sm:via-[#09090b]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/90 via-transparent to-black/30" />
          
          {/* Ambient Brand Halo */}
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#FF5238]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Foreground Content Stack */}
          <div className="relative z-10 max-w-xl space-y-3.5 sm:space-y-4">
            
            {/* Badge Pill */}
            <div className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/20 backdrop-blur-md border border-white/20 px-3.5 py-1 rounded-full text-xs text-white shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5238]" />
              <span className="font-sans">{tagText}</span>
            </div>

            {/* Headline */}
            <h3 className="text-2xl sm:text-4xl md:text-[42px] leading-[1.12] tracking-tight text-white font-sans">
              {title || "სპეციალური შეთავაზება"}
            </h3>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed font-sans max-w-lg">
                {subtitle}
              </p>
            )}

            {/* Action CTA */}
            <div className="pt-2 sm:pt-3 flex items-center gap-3 flex-wrap">
              <Link
                href={link}
                className="inline-flex items-center gap-2 bg-[#FF5238] hover:bg-[#EA3A20] text-white px-7 py-3.5 rounded-2xl text-xs sm:text-sm shadow-lg shadow-[#FF5238]/30 hover:shadow-[#FF5238]/45 transition-all duration-200 active:scale-[0.98] cursor-pointer group/btn"
              >
                <span>{buttonText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
