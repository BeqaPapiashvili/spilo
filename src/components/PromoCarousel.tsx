"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Mousewheel } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PromoCardItem, PromoStyleConfig } from "@/types/storefront";
import PastelPromoCard from "@/components/sections/PastelPromoCard";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

interface PromoCarouselProps {
  cards?: PromoCardItem[];
  styleConfig?: PromoStyleConfig;
}

export default function PromoCarousel({
  cards = [],
}: PromoCarouselProps) {
  const swiperRef = useRef<any>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  if (!cards || cards.length === 0) return null;

  return (
    <div className="w-full relative group/carousel">
      <div className="relative">
        {/* Navigation Arrow Left */}
        {!isBeginning && (
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-slate-200/80 flex items-center justify-center text-slate-800 cursor-pointer hover:bg-white hover:scale-105 active:scale-95 transition-all"
            aria-label="Previous promo slide"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Navigation Arrow Right */}
        {!isEnd && (
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-slate-200/80 flex items-center justify-center text-slate-800 cursor-pointer hover:bg-white hover:scale-105 active:scale-95 transition-all"
            aria-label="Next promo slide"
          >
            <ChevronRight size={18} />
          </button>
        )}

        <Swiper
          modules={[Navigation, FreeMode, Mousewheel]}
          spaceBetween={16}
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
          {cards.map((card) => (
            <SwiperSlide key={card.id} className="!w-64 sm:!w-72 md:!w-80">
              <PastelPromoCard card={card} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
