import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Mousewheel } from "swiper/modules";
import { Flame } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

const PROMO_ITEMS = [
  { 
    title: "ტანსაცმელი & ფეხსაცმელი", 
    discount: "40%", 
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80", 
    bg: "bg-[#FCE7F3]" 
  },
  { 
    title: "აუდიოტექნიკა", 
    discount: "40%", 
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80", 
    bg: "bg-[#FAE8FF]" 
  },
  { 
    title: "ქართული ბრენდები", 
    discount: "40%", 
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&q=80", 
    bg: "bg-[#FEF3C7]" 
  },
  { 
    title: "სმარტ გაჯეტები", 
    discount: "40%", 
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&q=80", 
    bg: "bg-[#E0E7FF]" 
  },
  { 
    title: "სილამაზის ტექნიკა", 
    discount: "35%", 
    image: "https://images.unsplash.com/photo-1608248597261-e4d31846b0a1?w=400&q=80", 
    bg: "bg-[#FFE4E6]" 
  },
  { 
    title: "სახლის მოვლა", 
    discount: "30%", 
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80", 
    bg: "bg-[#E0F2FE]" 
  },
  { 
    title: "სპორტი & ფიტნესი", 
    discount: "50%", 
    image: "https://images.unsplash.com/photo-1517649763962-0c623266010b?w=400&q=80", 
    bg: "bg-[#ECFDF5]" 
  },
];

export default function PromoCarousel() {
  const swiperRef = useRef<any>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  return (
    <section className="w-full relative">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative overflow-hidden">
          
          {/* Previous Arrow Button (Left) */}
          {!isBeginning && (
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-md border border-gray-200/80 flex items-center justify-center text-black cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
              aria-label="Previous promo slide"
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
            {PROMO_ITEMS.map((item, idx) => (
              <SwiperSlide key={idx} className="!w-64 md:!w-72">
                <div className={`w-64 md:w-72 h-36 rounded-xl ${item.bg} p-5 flex flex-col justify-between relative overflow-hidden select-none cursor-pointer border border-black/5 shadow-2xs`}>
                  <div className="z-10">
                    <div className="inline-flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-full text-[11px] text-orange-600 shadow-2xs mb-2">
                      <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                      <span>{item.discount} -მდე</span>
                    </div>
                    <h3 className="text-sm md:text-base text-black leading-snug max-w-[65%]">
                      {item.title}
                    </h3>
                  </div>

                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute right-[-10px] bottom-[-10px] w-32 h-32 object-cover rounded-full pointer-events-none"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Next Arrow Button (Right) */}
          {!isEnd && (
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-md border border-gray-200/80 flex items-center justify-center text-black cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
              aria-label="Next promo slide"
            >
              <svg width="11" height="16" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.52875 7C8.52086 6.72379 8.41826 6.48704 8.20519 6.27396L2.06539 0.26832C1.88388 0.0947012 1.6708 0 1.41037 0C0.881624 0 0.471252 0.410372 0.471252 0.939121C0.471252 1.19166 0.573845 1.42841 0.755356 1.60992L6.27959 7L0.755356 12.3901C0.573845 12.5716 0.471252 12.8005 0.471252 13.0609C0.471252 13.5896 0.881624 14 1.41037 14C1.66291 14 1.88388 13.9053 2.06539 13.7317L8.20519 7.71815C8.42616 7.51297 8.52875 7.27621 8.52875 7Z" fill="currentColor"></path>
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
