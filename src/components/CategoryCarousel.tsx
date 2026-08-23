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
  ArrowRight
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
    count: "120+ მოდელი",
  },
  {
    title: "ტაბები",
    icon: Tablet,
    slug: "tablets",
    count: "45+ მოდელი",
  },
  {
    title: "სმარტ საათები",
    icon: Watch,
    slug: "smartwatches",
    count: "60+ მოდელი",
  },
  {
    title: "ლეპტოპები | IT",
    icon: Laptop,
    slug: "laptops",
    count: "80+ მოდელი",
  },
  {
    title: "აუდიო სისტემა",
    icon: Headphones,
    slug: "audio-systems",
    count: "95+ მოდელი",
  },
  {
    title: "Gaming & კონსოლები",
    icon: Gamepad2,
    slug: "gaming",
    count: "50+ მოდელი",
  },
  {
    title: "TV | მონიტორები",
    icon: Tv,
    slug: "tv-monitors",
    count: "70+ მოდელი",
  },
  {
    title: "ფოტო | ვიდეო",
    icon: Camera,
    slug: "photo-video",
    count: "40+ მოდელი",
  },
  {
    title: "სკუტერები",
    icon: Bike,
    slug: "scooters",
    count: "25+ მოდელი",
  },
  {
    title: "ჭკვიანი სახლი",
    icon: Home,
    slug: "smart-home",
    count: "65+ მოდელი",
  },
  {
    title: "Beauty & მოვლა",
    icon: Sparkles,
    slug: "beauty",
    count: "55+ მოდელი",
  },
  {
    title: "ავტო აქსესუარები",
    icon: Car,
    slug: "car-accessories",
    count: "35+ მოდელი",
  },
];

export default function CategoryCarousel() {
  const swiperRef = useRef<any>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  return (
    <section className="w-full pt-4 sm:pt-6 relative select-none">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
        <div className="flex items-center gap-3.5 relative">

          {/* Lead Card: All Categories */}
          <Link
            href="/categories"
            className="group shrink-0 w-[130px] sm:w-[145px] h-[155px] sm:h-[165px] bg-[#111111] hover:bg-black text-white rounded-[22px] p-4 flex flex-col justify-between items-center text-center cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 z-10 border border-zinc-800 relative overflow-hidden"
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
          <div className="flex-1 relative overflow-hidden">
            
            {/* Left Navigation Arrow */}
            {!isBeginning && (
              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 hover:bg-white text-zinc-800 rounded-full shadow-md border border-zinc-200/80 backdrop-blur-md flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
                aria-label="Previous categories"
              >
                <ChevronLeft size={18} />
              </button>
            )}

            <Swiper
              modules={[Navigation, FreeMode, Mousewheel]}
              spaceBetween={12}
              slidesPerView="auto"
              freeMode={true}
              grabCursor={true}
              mousewheel={{ forceToAxis: true }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                setIsBeginning(swiper.isBeginning);
                setIsEnd(swiper.isEnd);
              }}
              onSlideChange={(swiper) => {
                setIsBeginning(swiper.isBeginning);
                setIsEnd(swiper.isEnd);
              }}
              className="w-full py-1"
            >
              {CAROUSEL_CATEGORIES.map((cat, idx) => {
                const IconComponent = cat.icon;

                return (
                  <SwiperSlide key={idx} className="!w-[130px] sm:!w-[145px]">
                    <Link
                      href={`/catalog?category=${cat.slug}`}
                      className="group w-[130px] sm:w-[145px] h-[155px] sm:h-[165px] bg-white hover:bg-[#FFF5F2] border border-zinc-200/80 hover:border-[#FED7CC] rounded-[22px] p-3.5 flex flex-col justify-between items-start cursor-pointer relative overflow-hidden select-none transition-all duration-200 shadow-2xs hover:shadow-xs block"
                    >
                      {/* Top Category Title */}
                      <div className="z-10 w-full">
                        <h4 className="text-xs sm:text-[13px] text-zinc-900 group-hover:text-[#FF5238] transition-colors leading-tight pt-0.5 text-left line-clamp-2">
                          {cat.title}
                        </h4>
                      </div>

                      {/* Icon Stage Container */}
                      <div className="w-full flex items-end justify-end pt-2 z-10">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 group-hover:bg-white text-zinc-700 group-hover:text-[#FF5238] border border-zinc-100 group-hover:border-[#FED7CC] flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:scale-110">
                          {IconComponent && <IconComponent className="w-6 h-6 stroke-[1.8]" />}
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* Right Navigation Arrow */}
            {!isEnd && (
              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 hover:bg-white text-zinc-800 rounded-full shadow-md border border-zinc-200/80 backdrop-blur-md flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
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
