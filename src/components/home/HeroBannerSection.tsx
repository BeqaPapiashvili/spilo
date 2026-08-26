"use client";

import React, { useState, useEffect } from "react";
import CategoryCarousel from "@/components/CategoryCarousel";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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

  // Preload all slide images into browser cache on mount to prevent any loading flash
  useEffect(() => {
    slides.forEach((s) => {
      if (s.image) {
        const img = new Image();
        img.src = s.image;
      }
      if (s.mobileImage) {
        const mImg = new Image();
        mImg.src = s.mobileImage;
      }
    });
  }, [slides]);

  // 5.5-second automatic progression
  useEffect(() => {
    if (!autoplay || slides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [autoplay, slides.length, isPaused, activeIndex]);

  const prevIndex = (activeIndex - 1 + slides.length) % slides.length;
  const nextIndex = (activeIndex + 1) % slides.length;

  const currentSlide = slides[activeIndex] || slides[0];
  const prevSlide = slides[prevIndex];
  const nextSlide = slides[nextIndex];

  const handlePrev = () => {
    setActiveIndex(prevIndex);
  };

  const handleNext = () => {
    setActiveIndex(nextIndex);
  };

  return (
    <div className="space-y-10 md:space-y-12">
      {/* 1. Top Category Carousel */}
      <CategoryCarousel />

      {/* 2. Triple Showcase Carousel Stage */}
      <section className="relative overflow-hidden py-2">
        <div className="container mx-auto px-4 lg:px-8">
          
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="relative flex items-center justify-center gap-4 lg:gap-6 select-none"
          >
            
            {/* LEFT PREVIEW CARD (Visible on Large Screens) */}
            {slides.length > 1 && (
              <div
                onClick={handlePrev}
                className="hidden xl:block w-[240px] 2xl:w-[280px] h-[400px] shrink-0 rounded-[32px] overflow-hidden relative opacity-55 hover:opacity-95 hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-md bg-[#111111] group"
              >
                <img
                  src={prevSlide.image || "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&q=80"}
                  alt={prevSlide.title}
                  loading="eager"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                
                <div className="absolute bottom-6 left-5 right-5 text-white space-y-1.5">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 inline-block font-sans">
                    {prevSlide.badge || "წინა"}
                  </span>
                  <h4 className="text-sm text-white/95 line-clamp-2 leading-snug font-sans">
                    {prevSlide.title}
                  </h4>
                </div>

                <div className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronLeft size={18} />
                </div>
              </div>
            )}

            {/* CENTER SPOTLIGHT CARD (Primary Hero Slide) */}
            <div className="flex-1 max-w-[1000px] h-[360px] sm:h-[460px] md:h-[480px] rounded-[24px] sm:rounded-[36px] overflow-hidden relative shadow-2xl bg-[#111111] group">
              
              {/* Slide Background Images (Layered Cross-Fade without White Flashes) */}
              {slides.map((slide, idx) => {
                const isCurrent = idx === activeIndex;
                return (
                  <div
                    key={slide.id || idx}
                    className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                      isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    }`}
                  >
                    <img
                      src={slide.image || "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1400&q=80"}
                      alt={slide.title}
                      loading="eager"
                      className="w-full h-full object-cover hidden sm:block"
                    />
                    <img
                      src={slide.mobileImage || slide.image || "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1400&q=80"}
                      alt={slide.title}
                      loading="eager"
                      className="w-full h-full object-cover sm:hidden"
                    />
                    
                    {/* Deep Contrast Gradients for Crisp Typography */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />
                  </div>
                );
              })}

              {/* Foreground Animated Content Stack */}
              <div className="relative z-20 h-full flex flex-col justify-between p-4 sm:p-10 md:p-14 text-white">
                
                {/* Top Row: Badge & Slide Index Counter */}
                <div className="flex items-center justify-between">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`badge-${activeIndex}`}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.25 }}
                      className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/25 backdrop-blur-md border border-white/25 px-3 py-1 sm:px-3.5 sm:py-1.2 rounded-full text-[11px] sm:text-xs text-white shadow-2xs"
                    >
                      <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#FF5238]" />
                      <span>{currentSlide.badge || "სპეციალური შეთავაზება"}</span>
                    </motion.div>
                  </AnimatePresence>

                  {slides.length > 1 && (
                    <div className="text-[11px] sm:text-xs text-white/90 font-mono bg-black/50 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/15">
                      0{activeIndex + 1} / 0{slides.length}
                    </div>
                  )}
                </div>

                {/* Center Content: Title & Subtitle with Smooth Motion */}
                <div className="max-w-xl space-y-2 sm:space-y-4 my-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`content-${activeIndex}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="space-y-2 sm:space-y-4"
                    >
                      <h2 className="text-xl sm:text-4xl md:text-[42px] text-white leading-[1.2] sm:leading-[1.15] tracking-tight font-sans">
                        {currentSlide.title || "იპოვე იდეალური საჩუქარი ყველასთვის"}
                      </h2>

                      <p className="text-white/85 text-[11px] sm:text-base leading-relaxed line-clamp-2 max-w-md font-sans">
                        {currentSlide.subtitle || "შეარჩიე, შეფუთე, გაუგზავნე საჩუქარი მარტივად Spilo-თი"}
                      </p>

                      {/* Action Button */}
                      <div className="pt-1 sm:pt-4 flex items-center gap-3">
                        <Link
                          href={currentSlide.link || "/catalog"}
                          className="inline-flex items-center gap-2 bg-[#FF5238] hover:bg-[#EA3A20] text-white px-5 sm:px-8 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-[#FF5238]/35 hover:shadow-xl hover:shadow-[#FF5238]/45 active:scale-[0.98] cursor-pointer group/btn"
                        >
                          <span>{currentSlide.buttonText || "შეარჩიე საჩუქარი"}</span>
                          <ArrowRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Bottom Story-style Progress Indicator */}
                {slides.length > 1 && (
                  <div className="pt-2 flex items-center gap-2">
                    {slides.map((_, dotIdx) => {
                      const isCurrent = dotIdx === activeIndex;
                      return (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={() => setActiveIndex(dotIdx)}
                          className="group/dot relative h-1.5 rounded-full overflow-hidden transition-all duration-300 cursor-pointer"
                          style={{ width: isCurrent ? "44px" : "14px" }}
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
                )}

              </div>

              {/* On-Card Navigation Arrows */}
              {slides.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer hover:scale-105 active:scale-95"
                    title="წინა სლაიდი"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer hover:scale-105 active:scale-95"
                    title="შემდეგი სლაიდი"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

            </div>

            {/* RIGHT PREVIEW CARD (Visible on Large Screens) */}
            {slides.length > 1 && (
              <div
                onClick={handleNext}
                className="hidden xl:block w-[240px] 2xl:w-[280px] h-[400px] shrink-0 rounded-[32px] overflow-hidden relative opacity-55 hover:opacity-95 hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-md bg-[#111111] group"
              >
                <img
                  src={nextSlide.image || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80"}
                  alt={nextSlide.title}
                  loading="eager"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                
                <div className="absolute bottom-6 left-5 right-5 text-white space-y-1.5">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 inline-block font-sans">
                    {nextSlide.badge || "შემდეგი"}
                  </span>
                  <h4 className="text-sm text-white/95 line-clamp-2 leading-snug font-sans">
                    {nextSlide.title}
                  </h4>
                </div>

                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={18} />
                </div>
              </div>
            )}

          </div>

        </div>
      </section>
    </div>
  );
}
