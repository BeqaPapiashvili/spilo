"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Mousewheel } from "swiper/modules";
import {
  Tv,
  Sparkles,
  Home,
  Gamepad2,
  Smartphone,
  Tablet,
  Watch,
  Laptop,
  Camera,
  Headphones,
  LayoutGrid,
  Bike,
  Car,
} from "lucide-react";

import { useStore } from "@/store/useStore";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

const CAROUSEL_CATEGORIES = [
  {
    title: "სმარტფონები",
    icon: Smartphone,
    slug: "mobiles",
  },
  {
    title: "ტაბები",
    icon: Tablet,
    slug: "tablets",
  },
  {
    title: "სმარტ საათები",
    icon: Watch,
    slug: "smartwatches",
  },
  {
    title: "ლეპტოპები | IT",
    icon: Laptop,
    slug: "laptops",
  },
  {
    title: "აუდიო სისტემა",
    icon: Headphones,
    slug: "audio-systems",
  },
  {
    title: "Gaming & კონსოლები",
    icon: Gamepad2,
    slug: "gaming",
  },
  {
    title: "TV | მონიტორები",
    icon: Tv,
    slug: "tv-monitors",
  },
  {
    title: "ფოტო | ვიდეო",
    icon: Camera,
    slug: "photo-video",
  },
  {
    title: "სკუტერები",
    icon: Bike,
    slug: "scooters",
  },
  {
    title: "ჭკვიანი სახლი",
    icon: Home,
    slug: "smart-home",
  },
  {
    title: "Beauty & მოვლა",
    icon: Sparkles,
    slug: "beauty",
  },
  {
    title: "ავტო აქსესუარები",
    icon: Car,
    slug: "car-accessories",
  },
];

