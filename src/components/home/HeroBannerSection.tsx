"use client";

import React, { useState, useRef } from "react";
import CategoryCarousel from "@/components/CategoryCarousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { HeroSlideItem, DEFAULT_HERO_SLIDES } from "@/types/storefront";

import "swiper/css";

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
  const swiperRef = useRef<any>(null);
  const autoplay = config?.autoplay !== false;

  if (!slides || slides.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <CategoryCarousel />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Top Category Carousel */}
      <CategoryCarousel />

      {/* 2. Extra.ge Style Pure Banner Slider (Pure Image Slot, No Overlaid Text or Buttons) */}
      <section className="relative overflow-hidden py-1">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
          <div className="w-full h-[180px] xs:h-[220px] sm:h-[260px] md:h-[300px] rounded-2xl sm:rounded-[24px] overflow-hidden relative shadow-sm bg-zinc-100 group select-none">
            {/* Swiper Image Slider */}
            <Swiper
              modules={[Autoplay]}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSlideChange={(swiper) => {
                setActiveIndex(swiper.realIndex);
              }}
              loop={slides.length > 1}
              speed={600}
              autoplay={
                autoplay && slides.length > 1
                  ? {
                      delay: 5000,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }
                  : false
              }
              className="w-full h-full"
            >
              {slides.map((slide, idx) => (
                <SwiperSlide key={slide.id || idx} className="w-full h-full">
                  <Link
                    href={slide.link || "/catalog"}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    className="block w-full h-full cursor-pointer relative"
                  >
                    {/* Desktop Image */}
                    <img
                      src={slide.image}
                      alt={slide.title || "Banner"}
                      loading={idx === 0 ? "eager" : "lazy"}
                      draggable={false}
                      className="w-full h-full object-cover hidden sm:block pointer-events-none"
                    />
                    {/* Mobile Image (falls back to desktop image) */}
                    <img
                      src={slide.mobileImage || slide.image}
                      alt={slide.title || "Banner"}
                      loading={idx === 0 ? "eager" : "lazy"}
                      draggable={false}
                      className="w-full h-full object-cover sm:hidden pointer-events-none"
                    />
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Left Circular Navigation Arrow (Extra.ge Style) */}
            {slides.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  swiperRef.current?.slidePrev();
                }}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
                aria-label="Previous banner"
              >
                <ChevronLeft size={20} strokeWidth={2.2} />
              </button>
            )}

            {/* Right Circular Navigation Arrow (Extra.ge Style) */}
            {slides.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  swiperRef.current?.slideNext();
                }}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
                aria-label="Next banner"
              >
                <ChevronRight size={20} strokeWidth={2.2} />
              </button>
            )}

            {/* Bottom-Center Frosted Capsule with Bullseye Pagination Dots (Extra.ge Style) */}
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
                          swiperRef.current?.slideToLoop(dotIdx);
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
        </div>
      </section>
    </div>
  );
}
