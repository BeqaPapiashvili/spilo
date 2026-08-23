"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";

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
  const buttonText = config?.buttonText || "შეთავაზების ნახვა";
  const tagText = config?.tagText || config?.badgeText || "სპეციალური შეთავაზება";

  return (
    <section className="py-2 select-none">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Left: Content HUD & Story Studio */}
          <div className="lg:col-span-7 rounded-[32px] sm:rounded-[36px] bg-[#111111] p-6 sm:p-10 md:p-12 text-white flex flex-col justify-between relative overflow-hidden shadow-xl">
            {/* Subtle Ambient Coral Halo */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#FF5238]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top Row */}
            <div className="flex items-center justify-between z-10">
              <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1 rounded-full text-xs text-white">
                <Sparkles className="w-3.5 h-3.5 text-[#FF5238]" />
                <span className="font-sans">{tagText}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ოფიციალური გარანტია</span>
              </div>
            </div>

            {/* Center Content */}
            <div className="space-y-4 my-6 sm:my-8 z-10">
              <h3 className="text-2xl sm:text-4xl md:text-[44px] leading-[1.1] tracking-tight text-white font-sans">
                {title || "სპეციალური შეთავაზება"}
              </h3>
              {subtitle && (
                <p className="text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed font-sans max-w-xl">
                  {subtitle}
                </p>
              )}

              {/* Specs Chips */}
              <div className="grid grid-cols-3 gap-2.5 pt-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
                  <span className="text-sm sm:text-base text-white block font-sans">100%</span>
                  <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">ორიგინალი</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
                  <span className="text-sm sm:text-base text-white block font-sans">0%</span>
                  <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">განვადება</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
                  <span className="text-sm sm:text-base text-white block font-sans">Spilo</span>
                  <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">სწრაფი მიწოდება</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center gap-3 flex-wrap z-10">
              <Link
                href={link}
                className="inline-flex items-center gap-2 bg-[#FF5238] hover:bg-[#EA3A20] text-white px-7 py-3.5 rounded-2xl text-xs sm:text-sm shadow-lg shadow-[#FF5238]/30 hover:shadow-[#FF5238]/45 transition-all duration-200 active:scale-[0.98] cursor-pointer group/btn"
              >
                <span>{buttonText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right: 3D Product Stage */}
          <div className="lg:col-span-5 rounded-[32px] sm:rounded-[36px] bg-gradient-to-b from-[#18181B] to-[#0A0A0B] p-6 sm:p-8 relative overflow-hidden flex items-center justify-center min-h-[340px] sm:min-h-[420px] shadow-xl group">
            {/* Ambient Spotlight */}
            <div className="absolute w-72 h-72 rounded-full bg-[#FF5238]/15 blur-3xl pointer-events-none" />

            {/* Device Visual */}
            <img
              src={bannerUrl}
              alt={title || "Featured Product"}
              className="relative z-10 max-h-[280px] sm:max-h-[340px] w-auto object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
            />

            {/* Floating Glass Capsule */}
            <div className="absolute bottom-6 right-6 z-20 bg-black/60 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-xs text-white shadow-lg flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#FF5238]" />
              <span className="font-sans text-[11px]">ექსკლუზიური ფასი</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