export default function CategoryCarousel() {
  const swiperRef = useRef<any>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const { toggleMegaMenu, isMegaMenuOpen } = useStore();

  return (
    <>
    <section className="sm:hidden w-full pt-2.5 pb-1 select-none">
      <div className="px-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-3 w-max pr-2">
          {CAROUSEL_CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/catalog?category=${cat.slug}`}
                className="flex flex-col items-center gap-1.5 w-[68px] shrink-0 active:scale-95 transition-transform"
              >
                <span className="w-[52px] h-[52px] rounded-full bg-[#F4F5F7] text-[#1D1D1F] flex items-center justify-center">
                  <IconComponent className="w-[22px] h-[22px] stroke-[1.7]" />
                </span>
                <span className="text-[10px] leading-none text-gray-600 text-center w-full truncate whitespace-nowrap">
                  {cat.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>

    <section className="hidden sm:block w-full pt-3 sm:pt-6 relative select-none">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
        <div className="flex items-center gap-2.5 sm:gap-3.5 relative overflow-hidden">

          {/* Lead Card: All Categories (Desktop side tile) */}
          <button
            type="button"
            onClick={() => {
              if (!isMegaMenuOpen) {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
              toggleMegaMenu();
            }}
            className="hidden sm:flex group shrink-0 w-[130px] sm:w-[145px] h-[155px] sm:h-[165px] bg-[#111111] hover:bg-black text-white rounded-[22px] p-4 flex-col justify-between items-center text-center cursor-pointer shadow-xs border border-zinc-800 relative overflow-hidden select-none transition-colors"
          >
            <div className="flex-1 flex flex-col items-center justify-center pt-1 z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#FF5238] flex items-center justify-center mb-1 text-white shadow-xs">
                <LayoutGrid className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="z-10 pb-0.5">
              <h4 className="text-xs sm:text-[13px] text-white leading-tight">
                ყველა კატეგორია
              </h4>
              <span className="text-[10px] text-zinc-400 mt-0.5 inline-block">
                დათვალიერება →
              </span>
            </div>
          </button>

          {/* Swiper Carousel Track - Identical to ProductCarousel */}
          <div className="flex-1 relative group/carousel min-w-0 overflow-hidden">
            
            {/* Previous Arrow Button (Left) - Desktop only, identical to ProductCarousel */}
            {!isBeginning && (
              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-200/80 items-center justify-center text-gray-800 cursor-pointer hover:text-[#FF5238] hover:border-[#FED7CC] transition-colors"
                aria-label="Previous categories slide"
              >
                <svg width="10" height="14" viewBox="0 0 9 14" fill="none" className="rotate-180">
                  <path d="M8.52875 7C8.52086 6.72379 8.41826 6.48704 8.20519 6.27396L2.06539 0.26832C1.88388 0.0947012 1.6708 0 1.41037 0C0.881624 0 0.471252 0.410372 0.471252 0.939121C0.471252 1.19166 0.573845 1.42841 0.755356 1.60992L6.27959 7L0.755356 12.3901C0.573845 12.5716 0.471252 12.8005 0.471252 13.0609C0.471252 13.5896 0.881624 14 1.41037 14C1.66291 14 1.88388 13.9053 2.06539 13.7317L8.20519 7.71815C8.42616 7.51297 8.52875 7.27621 8.52875 7Z" fill="currentColor"></path>
                </svg>
              </button>
            )}

            <Swiper
              modules={[Navigation, FreeMode, Mousewheel]}
              spaceBetween={12}
              slidesPerView="auto"
              freeMode={{
                enabled: true,
                momentum: true,
                momentumRatio: 0.8,
              }}
              grabCursor={true}
              mousewheel={{ forceToAxis: true }}
              touchAngle={45}
              touchStartPreventDefault={false}
              touchReleaseOnEdges={true}
              preventClicks={true}
              preventClicksPropagation={true}
              resistance={true}
              resistanceRatio={0.85}
              watchSlidesProgress={true}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                setIsBeginning(swiper.isBeginning);
                setIsEnd(swiper.isEnd);
              }}
              onSlideChange={(swiper) => {
                setIsBeginning(swiper.isBeginning);
                setIsEnd(swiper.isEnd);
              }}
              onProgress={(swiper) => {
                setIsBeginning(swiper.isBeginning);
                setIsEnd(swiper.isEnd);
              }}
              className="w-full py-1 overflow-visible"
            >
              {CAROUSEL_CATEGORIES.map((cat, idx) => {
                const IconComponent = cat.icon;

                return (
                  <SwiperSlide key={idx} className="!w-[135px] md:!w-[145px] shrink-0">
                    <Link
                      href={`/catalog?category=${cat.slug}`}
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      className="group w-[135px] md:w-[145px] h-[155px] md:h-[165px] bg-white border border-zinc-200/80 rounded-[22px] p-3.5 flex flex-col justify-between items-start cursor-pointer select-none text-left"
                    >
                      <div className="z-10 w-full">
                        <h4 className="text-xs md:text-[13px] text-zinc-800 leading-tight line-clamp-2">
                          {cat.title}
                        </h4>
                      </div>

                      <div className="w-full flex items-end justify-end z-10 pt-2">
                        {IconComponent && (
                          <IconComponent className="w-7 h-7 text-zinc-700 stroke-[1.6]" />
                        )}
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* Next Arrow Button (Right) - Desktop only, identical to ProductCarousel */}
            {!isEnd && (
              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-200/80 items-center justify-center text-gray-800 cursor-pointer hover:text-[#FF5238] hover:border-[#FED7CC] transition-colors"
                aria-label="Next categories slide"
              >
                <svg width="10" height="14" viewBox="0 0 9 14" fill="none">
                  <path d="M8.52875 7C8.52086 6.72379 8.41826 6.48704 8.20519 6.27396L2.06539 0.26832C1.88388 0.0947012 1.6708 0 1.41037 0C0.881624 0 0.471252 0.410372 0.471252 0.939121C0.471252 1.19166 0.573845 1.42841 0.755356 1.60992L6.27959 7L0.755356 12.3901C0.573845 12.5716 0.471252 12.8005 0.471252 13.0609C0.471252 13.5896 0.881624 14 1.41037 14C1.66291 14 1.88388 13.9053 2.06539 13.7317L8.20519 7.71815C8.42616 7.51297 8.52875 7.27621 8.52875 7Z" fill="currentColor"></path>
                </svg>
              </button>
            )}

          </div>

        </div>
      </div>
    </section>
    </>
  );
}


