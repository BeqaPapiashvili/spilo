"use client";

import React, { useState, useEffect, useRef } from "react";
import CategoryCarousel from "@/components/CategoryCarousel";
import { Sparkles, Gift, ChevronLeft, ChevronRight } from "lucide-react";
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
    (heroSlides && heroSlides.length > 0)
      ? heroSlides
      : (config?.heroSlides && Array.isArray(config.heroSlides) && config.heroSlides.length > 0)
        ? config.heroSlides
        : config?.bannerUrl
          ? [
            {
              id: "slide-1",
              image: config.bannerUrl,
              badge: config.tagText || config.badgeText || "სპეციალური შეთავაზება",
              title: config.title || title || "იპოვე იდეალური საჩუქარი ყველასთვის",
              subtitle: config.subtitle || subtitle || "შეარჩიე, შეფუთე, გაუგზავნე საჩუქარი მარტივად spilo-თი",
              buttonText: config.buttonText || "შეარჩიე საჩუქარი",
              link: config.link || config.targetLink || "/catalog",
            },
          ]
          : DEFAULT_HERO_SLIDES;

  const [activeIndex, setActiveIndex] = useState(0);
  const autoplay = config?.autoplay !== false;

  useEffect(() => {
    if (!autoplay || slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoplay, slides.length]);

  const currentSlide = slides[activeIndex] || slides[0] || DEFAULT_HERO_SLIDES[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="space-y-14">
      {/* 1. Top Category Carousel */}
      <CategoryCarousel />

      {/* 2. Main Hero Banner Slider */}
      <section className="relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="rounded-[32px] relative overflow-hidden min-h-[380px] md:min-h-[440px] flex items-center p-6 md:p-12 shadow-xs border border-gray-100 group">
            {/* Background Slides */}
            {slides.map((slide, idx) => {
              const isCurrent = idx === activeIndex;
              return (
                <div
                  key={slide.id || idx}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isCurrent ? "opacity-100 z-0 pointer-events-auto" : "opacity-0 -z-10 pointer-events-none"
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
                  <div className="absolute inset-0 bg-black/25" />
                </div>
              );
            })}

            {/* Floating White Card */}
            <div className="relative z-10 bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-[28px] max-w-md shadow-2xl border border-white/60 space-y-4 text-black transition-all duration-300">
              <div className="inline-flex items-center gap-2 bg-gray-100 text-[#1D1D1F] px-3 py-1 rounded-full text-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>{currentSlide.badge || "სპეციალური შეთავაზება"}</span>
              </div>

              <h2 className="text-2xl md:text-3xl text-gray-900 leading-tight">
                {currentSlide.title || "იპოვე იდეალური საჩუქარი ყველასთვის"}
              </h2>

              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                {currentSlide.subtitle || "შეარჩიე, შეფუთე, გაუგზავნე საჩუქარი მარტივად spilo-თი"}
              </p>

              <div className="pt-2 flex items-center justify-between">
                <Link
                  href={currentSlide.link || "/catalog"}
                  className="bg-[#1D1D1F] text-white px-6 py-3 rounded-2xl text-xs sm:text-sm hover:bg-[#2C2C2E] transition-colors cursor-pointer"
                >
                  {currentSlide.buttonText || "შეარჩიე საჩუქარი"}
                </Link>
                <div className="w-12 h-12 bg-[#F59E0B] rounded-full flex items-center justify-center text-white cursor-pointer shadow-xs hover:scale-105 transition-transform">
                  <Gift className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Slider Navigation Arrows (shown if > 1 slide) */}
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 backdrop-blur-xs flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="წინა სლაიდი"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 backdrop-blur-xs flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="შემდეგი სლაიდი"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Slider Pagination Dots */}
                <div className="absolute bottom-5 right-6 z-20 flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
                  {slides.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setActiveIndex(dotIdx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${dotIdx === activeIndex ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                        }`}
                      title={`სლაიდი #${dotIdx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
