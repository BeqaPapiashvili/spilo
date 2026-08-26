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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

  return (
    <section className="w-full pt-3 sm:pt-6 relative select-none">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
        <div className="flex items-center gap-2.5 sm:gap-3.5 relative overflow-hidden">

          {/* Lead Card: All Categories (Desktop side tile) */}
          <Link
            href="/categories"
            className="hidden sm:flex group shrink-0 w-[130px] sm:w-[145px] h-[155px] sm:h-[165px] bg-[#111111] hover:bg-black text-white rounded-[22px] p-4 flex-col justify-between items-center text-center cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 z-10 border border-zinc-800 relative overflow-hidden"
          >
            {/* Ambient Coral Glow on Hover */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#FF5238]/20 rounded-full blur-xl group-hover:bg-[#FF5238]/35 transition-all" />

            <div className="flex-1 flex flex-col items-center justify-center pt-1 z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#FF5238] flex items-center justify-center mb-1 text-white shadow-md shadow-[#FF5238]/30 group-hover:scale-110 transition-transform duration-200">
                <LayoutGrid className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="z-10 pb-0.5">
              <h4 className="text-xs sm:text-[13px] text-white leading-tight">
                ყველა კატეგორია
              </h4>
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5 inline-block group-hover:text-[#FF5238] transition-colors">
                დათვალიერება →
              </span>
            </div>
          </Link>

          {/* Swiper Carousel Track */}
          <div className="flex-1 relative overflow-hidden w-full">
            
            {/* Left Navigation Arrow (Desktop Only) */}
            {!isBeginning && (
              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 hover:bg-white text-zinc-800 rounded-full shadow-md border border-zinc-200/80 backdrop-blur-md items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
                aria-label="Previous categories"
              >
                <ChevronLeft size={18} />
              </button>
            )}

            <Swiper
              modules={[Navigation, FreeMode, Mousewheel]}
              spaceBetween={8}
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
              breakpoints={{
                640: {
                  spaceBetween: 12,
                },
              }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                setIsBeginning(swiper.isBeginning);
                setIsEnd(swiper.isEnd);
              }}
              onSlideChange={(swiper) => {
                setIsBeginning(swiper.isBeginning);
                setIsEnd(swiper.isEnd);
              }}
              className="w-full py-1 overflow-visible"
            >
              {/* Mobile Lead Card (Included in carousel slide flow on mobile) */}
              <SwiperSlide className="sm:!hidden !w-[88px] shrink-0">
                <Link
                  href="/categories"
                  className="group w-[88px] h-[108px] bg-[#111111] text-white rounded-2xl p-2 flex flex-col justify-between items-center text-center cursor-pointer shadow-xs border border-zinc-800 relative overflow-hidden active:scale-95 transition-transform"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#FF5238] flex items-center justify-center text-white mt-1 shadow-xs">
                    <LayoutGrid className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[11px] text-white leading-tight line-clamp-2 pb-0.5">
                    ყველა
                  </span>
                </Link>
              </SwiperSlide>

              {CAROUSEL_CATEGORIES.map((cat, idx) => {
                const IconComponent = cat.icon;

                return (
                  <SwiperSlide key={idx} className="!w-[88px] sm:!w-[135px] md:!w-[145px] shrink-0">
                    <Link
                      href={`/catalog?category=${cat.slug}`}
                      className="group w-[88px] sm:w-[135px] md:w-[145px] h-[108px] sm:h-[155px] md:h-[165px] bg-white hover:bg-[#FFF5F2] border border-zinc-200/80 hover:border-[#FED7CC] rounded-2xl sm:rounded-[22px] p-2 sm:p-3.5 flex flex-col justify-between items-center sm:items-start cursor-pointer relative overflow-hidden select-none transition-all duration-200 shadow-2xs hover:shadow-xs text-center sm:text-left active:scale-95 sm:active:scale-100"
                    >
                      {/* Top Category Title (Desktop & Mobile) */}
                      <div className="z-10 w-full order-2 sm:order-1 mt-1 sm:mt-0">
                        <h4 className="text-[11px] sm:text-xs md:text-[13px] text-zinc-800 group-hover:text-[#FF5238] transition-colors leading-tight line-clamp-2">
                          {cat.title}
                        </h4>
                      </div>

                      {/* Icon Stage Container */}
                      <div className="w-full flex items-center sm:items-end justify-center sm:justify-end z-10 order-1 sm:order-2 pt-0.5 sm:pt-2">
                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-zinc-50 group-hover:bg-white text-zinc-700 group-hover:text-[#FF5238] border border-zinc-100 group-hover:border-[#FED7CC] flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:scale-110">
                          {IconComponent && <IconComponent className="w-4.5 h-4.5 sm:w-6 sm:h-6 stroke-[1.8]" />}
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* Right Navigation Arrow (Desktop Only) */}
            {!isEnd && (
              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 hover:bg-white text-zinc-800 rounded-full shadow-md border border-zinc-200/80 backdrop-blur-md items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
                aria-label="Next categories"
              >
                <ChevronRight size={18} />
              </button>
            )}

          </div>

        </div>
      </div>
    </section>
  );
}
