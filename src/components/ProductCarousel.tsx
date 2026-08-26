"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Mousewheel } from "swiper/modules";
import ProductCard from "./ProductCard";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

interface Product {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  monthlyInstallment?: number;
  image: string;
  images?: string[];
  discountPercentage?: number;
  rating?: number;
  stock?: number;
}

interface ProductCarouselProps {
  products: Product[];
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
  const swiperRef = useRef<any>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  if (!products || products.length === 0) return null;

  return (
    <div className="relative group/carousel w-full max-w-full overflow-hidden">

      {/* Previous Arrow Button (Left) - Desktop only */}
      {!isBeginning && (
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-200/80 items-center justify-center text-gray-800 cursor-pointer hover:text-[#FF5238] hover:border-[#FED7CC] transition-colors"
          aria-label="Previous product slide"
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
        breakpoints={{
          640: {
            spaceBetween: 16,
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
        className="w-full py-2 px-0.5 overflow-visible"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="!w-[190px] sm:!w-[230px] md:!w-[270px] shrink-0">
            <ProductCard {...product} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Next Arrow Button (Right) - Desktop only */}
      {!isEnd && (
        <button
          onClick={() => swiperRef.current?.slideNext()}
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-200/80 items-center justify-center text-gray-800 cursor-pointer hover:text-[#FF5238] hover:border-[#FED7CC] transition-colors"
          aria-label="Next product slide"
        >
          <svg width="10" height="14" viewBox="0 0 9 14" fill="none">
            <path d="M8.52875 7C8.52086 6.72379 8.41826 6.48704 8.20519 6.27396L2.06539 0.26832C1.88388 0.0947012 1.6708 0 1.41037 0C0.881624 0 0.471252 0.410372 0.471252 0.939121C0.471252 1.19166 0.573845 1.42841 0.755356 1.60992L6.27959 7L0.755356 12.3901C0.573845 12.5716 0.471252 12.8005 0.471252 13.0609C0.471252 13.5896 0.881624 14 1.41037 14C1.66291 14 1.88388 13.9053 2.06539 13.7317L8.20519 7.71815C8.42616 7.51297 8.52875 7.27621 8.52875 7Z" fill="currentColor"></path>
          </svg>
        </button>
      )}
    </div>
  );
}
