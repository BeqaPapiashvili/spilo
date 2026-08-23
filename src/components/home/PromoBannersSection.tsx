"use client";

import React, { useState } from "react";
import PromoCarousel from "@/components/PromoCarousel";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Camera,
  Layers,
  Gamepad2,
  Tv,
  HardDrive,
  CheckCircle2
} from "lucide-react";

interface PromoBannersSectionProps {
  title?: string | null;
  subtitle?: string | null;
  config?: any;
}

const IPHONE_COLORS = [
  {
    name: "Desert Titanium",
    hex: "#C5A880",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1000&q=85",
  },
  {
    name: "Natural Titanium",
    hex: "#9E9893",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1000&q=85",
  },
  {
    name: "White Titanium",
    hex: "#E5E5EA",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1000&q=85",
  },
  {
    name: "Black Titanium",
    hex: "#2C2C2E",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000&q=85",
  },
];

export default function PromoBannersSection({}: PromoBannersSectionProps = {}) {
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const activeColor = IPHONE_COLORS[selectedColorIdx];

  return (
    <div className="space-y-12 md:space-y-16">
      {/* 1. Top Promo Banner Swiper */}
      <PromoCarousel />

      {/* 2. BESPOKE MODULAR FLAGSHIP SHOWCASE 1: Apple iPhone 16 Pro Series */}
      <section className="py-2 select-none">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Left Box: Interactive Device HUD & Story */}
            <div className="lg:col-span-7 rounded-[32px] sm:rounded-[36px] bg-[#111111] p-6 sm:p-10 md:p-12 text-white flex flex-col justify-between relative overflow-hidden shadow-xl">
              {/* Subtle Ambient Coral Aura */}
              <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#FF5238]/15 rounded-full blur-3xl pointer-events-none" />

              {/* Top Row */}
              <div className="flex items-center justify-between z-10">
                <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1 rounded-full text-xs text-white">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF5238]" />
                  <span className="font-sans">Apple Official Flagship</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>მარაგშია</span>
                </div>
              </div>

              {/* Center Content */}
              <div className="space-y-4 my-6 sm:my-8 z-10">
                <h3 className="text-2xl sm:text-4xl md:text-[44px] leading-[1.1] tracking-tight text-white font-sans">
                  iPhone 16 Pro Series
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed font-sans max-w-xl">
                  ტიტანის კორპუსი, A18 Pro ჩიპი და ინოვაციური კამერის მართვა. 0%-იანი ონლაინ განვადებით.
                </p>

                {/* Titanium Color Switcher */}
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-xs text-zinc-400 font-sans">ფერი:</span>
                  <div className="flex items-center gap-2">
                    {IPHONE_COLORS.map((c, i) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColorIdx(i)}
                        className={`w-7 h-7 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
                          selectedColorIdx === i
                            ? "ring-2 ring-[#FF5238] ring-offset-2 ring-offset-[#111111] scale-110"
                            : "opacity-75 hover:opacity-100 hover:scale-105"
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-zinc-300 font-mono pl-1">{activeColor.name}</span>
                </div>

                {/* Performance HUD Grid */}
                <div className="grid grid-cols-3 gap-2.5 pt-3">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
                    <span className="text-sm sm:text-base text-white block font-sans">3nm</span>
                    <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">A18 Pro ჩიპი</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
                    <span className="text-sm sm:text-base text-white block font-sans">48MP</span>
                    <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">Fusion კამერა</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
                    <span className="text-sm sm:text-base text-white block font-sans">120Hz</span>
                    <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">ProMotion XDR</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 flex items-center gap-3 flex-wrap z-10">
                <Link
                  href="/catalog?brand=apple"
                  className="inline-flex items-center gap-2 bg-[#FF5238] hover:bg-[#EA3A20] text-white px-7 py-3.5 rounded-2xl text-xs sm:text-sm shadow-lg shadow-[#FF5238]/30 hover:shadow-[#FF5238]/45 transition-all duration-200 active:scale-[0.98] cursor-pointer group/btn"
                >
                  <span>შეუკვეთე Spilo-თი</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>

                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl text-xs text-white/90">
                  <span className="text-[#FF5238] font-mono">₾115 / თვეში</span>
                  <span className="text-zinc-400 text-[11px]">• 0% განვადება</span>
                </div>
              </div>
            </div>

            {/* Right Box: Frameless 3D Device Showcase Stage */}
            <div className="lg:col-span-5 rounded-[32px] sm:rounded-[36px] bg-gradient-to-b from-[#18181B] to-[#0A0A0B] p-6 sm:p-8 relative overflow-hidden flex items-center justify-center min-h-[340px] sm:min-h-[420px] shadow-xl group">
              {/* Dynamic Glow matching device color */}
              <div
                className="absolute w-72 h-72 rounded-full blur-3xl opacity-25 transition-all duration-500 pointer-events-none"
                style={{ backgroundColor: activeColor.hex }}
              />

              {/* Floating Device Visual with 3D Depth */}
              <img
                src={activeColor.image}
                alt={`iPhone 16 Pro - ${activeColor.name}`}
                className="relative z-10 max-h-[280px] sm:max-h-[340px] w-auto object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
              />

              {/* Floating Feature Glass Capsule 1 (Top Left) */}
              <div className="absolute top-6 left-6 z-20 bg-black/60 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-xs text-white shadow-lg flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF5238]" />
                <span className="font-sans text-[11px]">Apple Intelligence</span>
              </div>

              {/* Floating Feature Glass Capsule 2 (Bottom Right) */}
              <div className="absolute bottom-6 right-6 z-20 bg-black/60 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-xs text-white shadow-lg flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#FF5238]" />
                <span className="font-sans text-[11px]">Camera Control</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. BESPOKE MODULAR FLAGSHIP SHOWCASE 2: PlayStation 5 Slim & Gaming Studio */}
      <section className="py-2 select-none">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Left Box: 3D DualSense & Next-Gen Console Stage */}
            <div className="lg:col-span-5 rounded-[32px] sm:rounded-[36px] bg-gradient-to-b from-[#0B132B] via-[#0E1A3D] to-[#070B14] p-6 sm:p-8 relative overflow-hidden flex items-center justify-center min-h-[340px] sm:min-h-[420px] shadow-xl group order-2 lg:order-1">
              {/* Ambient Blue Gaming Halo */}
              <div className="absolute w-72 h-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

              {/* High-res Console Mockup */}
              <img
                src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&q=85"
                alt="PlayStation 5 Slim & DualSense"
                className="relative z-10 max-h-[280px] sm:max-h-[340px] w-auto object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
              />

              {/* Floating Feature Capsule 1 (Top Left) */}
              <div className="absolute top-6 left-6 z-20 bg-black/60 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-xs text-white shadow-lg flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#FF5238]" />
                <span className="font-sans text-[11px]">Adaptive Triggers</span>
              </div>

              {/* Floating Feature Capsule 2 (Bottom Right) */}
              <div className="absolute bottom-6 right-6 z-20 bg-black/60 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-xs text-white shadow-lg flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-[#FF5238]" />
                <span className="font-sans text-[11px]">4K 120FPS HDR</span>
              </div>
            </div>

            {/* Right Box: Gaming Studio HUD & Fast Order */}
            <div className="lg:col-span-7 rounded-[32px] sm:rounded-[36px] bg-[#0A0F1D] p-6 sm:p-10 md:p-12 text-white flex flex-col justify-between relative overflow-hidden shadow-xl order-1 lg:order-2">
              {/* Subtle Brand Halo */}
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

              {/* Top Row */}
              <div className="flex items-center justify-between z-10">
                <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1 rounded-full text-xs text-white">
                  <Gamepad2 className="w-3.5 h-3.5 text-[#FF5238]" />
                  <span className="font-sans">Next-Gen Gaming Hub</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-sky-400 font-mono bg-sky-950/40 border border-sky-800/40 px-3 py-1 rounded-full">
                  <span>🚀 დღესვე მიწოდება</span>
                </div>
              </div>

              {/* Center Content */}
              <div className="space-y-4 my-6 sm:my-8 z-10">
                <h3 className="text-2xl sm:text-4xl md:text-[44px] leading-[1.1] tracking-tight text-white font-sans">
                  PlayStation 5 Slim & DualSense
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed font-sans max-w-xl">
                  ჩაერთე გეიმინგის ახალ ეპოქაში. 4K 120Hz გრაფიკა, ულტრა-სწრაფი SSD და Haptic Feedback.
                </p>

                {/* Gaming Specs HUD Grid */}
                <div className="grid grid-cols-3 gap-2.5 pt-3">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
                    <span className="text-sm sm:text-base text-white block font-sans">120 FPS</span>
                    <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">Ray Tracing 4K</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
                    <span className="text-sm sm:text-base text-white block font-sans">1TB SSD</span>
                    <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">5.5 GB/s სიჩქარე</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
                    <span className="text-sm sm:text-base text-white block font-sans">0%</span>
                    <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">ონლაინ განვადება</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 flex items-center gap-3 flex-wrap z-10">
                <Link
                  href="/catalog?category=gaming"
                  className="inline-flex items-center gap-2 bg-[#FF5238] hover:bg-[#EA3A20] text-white px-7 py-3.5 rounded-2xl text-xs sm:text-sm shadow-lg shadow-[#FF5238]/30 hover:shadow-[#FF5238]/45 transition-all duration-200 active:scale-[0.98] cursor-pointer group/btn"
                >
                  <span>კონსოლების ნახვა</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>

                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl text-xs text-white/90">
                  <span className="text-[#FF5238] font-mono">₾65 / თვეში</span>
                  <span className="text-zinc-400 text-[11px]">• 0% განვადება</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
