"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { DragSafeLink } from "@/components/DragSafeLink";
import { Navigation, FreeMode, Mousewheel } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

export interface StoreLogoItem {
  id: string;
  name: string;
  slug: string;
  logo: string;
}

export default function StoresLogoSection({ stores }: { stores: StoreLogoItem[] }) {
  const swiperRef = useRef<any>(null);
  const dragLockRef = useRef(false);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  if (stores.length === 0) return null;

  return (
    <section className="w-full py-6 sm:py-8 relative select-none">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1560px]">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl md:text-2xl text-zinc-900 tracking-tight font-sans">
              მაღაზიები
            </h2>
            <span className="text-[11px] text-zinc-400 font-mono bg-zinc-100 px-2.5 py-0.5 rounded-full">
              {stores.length}
            </span>
          </div>

          <Link href="/stores" className="text-xs text-zinc-500 hover:text-[#FF5238] transition-colors">
            ყველა მაღაზია
          </Link>
        </div>

        <div className="w-full relative overflow-hidden">
          {!isBeginning && (
            <button
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 bg-white/95 hover:bg-white text-zinc-800 rounded-full shadow-md border border-zinc-200/80 backdrop-blur-md flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
              aria-label="Previous stores"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          <Swiper
            modules={[Navigation, FreeMode, Mousewheel]}
            spaceBetween={16}
            slidesPerView="auto"
            freeMode={{ enabled: true, momentum: true, momentumRatio: 0.8 }}
            grabCursor={true}
            mousewheel={{ forceToAxis: true }}
            touchAngle={45}
            touchStartPreventDefault={false}
            touchReleaseOnEdges={true}
            preventClicks={true}
            preventClicksPropagation={true}
            resistance={true}
            resistanceRatio={0.85}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            onSlideChange={(swiper) => {
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            onReachEnd={() => setIsEnd(true)}
            onTouchStart={() => {
              dragLockRef.current = false;
            }}
            onSliderFirstMove={() => {
              dragLockRef.current = true;
            }}
            onTouchEnd={() => {
              window.setTimeout(() => {
                dragLockRef.current = false;
              }, 80);
            }}
            className="w-full py-2"
          >
            {stores.map((store) => (
              <SwiperSlide key={store.id} className="!w-[96px] sm:!w-[112px]">
                <DragSafeLink
                  href={`/stores/${encodeURIComponent(store.slug)}`}
                  dragLockRef={dragLockRef}
                  title={store.name}
                  className="group relative block w-[96px] h-[96px] sm:w-[112px] sm:h-[112px] rounded-full bg-zinc-50 cursor-pointer overflow-hidden isolate"
                >
                  <img
                    src={store.logo}
                    alt={store.name}
                    loading="lazy"
                    className="w-full h-full object-cover rounded-full transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-black/[0.06]" />
                </DragSafeLink>
              </SwiperSlide>
            ))}
          </Swiper>

          {!isEnd && (
            <button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 bg-white/95 hover:bg-white text-zinc-800 rounded-full shadow-md border border-zinc-200/80 backdrop-blur-md flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
              aria-label="Next stores"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
