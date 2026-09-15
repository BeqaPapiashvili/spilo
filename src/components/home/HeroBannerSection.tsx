"use client";

import React, { useState, useEffect } from "react";
import CategoryCarousel from "@/components/CategoryCarousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { HeroSlideItem, DEFAULT_HERO_SLIDES } from "@/types/storefront";

interface HeroBannerSectionProps {
  title?: string | null;
  subtitle?: string | null;
  heroSlides?: HeroSlideItem[];
  config?: any;
}

export default function HeroBannerSection({
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
            link: config.link || config.targetLink || "/catalog",
          },
        ]
      : DEFAULT_HERO_SLIDES;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const autoplay = config?.autoplay !== false;
  const autoplayInterval = (config?.autoplaySpeed || 5) * 1000;

  // Auto-play timer
  useEffect(() => {
    if (!autoplay || isPaused || slides.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, [autoplay, isPaused, slides.length, autoplayInterval]);

  // Preload all slide images into memory
  useEffect(() => {
    if (!slides || slides.length === 0) return;
    slides.forEach((slide) => {
      if (slide.image) {
        const img = new Image();
        img.src = slide.image;
      }
      if (slide.mobileImage) {
        const mImg = new Image();
        mImg.src = slide.mobileImage;
      }
    });
  }, [slides]);

  if (!slides || slides.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <CategoryCarousel />
      </div>
    );
  }

  const currentSlide = slides[activeIndex];
  const prevIndex = (activeIndex - 1 + slides.length) % slides.length;
  const nextIndex = (activeIndex + 1) % slides.length;
  const prevSlide = slides[prevIndex];
  const nextSlide = slides[nextIndex];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setActiveIndex(prevIndex);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setActiveIndex(nextIndex);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Top Category Carousel */}
      <CategoryCarousel />

      {/* 2. Triple Showcase Pure Image Carousel */}
      <section className="relative overflow-hidden py-1 sm:py-2">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="relative flex items-center justify-center gap-3 sm:gap-4 lg:gap-6 select-none"
          >
            {/* LEFT PREVIEW CARD with Navigation Arrow */}
            {slides.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="hidden xl:block w-[220px] 2xl:w-[260px] h-[340px] 2xl:h-[380px] shrink-0 rounded-2xl sm:rounded-[28px] overflow-hidden relative opacity-70 hover:opacity-100 hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-sm bg-zinc-100 group p-0 border-0"
                title="წინა ბანერი"
                aria-label="Previous banner"
              >
                <img
                  src={prevSlide.image || "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&q=80"}
                  alt="Previous"
                  loading="eager"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
                
                {/* Arrow Button inside Left Card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 group-hover:bg-black/75 backdrop-blur-xs border border-white/20 text-white flex items-center justify-center transition-all shadow-md group-hover:scale-110">
                  <ChevronLeft size={22} />
                </div>
              </button>
            )}

            {/* CENTER SPOTLIGHT CARD (Primary Hero Slide - Pure Image Only, No Overlaid Arrows) */}
            <div className="flex-1 max-w-[1020px] h-[220px] xs:h-[260px] sm:h-[340px] md:h-[380px] 2xl:h-[400px] rounded-2xl sm:rounded-[28px] overflow-hidden relative shadow-md bg-zinc-100 group">
              <Link
                href={currentSlide.link || "/catalog"}
                className="block w-full h-full cursor-pointer relative"
              >
                {/* Slide Background Images with smooth cross-fade */}
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
                        alt="Banner"
                        loading={idx === 0 ? "eager" : "lazy"}
                        className="w-full h-full object-cover hidden sm:block"
                      />
                      <img
                        src={slide.mobileImage || slide.image || "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1400&q=80"}
                        alt="Banner"
                        loading={idx === 0 ? "eager" : "lazy"}
                        className="w-full h-full object-cover sm:hidden"
                      />
                    </div>
                  );
                })}
              </Link>

              {/* Bottom Frosted Dots Pagination */}
              {slides.length > 1 && (
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
                  <div className="bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-white/15 shadow-sm">
                    {slides.map((_, dotIdx) => {
                      const isCurrent = dotIdx === activeIndex;
                      return (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveIndex(dotIdx);
                          }}
                          className={`transition-all duration-300 rounded-full cursor-pointer ${
                            isCurrent
                              ? "w-2.5 h-2.5 bg-white ring-2 ring-white/50"
                              : "w-1.5 h-1.5 bg-white/45 hover:bg-white/80"
                          }`}
                          aria-label={`Go to slide ${dotIdx + 1}`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT PREVIEW CARD with Navigation Arrow */}
            {slides.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="hidden xl:block w-[220px] 2xl:w-[260px] h-[340px] 2xl:h-[380px] shrink-0 rounded-2xl sm:rounded-[28px] overflow-hidden relative opacity-70 hover:opacity-100 hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-sm bg-zinc-100 group p-0 border-0"
                title="შემდეგი ბანერი"
                aria-label="Next banner"
              >
                <img
                  src={nextSlide.image || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80"}
                  alt="Next"
                  loading="eager"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
                
                {/* Arrow Button inside Right Card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 group-hover:bg-black/75 backdrop-blur-xs border border-white/20 text-white flex items-center justify-center transition-all shadow-md group-hover:scale-110">
                  <ChevronRight size={22} />
                </div>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
