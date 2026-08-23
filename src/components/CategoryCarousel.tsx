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
  Car
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
    <section className="w-full pt-6 relative">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
        <div className="flex items-center gap-3 relative">

          {/* All Categories Card */}
          <Link
            href="/categories"
            className="shrink-0 w-[130px] sm:w-[145px] h-[160px] bg-[#18181B] text-white rounded-2xl p-4 flex flex-col justify-between items-center text-center cursor-pointer select-none z-10 border border-[#27272A]"
          >
            <div className="flex-1 flex flex-col items-center justify-center pt-1">
              <div className="w-11 h-11 rounded-xl bg-[#27272A] flex items-center justify-center mb-1 text-white">
                <LayoutGrid className="w-5 h-5 text-white" />
              </div>
            </div>
            <h4 className="text-xs sm:text-sm text-white leading-tight pb-1">
              ყველა კატეგორია
            </h4>
          </Link>

          {/* Swiper Container */}
          <div className="flex-1 relative overflow-hidden">
            {!isBeginning && (
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-md border border-[#E4E4E7] flex items-center justify-center text-[#18181B] cursor-pointer hover:bg-[#F4F4F5]"
                aria-label="Previous slide"
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
                      className="w-[130px] sm:w-[145px] h-[160px] bg-[#F4F4F5] border border-[#E4E4E7] rounded-2xl p-3.5 flex flex-col justify-between items-start cursor-pointer relative overflow-hidden select-none block"
                    >
                      <h4 className="text-xs sm:text-sm text-[#18181B] leading-tight pt-0.5 z-10 text-left">
                        {cat.title}
                      </h4>

                      <div className="absolute bottom-2 right-2 w-14 h-14 flex items-end justify-end pointer-events-none text-[#71717A]">
                        {IconComponent && <IconComponent className="w-11 h-11 stroke-[1.5]" />}
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {!isEnd && (
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-md border border-[#E4E4E7] flex items-center justify-center text-[#18181B] cursor-pointer hover:bg-[#F4F4F5]"
                aria-label="Next slide"
              >
                <svg width="10" height="14" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.52875 7C8.52086 6.72379 8.41826 6.48704 8.20519 6.27396L2.06539 0.26832C1.88388 0.0947012 1.6708 0 1.41037 0C0.881624 0 0.471252 0.410372 0.471252 0.939121C0.471252 1.19166 0.573845 1.42841 0.755356 1.60992L6.27959 7L0.755356 12.3901C0.573845 12.5716 0.471252 12.8005 0.471252 13.0609C0.471252 13.5896 0.881624 14 1.41037 14C1.66291 14 1.88388 13.9053 2.06539 13.7317L8.20519 7.71815C8.42616 7.51297 8.52875 7.27621 8.52875 7Z" fill="currentColor"></path>
                </svg>
              </button>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
