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
  discountPercentage?: number;
  rating?: number;
}

interface ProductCarouselProps {
  products: Product[];
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
  const swiperRef = useRef<any>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  return (
    <div className="relative overflow-hidden">
      
      {/* Previous Arrow Button (Left) */}
      {!isBeginning && (
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-md border border-gray-200/80 flex items-center justify-center text-black cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
          aria-label="Previous product slide"
        >
          <svg width="11" height="16" viewBox="0 0 9 14" fill="none" className="rotate-180">
            <path d="M8.52875 7C8.52086 6.72379 8.41826 6.48704 8.20519 6.27396L2.06539 0.26832C1.88388 0.0947012 1.6708 0 1.41037 0C0.881624 0 0.471252 0.410372 0.471252 0.939121C0.471252 1.19166 0.573845 1.42841 0.755356 1.60992L6.27959 7L0.755356 12.3901C0.573845 12.5716 0.471252 12.8005 0.471252 13.0609C0.471252 13.5896 0.881624 14 1.41037 14C1.66291 14 1.88388 13.9053 2.06539 13.7317L8.20519 7.71815C8.42616 7.51297 8.52875 7.27621 8.52875 7Z" fill="currentColor"></path>
          </svg>
        </button>
      )}

      <Swiper
        modules={[Navigation, FreeMode, Mousewheel]}
        spaceBetween={16}
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
        {products.map((product) => (
          <SwiperSlide key={product.id} className="!w-[240px] md:!w-[270px]">
            <ProductCard {...product} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Next Arrow Button (Right) */}
      {!isEnd && (
        <button
          onClick={() => swiperRef.current?.slideNext()}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-md border border-gray-200/80 flex items-center justify-center text-black cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
          aria-label="Next product slide"
        >
          <svg width="11" height="16" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.52875 7C8.52086 6.72379 8.41826 6.48704 8.20519 6.27396L2.06539 0.26832C1.88388 0.0947012 1.6708 0 1.41037 0C0.881624 0 0.471252 0.410372 0.471252 0.939121C0.471252 1.19166 0.573845 1.42841 0.755356 1.60992L6.27959 7L0.755356 12.3901C0.573845 12.5716 0.471252 12.8005 0.471252 13.0609C0.471252 13.5896 0.881624 14 1.41037 14C1.66291 14 1.88388 13.9053 2.06539 13.7317L8.20519 7.71815C8.42616 7.51297 8.52875 7.27621 8.52875 7Z" fill="currentColor"></path>
          </svg>
        </button>
      )}
    </div>
  );
}
