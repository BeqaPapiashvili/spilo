"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import {
  Sparkles,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Camera,
  Play
} from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

interface ProductGalleryProProps {
  images: string[];
  title: string;
  discountPercentage?: number;
  isHot?: boolean;
  videoUrl?: string;
}

export function ProductGalleryPro({
  images,
  title,
  discountPercentage,
  isHot,
  videoUrl,
}: ProductGalleryProProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<"photos" | "video">("photos");
  
  const mainSwiperRef = useRef<any>(null);
  const lightboxSwiperRef = useRef<any>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const displayImages = images && images.length > 0 ? images : ["/placeholder.png"];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll active thumbnail into view smoothly without any visible scrollbar
  useEffect(() => {
    if (thumbnailRefs.current[selectedIndex]) {
      thumbnailRefs.current[selectedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [selectedIndex]);

  // Main Gallery Thumbnail Click
  const handleSelectThumbnail = (index: number) => {
    setSelectedIndex(index);
    if (mainSwiperRef.current) {
      mainSwiperRef.current.slideTo(index);
    }
  };

  // Scroll Thumbnails List Manually
  const handleScrollThumbnails = (direction: "prev" | "next") => {
    if (!thumbnailContainerRef.current) return;
    const isDesktop = window.innerWidth >= 768;
    const scrollAmount = isDesktop ? 90 : 80;

    if (direction === "prev") {
      thumbnailContainerRef.current.scrollBy({
        top: isDesktop ? -scrollAmount : 0,
        left: isDesktop ? 0 : -scrollAmount,
        behavior: "smooth",
      });
      setSelectedIndex((prev) => Math.max(0, prev - 1));
      if (mainSwiperRef.current) {
        mainSwiperRef.current.slideTo(Math.max(0, selectedIndex - 1));
      }
    } else {
      thumbnailContainerRef.current.scrollBy({
        top: isDesktop ? scrollAmount : 0,
        left: isDesktop ? 0 : scrollAmount,
        behavior: "smooth",
      });
      setSelectedIndex((prev) => Math.min(displayImages.length - 1, prev + 1));
      if (mainSwiperRef.current) {
        mainSwiperRef.current.slideTo(Math.min(displayImages.length - 1, selectedIndex + 1));
      }
    }
  };

  // Main Gallery Arrows
  const handleMainNext = () => {
    if (mainSwiperRef.current) {
      mainSwiperRef.current.slideNext();
    } else {
      setSelectedIndex((prev) => (prev + 1) % displayImages.length);
    }
  };

  const handleMainPrev = () => {
    if (mainSwiperRef.current) {
      mainSwiperRef.current.slidePrev();
    } else {
      setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    }
  };

  // Lightbox Modal Controls
  const handleOpenLightbox = (index?: number) => {
    const targetIdx = typeof index === "number" ? index : selectedIndex;
    setLightboxIndex(targetIdx);
    setIsLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
  };

  const handleLightboxSelectThumbnail = (index: number) => {
    setLightboxIndex(index);
    if (lightboxSwiperRef.current) {
      lightboxSwiperRef.current.slideTo(index);
    }
  };

  const handleLightboxNext = () => {
    if (lightboxSwiperRef.current) {
      lightboxSwiperRef.current.slideNext();
    } else {
      setLightboxIndex((prev) => (prev + 1) % displayImages.length);
    }
  };

  const handleLightboxPrev = () => {
    if (lightboxSwiperRef.current) {
      lightboxSwiperRef.current.slidePrev();
    } else {
      setLightboxIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    }
  };

  // Keyboard Navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseLightbox();
      } else if (e.key === "ArrowLeft") {
        handleLightboxPrev();
      } else if (e.key === "ArrowRight") {
        handleLightboxNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isLightboxOpen, displayImages.length]);

  return (
    <div className="flex flex-col gap-3.5 sticky top-24">
      
      {/* Mode Switcher pill container (Photos / Video) */}
      {videoUrl && (
        <div className="inline-flex items-center gap-1.5 p-1 bg-zinc-50 rounded-2xl border border-zinc-200/80 self-start shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveMode("photos")}
            className={`py-1.5 px-3 rounded-xl text-xs flex items-center gap-2 transition-all duration-200 cursor-pointer ${
              activeMode === "photos"
                ? "bg-white text-zinc-900 shadow-2xs border border-zinc-200/80"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Camera className="size-3.5 text-[#FF5238]" />
            <span>ფოტოები ({displayImages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("video")}
            className={`py-1.5 px-3 rounded-xl text-xs flex items-center gap-2 transition-all duration-200 cursor-pointer ${
              activeMode === "video"
                ? "bg-white text-zinc-900 shadow-2xs border border-zinc-200/80"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Play className="size-3.5 text-[#FF5238]" />
            <span>ვიდეო</span>
          </button>
        </div>
      )}

      {/* Main Gallery Layout: Left Thumbnails + Right Swiper Slider */}
      <div className="flex flex-col-reverse md:flex-row gap-3.5 items-start w-full">

        {/* 1. Left Vertical Thumbnails Navigation (Scrollbar 100% hidden, smooth micro-arrows) */}
        {activeMode === "photos" && displayImages.length > 0 && (
          <div className="relative flex flex-col items-center w-full md:w-[76px] lg:w-[84px] shrink-0 group/thumbs">
            
            {/* Top Navigation Arrow (Desktop) */}
            {displayImages.length > 4 && (
              <button
                type="button"
                onClick={() => handleScrollThumbnails("prev")}
                disabled={selectedIndex === 0}
                className="hidden md:flex mb-1.5 size-7 rounded-xl bg-white text-zinc-600 border border-zinc-200 items-center justify-center hover:bg-zinc-50 hover:text-[#FF5238] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer z-10"
                title="წინა"
              >
                <ChevronUp className="size-4" />
              </button>
            )}

            {/* Thumbnails Track (Zero ugly scrollbar, perfectly centered & smooth) */}
            <div
              ref={thumbnailContainerRef}
              className="flex flex-row md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[500px] w-full md:w-full py-1 px-1 select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {displayImages.map((img, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={idx}
                    ref={(el) => { thumbnailRefs.current[idx] = el; }}
                    type="button"
                    onMouseEnter={() => handleSelectThumbnail(idx)}
                    onClick={() => handleSelectThumbnail(idx)}
                    className={`size-16 md:size-[68px] lg:size-[76px] rounded-2xl border p-1.5 flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer bg-white relative ${
                      isSelected
                        ? "border-[#FF5238] ring-2 ring-[#FF5238]/20 shadow-2xs"
                        : "border-zinc-200 hover:border-zinc-300 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  </button>
                );
              })}
            </div>

            {/* Bottom Navigation Arrow (Desktop) */}
            {displayImages.length > 4 && (
              <button
                type="button"
                onClick={() => handleScrollThumbnails("next")}
                disabled={selectedIndex === displayImages.length - 1}
                className="hidden md:flex mt-1.5 size-7 rounded-xl bg-white text-zinc-600 border border-zinc-200 items-center justify-center hover:bg-zinc-50 hover:text-[#FF5238] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer z-10"
                title="შემდეგი"
              >
                <ChevronDown className="size-4" />
              </button>
            )}

          </div>
        )}

        {/* 2. Main Large Image Display (Swiper Slider for Smooth Drag & Click) */}
        <div className="flex-1 relative w-full h-[420px] sm:h-[480px] lg:h-[540px] p-2 flex items-center justify-center overflow-hidden group select-none bg-white rounded-3xl border border-zinc-100/80">

          {/* Status Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
            {discountPercentage && discountPercentage > 0 && (
              <span className="bg-[#10B981] text-white text-[11px] px-2.5 py-1 rounded-xl shadow-2xs tracking-tight">
                -{discountPercentage}% ფასდაკლება
              </span>
            )}
            {isHot && (
              <span className="bg-gradient-to-r from-amber-500 to-[#FF5238] text-white text-[11px] px-2.5 py-1 rounded-xl shadow-2xs flex items-center gap-1.5">
                <Sparkles className="size-3" /> პოპულარული
              </span>
            )}
          </div>

          {/* Expand / Lightbox Button */}
          <button
            type="button"
            onClick={() => handleOpenLightbox(selectedIndex)}
            className="absolute top-4 right-4 z-10 size-9 rounded-xl bg-white/90 text-zinc-600 border border-zinc-200/80 flex items-center justify-center shadow-2xs opacity-0 group-hover:opacity-100 hover:text-[#FF5238] hover:bg-white transition-all cursor-pointer"
            title="გადიდება"
          >
            <Maximize2 className="size-4" />
          </button>

          {/* Photos Mode: Real-time Touch & Mouse Swipe via Swiper */}
          {activeMode === "photos" ? (
            <div className="w-full h-full">
              <Swiper
                modules={[Navigation]}
                slidesPerView={1}
                speed={300}
                grabCursor={false}
                onSwiper={(swiper) => {
                  mainSwiperRef.current = swiper;
                }}
                onSlideChange={(swiper) => {
                  setSelectedIndex(swiper.activeIndex);
                }}
                className="w-full h-full cursor-pointer"
              >
                {displayImages.map((img, idx) => (
                  <SwiperSlide key={idx} className="w-full h-full flex items-center justify-center cursor-pointer">
                    <div
                      onClick={() => handleOpenLightbox(idx)}
                      className="w-full h-full flex items-center justify-center cursor-pointer py-2"
                      title="დააკლიკეთ გასადიდებლად"
                    >
                      <img
                        src={img}
                        alt={`${title} - photo ${idx + 1}`}
                        className="max-w-full max-h-[480px] object-contain pointer-events-none transition-transform duration-300 group-hover:scale-102 cursor-pointer"
                        draggable={false}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <iframe
                src={videoUrl}
                title="Product Video"
                className="w-full h-full rounded-2xl border-0"
                allowFullScreen
              />
            </div>
          )}

          {/* Large Navigation Arrows on Hover */}
          {activeMode === "photos" && displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMainPrev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 size-11 rounded-full bg-white/95 text-zinc-800 border border-zinc-200/80 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 cursor-pointer shadow-md"
                title="წინა სურათი"
              >
                <ChevronLeft className="size-6 text-zinc-700" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMainNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 size-11 rounded-full bg-white/95 text-zinc-800 border border-zinc-200/80 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 cursor-pointer shadow-md"
                title="შემდეგი სურათი"
              >
                <ChevronRight className="size-6 text-zinc-700" />
              </button>
            </>
          )}

        </div>

      </div>

      {/* 3. Premium Lightbox Modal */}
      {mounted && isLightboxOpen && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={handleCloseLightbox}
        >
          {/* Floating Card Modal */}
          <div
            className="relative max-w-4xl w-full bg-white rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center gap-5 border border-zinc-100 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header Bar */}
            <div className="w-full flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-900 font-sans truncate max-w-md">{title}</span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  ({lightboxIndex + 1} / {displayImages.length})
                </span>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseLightbox}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                title="დახურვა (Esc)"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Lightbox Main Image Stage */}
            <div className="relative w-full h-[55vh] flex items-center justify-center">
              
              {/* Left Arrow */}
              {displayImages.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLightboxPrev();
                  }}
                  className="absolute left-1 md:left-3 z-30 size-11 rounded-full bg-white/95 text-zinc-800 border border-zinc-200 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="წინა ფოტო (←)"
                >
                  <ChevronLeft className="size-6 text-zinc-700" />
                </button>
              )}

              {/* Swiper Slider inside Lightbox */}
              <div className="w-full h-full">
                <Swiper
                  modules={[Navigation]}
                  slidesPerView={1}
                  speed={300}
                  initialSlide={lightboxIndex}
                  grabCursor={false}
                  onSwiper={(swiper) => {
                    lightboxSwiperRef.current = swiper;
                  }}
                  onSlideChange={(swiper) => {
                    setLightboxIndex(swiper.activeIndex);
                  }}
                  className="w-full h-full cursor-pointer"
                >
                  {displayImages.map((img, idx) => (
                    <SwiperSlide key={idx} className="w-full h-full flex items-center justify-center">
                      <div className="w-full h-full flex items-center justify-center py-2 cursor-pointer">
                        <img
                          src={img}
                          alt={`${title} - photo ${idx + 1}`}
                          className="max-w-full max-h-[50vh] object-contain select-none pointer-events-none"
                          draggable={false}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Right Arrow */}
              {displayImages.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLightboxNext();
                  }}
                  className="absolute right-1 md:right-3 z-30 size-11 rounded-full bg-white/95 text-zinc-800 border border-zinc-200 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="შემდეგი ფოტო (→)"
                >
                  <ChevronRight className="size-6 text-zinc-700" />
                </button>
              )}
            </div>

            {/* Bottom Thumbnails Row (Clean, Scrollbar-Free) */}
            {displayImages.length > 0 && (
              <div className="flex items-center gap-2.5 overflow-x-auto p-1 max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {displayImages.map((img, idx) => {
                  const isSelected = lightboxIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleLightboxSelectThumbnail(idx)}
                      className={`size-14 md:size-16 rounded-2xl border p-1.5 bg-white flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-[#FF5238] ring-2 ring-[#FF5238]/20 shadow-2xs"
                          : "border-zinc-200 hover:border-zinc-300 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain pointer-events-none" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
