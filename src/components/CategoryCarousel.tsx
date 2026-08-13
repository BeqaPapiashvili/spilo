"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Mousewheel } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

import { 
  Tv, 
  Sparkles, 
  Home, 
  Gift, 
  Shirt, 
  Gamepad2, 
  Dog, 
  Baby, 
  SprayCan, 
  Dumbbell, 
  BookOpen, 
  Wine, 
  Wrench, 
  Car, 
  Flag, 
  PenTool, 
  ShoppingBag, 
  Briefcase 
} from "lucide-react";

const CATEGORIES = [
  { 
    title: "სასაჩუქრე ვაუჩერები", 
    isVoucher: true,
  },
  { 
    title: "ტექნიკა", 
    icon: Tv,
  },
  { 
    title: "სილამაზე & მოვლა", 
    icon: Sparkles,
  },
  { 
    title: "სახლი & ეზო", 
    icon: Home,
  },
  { 
    title: "საჩუქრები", 
    icon: Gift,
  },
  { 
    title: "ტანსაცმელი & აქსესუარები", 
    icon: Shirt,
  },
  { 
    title: "სათამაშოები", 
    icon: Gamepad2,
  },
  { 
    title: "ცხოველების მოვლა", 
    icon: Dog,
  },
  { 
    title: "მშობელი & ბავშვი", 
    icon: Baby,
  },
  { 
    title: "სახლის მოვლა", 
    icon: SprayCan,
  },
  { 
    title: "სპორტი & მოგზაურობა", 
    icon: Dumbbell,
  },
  { 
    title: "წიგნები", 
    icon: BookOpen,
  },
  { 
    title: "ბარი & მეტი", 
    icon: Wine,
  },
  { 
    title: "რემონტი & ხელსაწყოები", 
    icon: Wrench,
  },
  { 
    title: "ავტო & მოტო", 
    icon: Car,
  },
  { 
    title: "მხოლოდ ქართული", 
    icon: Flag,
  },
  { 
    title: "საკანცელარიო & კრაფტი", 
    icon: PenTool,
  },
  { 
    title: "ყოველდღიური საყიდლები", 
    icon: ShoppingBag,
  },
  { 
    title: "ველი ბიზნესი", 
    icon: Briefcase,
  },
];

