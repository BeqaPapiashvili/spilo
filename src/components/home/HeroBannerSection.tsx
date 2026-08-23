"use client";

import React, { useState, useEffect, useRef } from "react";
import CategoryCarousel from "@/components/CategoryCarousel";
import {
  Sparkles,
  Gift,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Truck,
  CreditCard,
  Zap,
  Flame
} from "lucide-react";
import Link from "next/link";
import { HeroSlideItem, DEFAULT_HERO_SLIDES } from "@/types/storefront";

interface HeroBannerSectionProps {
  title?: string | null;
  subtitle?: string | null;
  heroSlides?: HeroSlideItem[];
  config?: any;
}

export default function HeroBannerSection({
  title,
  subtitle,
  heroSlides,
  config,
}: HeroBannerSectionProps = {}) {
  const slides: HeroSlideItem[] =
    heroSlides && heroSlides.length > 0
      ? heroSlides
      : config?.heroSlides && Array.isArray(config.heroSlides) && config.heroSlides.length > 0
      ? config.heroSlides
      : config?.bannerUrl
      ? [
          {
            id: "slide-1",
            image: config.bannerUrl,
            badge: config.tagText || config.badgeText || "სპეციალური შეთავაზება",
            title: config.title || title || "იპოვე იდეალური საჩუქარი ყველასთვის",
            subtitle: config.subtitle || subtitle || "შეარჩიე, შეფუთე, გაუგზავნე საჩუქარი მარტივად Spilo-თი",
            buttonText: config.buttonText || "შეარჩიე საჩუქარი",
            link: config.link || config.targetLink || "/catalog",
          },
        ]
      : DEFAULT_HERO_SLIDES;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoplay = config?.autoplay !== false;

  // 5-second automatic progression
  useEffect(() => {
    if (!autoplay || slides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [autoplay, slides.length, isPaused, activeIndex]);

  const currentSlide = slides[activeIndex] || slides[0] || DEFAULT_HERO_SLIDES[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  // Quick category discovery tags
  const quickTags = [
    { label: "🎁 საჩუქრები", link: "/catalog" },
    { label: "🔥 ფასდაკლებები", link: "/catalog?sort=discount" },
    { label: "🎮 გეიმინგი", link: "/catalog?category=gaming" },
    { label: "📱 სმარტფონები", link: "/catalog?category=smartphones" },
    { label: "🎧 აუდიო & გაჯეტები", link: "/catalog?category=audio" },
  ];

  return (
    <div className="space-y-10 md:space-y-12">
      {/* 1. Top Category Carousel */}
      <CategoryCarousel />

      {/* 2. Main Hero Showcase Stage */}
      <section className="relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="rounded-[32px] sm:rounded-[36px] relative overflow-hidden min-h-[420px] md:min-h-[460px] flex items-center p-5 sm:p-8 md:p-12 shadow-md border border-zinc-200/80 group select-none"
          >
            {/* Background Slides with Ken Burns Smooth Transition */}
            {slides.map((slide, idx) => {
              const isCurrent = idx === activeIndex;
              return (
                <div
                  key={slide.id || idx}
                  className={`absolute inset-0 transition-all duration-1000 ease-out ${
                    isCurrent
                      ? "opacity-100 scale-100 z-0 pointer-events-auto"
                      : "opacity-0 scale-105 -z-10 pointer-events-none"
                  }`}
                >
                  <img
                    src={slide.image || "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1400&q=80"}
                    alt={slide.title}
                    className="w-full h-full object-cover hidden sm:block"
                  />
                  <img
                    src={slide.mobileImage || slide.image || "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1400&q=80"}
                    alt={slide.title}
                    className="w-full h-full object-cover sm:hidden"
                  />
                  {/* Subtle Gradient Overlays for High-End Readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                </div>
              );
            })}

            {/* Floating Glassmorphic Content Card */}
            <div className="relative z-10 bg-white/95 backdrop-blur-xl p-6 sm:p-8 md:p-9 rounded-[30px] max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-white/80 space-y-4 text-zinc-900 transition-all duration-300">
              
              {/* Badge Pill */}
              <div className="inline-flex items-center gap-1.5 bg-[#FFF5F2] text-[#FF5238] border border-[#FED7CC] px-3.5 py-1 rounded-full text-xs shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentSlide.badge || "სპეციალური შეთავაზება"}</span>
              </div>

              {/* Slide Heading */}
              <h2 className="text-2xl sm:text-3xl md:text-[32px] text-zinc-900 leading-tight tracking-tight">
                {currentSlide.title || "იპოვე იდეალური საჩუქარი ყველასთვის"}
              </h2>

              {/* Slide Subtitle */}
              <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                {currentSlide.subtitle || "შეარჩიე, შეფუთე, გაუგზავნე საჩუქარი მარტივად Spilo-თი"}
              </p>

              {/* Quick Tag Pills for Fast Discovery */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {quickTags.slice(0, 3).map((tag, tIdx) => (
                  <Link
                    key={tIdx}
                    href={tag.link}
                    className="px-2.5 py-1 bg-zinc-100 hover:bg-[#FFF5F2] hover:text-[#FF5238] hover:border-[#FED7CC] border border-zinc-200/80 rounded-full text-[11px] text-zinc-600 transition-colors cursor-pointer"
                  >
                    {tag.label}
                  </Link>
                ))}
              </div>

              {/* Action Buttons & Gift Box Group */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <Link
                  href={currentSlide.link || "/catalog"}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#FF5238] hover:bg-[#EA3A20] text-white px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition-all duration-200 shadow-md shadow-[#FF5238]/25 hover:shadow-lg hover:shadow-[#FF5238]/35 active:scale-[0.98] cursor-pointer group/btn"
                >
                  <span>{currentSlide.buttonText || "შეარჩიე საჩუქარი"}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>

                <div
                  className="w-12 h-12 rounded-2xl bg-[#FFF5F2] border border-[#FED7CC] text-[#FF5238] flex items-center justify-center shadow-2xs shrink-0 cursor-default"
                  title="Spilo საჩუქრების სერვისი"
                >
                  <Gift className="w-5 h-5" />
                </div>
              </div>

            </div>

            {/* Quick Benefits Strip (Floating on Bottom Left on larger screens) */}
            <div className="hidden lg:flex absolute bottom-5 left-12 z-10 items-center gap-4 text-white/90 text-xs bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#FF5238]" /> უფასო მიწოდება
              </span>
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#FF5238]" /> 0% განვადება
              </span>
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF5238]" /> ოფიციალური გარანტია
              </span>
            </div>

            {/* Slider Navigation Controls (Left/Right Frosted Glass Capsules) */}
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-zinc-800 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/60 transition-all opacity-0 group-hover:opacity-100 cursor-pointer hover:scale-105 active:scale-95"
                  title="წინა სლაიდი"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-zinc-800 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/60 transition-all opacity-0 group-hover:opacity-100 cursor-pointer hover:scale-105 active:scale-95"
                  title="შემდეგი სლაიდი"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Modern Story Progress Bars */}
                <div className="absolute bottom-5 right-6 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10">
                  {slides.map((_, dotIdx) => {
                    const isCurrent = dotIdx === activeIndex;
                    return (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setActiveIndex(dotIdx)}
                        className="group/dot relative h-1.5 rounded-full overflow-hidden transition-all duration-300 cursor-pointer"
                        style={{ width: isCurrent ? "32px" : "12px" }}
                        title={`სლაიდი #${dotIdx + 1}`}
                      >
                        <div className="w-full h-full bg-white/30 rounded-full" />
                        {isCurrent && (
                          <div
                            className="absolute inset-0 bg-[#FF5238] rounded-full animate-[progress_5.5s_linear]"
                            key={`progress-${activeIndex}`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

          </div>
        </div>
      </section>
    </div>
  );
}
