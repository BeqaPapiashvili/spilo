"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface DynamicBannerProps {
  id?: string;
  title?: string | null;
  subtitle?: string | null;
  config?: {
    bannerUrl?: string;
    link?: string;
    buttonText?: string;
    tagText?: string;
    badgeText?: string;
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
  const buttonText = config?.buttonText || "შეძენა";
  const tagText = config?.tagText || config?.badgeText || "სპეციალური შეთავაზება";

  return (
    <section className="py-2 select-none">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
        <div className="group relative rounded-[28px] sm:rounded-[36px] overflow-hidden min-h-[260px] sm:min-h-[300px] md:min-h-[340px] flex items-center p-6 sm:p-10 md:p-14 bg-[#09090b] text-white shadow-md">
          
          {/* High-Resolution Right-Aligned Product Visual */}
          <img
            src={bannerUrl}
            alt={title || "Featured Banner"}
            className="absolute inset-0 w-full h-full object-cover object-right sm:object-right group-hover:scale-[1.03] transition-transform duration-700 ease-out opacity-70 sm:opacity-85"
          />
          
          {/* Smooth Left-to-Right Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/90 sm:via-[#09090b]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/80 via-transparent to-transparent sm:hidden" />

          {/* Left Content Area */}
          <div className="relative z-10 max-w-lg space-y-2.5 sm:space-y-3.5">
            <span className="text-[11px] sm:text-xs text-[#FF5238] tracking-widest uppercase font-sans">
              {tagText}
            </span>

            <h3 className="text-2xl sm:text-3xl md:text-4xl text-white tracking-tight font-sans leading-tight">
              {title || "სპეციალური შეთავაზება"}
            </h3>

            {subtitle && (
              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed max-w-md">
                {subtitle}
              </p>
            )}

            <div className="pt-2 sm:pt-3 flex items-center gap-4 flex-wrap">
              <Link
                href={link}
                className="inline-flex items-center gap-2 bg-[#FF5238] hover:bg-[#EA3A20] text-white px-6 sm:px-7 py-3 rounded-full text-xs sm:text-sm shadow-md shadow-[#FF5238]/25 hover:shadow-lg hover:shadow-[#FF5238]/35 transition-all duration-200 active:scale-[0.98] cursor-pointer group/btn"
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