export default function CategoryCarousel() {
  const swiperRef = useRef<any>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  return (
    <section className="w-full pt-6 relative">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-3 relative">
          
          {/* Black Menu Button */}
          <button className="shrink-0 w-[130px] sm:w-[145px] h-[160px] bg-[#111111] text-white rounded-xl p-4 flex flex-col justify-between items-center text-center cursor-pointer shadow-xs select-none z-10">
            <div className="flex-1 flex items-center justify-center pt-2">
              <svg width="24" height="16" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.84375 2.0625H16.0938C16.3646 2.0625 16.5938 1.96875 16.7812 1.78125C16.974 1.58854 17.0703 1.35677 17.0703 1.08594C17.0703 0.815104 16.9766 0.585938 16.7891 0.398438C16.6016 0.205729 16.3698 0.109375 16.0938 0.109375H6.84375C6.57292 0.109375 6.34115 0.203125 6.14844 0.390625C5.96094 0.578125 5.86719 0.809896 5.86719 1.08594C5.86719 1.35677 5.96094 1.58854 6.14844 1.78125C6.33594 1.96875 6.56771 2.0625 6.84375 2.0625ZM6.84375 6.78125H16.0938C16.3646 6.78125 16.5938 6.6875 16.7812 6.5C16.974 6.3125 17.0703 6.08073 17.0703 5.80469C17.0703 5.53385 16.9766 5.30469 16.7891 5.11719C16.6016 4.92448 16.3698 4.82812 16.0938 4.82812H6.84375C6.57292 4.82812 6.34115 4.92188 6.14844 5.10938C5.96094 5.29688 5.86719 5.52865 5.86719 5.80469C5.86719 6.07552 5.96094 6.30729 6.14844 6.5C6.33594 6.6875 6.56771 6.78125 6.84375 6.78125ZM6.84375 11.5H16.0938C16.3646 11.5 16.5938 11.4062 16.7812 11.2188C16.974 11.0312 17.0703 10.7995 17.0703 10.5234C17.0703 10.2526 16.9766 10.0234 16.7891 9.83594C16.6016 9.64323 16.3698 9.54688 16.0938 9.54688H6.84375C6.57292 9.54688 6.34115 9.64323 6.14844 9.83594C5.96094 10.0234 5.86719 10.2526 5.86719 10.5234C5.86719 10.7943 5.96094 11.0234 6.14844 11.2109C6.33594 11.4036 6.56771 11.5 6.84375 11.5ZM2.00781 2.17188H3.27344C3.57552 2.17188 3.83333 2.0651 4.04688 1.85156C4.26042 1.63802 4.36719 1.38281 4.36719 1.08594C4.36719 0.783854 4.26042 0.528646 4.04688 0.320312C3.83333 0.106771 3.57552 0 3.27344 0H2.00781C1.71094 0 1.45573 0.106771 1.24219 0.320312C1.02865 0.528646 0.921875 0.783854 0.921875 1.08594C0.921875 1.38281 1.02865 1.63802 1.24219 1.85156C1.45573 2.0651 1.71094 2.17188 2.00781 2.17188ZM2.00781 6.89062H3.27344C3.57552 6.89062 3.83333 6.78646 4.04688 6.57812C4.26042 6.36458 4.36719 6.10677 4.36719 5.80469C4.36719 5.50781 4.26042 5.2526 4.04688 5.03906C3.83333 4.82552 3.57552 4.71875 3.27344 4.71875H2.00781C1.71094 4.71875 1.45573 4.82552 1.24219 5.03906C1.02865 5.2526 0.921875 5.50781 0.921875 5.80469C0.921875 6.10677 1.02865 6.36458 1.24219 6.57812C1.45573 6.78646 1.71094 6.89062 2.00781 6.89062ZM2.00781 11.6094H3.27344C3.57552 11.6094 3.83333 11.5026 4.04688 11.2891C4.26042 11.0807 4.36719 10.8255 4.36719 10.5234C4.36719 10.2266 4.26042 9.97135 4.04688 9.75781C3.83333 9.54427 3.57552 9.4375 3.27344 9.4375H2.00781C1.71094 9.4375 1.45573 9.54427 1.24219 9.75781C1.02865 9.97135 0.921875 10.2266 0.921875 10.5234C0.921875 10.8255 1.02865 11.0807 1.24219 11.2891C1.45573 11.5026 1.71094 11.6094 2.00781 11.6094Z" fill="currentColor"></path>
              </svg>
            </div>
            <h4 className="text-sm text-white leading-tight pb-1">
              ყველა კატეგორია
            </h4>
          </button>

          {/* Swiper Container */}
          <div className="flex-1 relative overflow-hidden">
            
            {/* Previous Arrow Button (Left) */}
            {!isBeginning && (
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-md border border-gray-200/80 flex items-center justify-center text-black cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
                aria-label="Previous slide"
              >
                <svg width="11" height="16" viewBox="0 0 9 14" fill="none" className="rotate-180">
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
              {CATEGORIES.map((cat, idx) => {
                const IconComponent = cat.icon;

                return (
                  <SwiperSlide key={idx} className="!w-[130px] sm:!w-[145px]">
                    <div className="w-[130px] sm:w-[145px] h-[160px] bg-[#EAECEF] rounded-xl p-3.5 flex flex-col justify-between items-start cursor-pointer relative overflow-hidden select-none">
                      <h4 className="text-xs sm:text-sm text-[#111111] leading-tight pt-0.5 z-10 text-left">
                        {cat.title}
                      </h4>

                      {cat.isVoucher ? (
                        <div className="w-[95px] h-[75px] absolute bottom-2 right-2 rotate-[-8deg] pointer-events-none">
                          <div className="w-full h-full bg-[#2563EB] rounded-lg p-2 flex flex-col justify-between shadow-xs text-white border border-white/20">
                            <div className="flex justify-between items-center text-[9px]">
                              <span>spilo</span>
                              <span>★</span>
                            </div>
                            <div className="text-left text-lg tracking-tighter leading-none">
                              100₾
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute bottom-1.5 right-1.5 w-14 h-14 flex items-end justify-end pointer-events-none opacity-40 text-black">
                          {IconComponent && <IconComponent className="w-12 h-12 stroke-[1.6]" />}
                        </div>
                      )}
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* Next Arrow Button (Right) */}
            {!isEnd && (
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-md border border-gray-200/80 flex items-center justify-center text-black cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
                aria-label="Next slide"
              >
                <svg width="11" height="16" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
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
