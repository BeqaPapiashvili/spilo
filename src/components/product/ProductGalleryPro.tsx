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

  const displayImages = images && images.length > 0 ? images : ["/placeholder.png"];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Main Gallery Thumbnail Click
  const handleSelectThumbnail = (index: number) => {
    setSelectedIndex(index);
    if (mainSwiperRef.current) {
      mainSwiperRef.current.slideTo(index);
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

  // Lightbox Modal Controls (Completely Isolated from Background)
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
        <div className="inline-flex items-center gap-1.5 p-1 bg-gray-50 rounded-2xl border border-gray-100 self-start shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveMode("photos")}
            className={`py-1.5 px-3 rounded-xl text-xs flex items-center gap-2 transition-all duration-200 cursor-pointer ${
              activeMode === "photos"
                ? "bg-white text-gray-900 shadow-2xs border border-gray-200/80"
                : "text-gray-500 hover:text-gray-900"
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
                ? "bg-white text-gray-900 shadow-2xs border border-gray-200/80"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Play className="size-3.5 text-[#FF5238]" />
            <span>ვიდეო</span>
          </button>
        </div>
      )}

      {/* Main Gallery Layout: Left Thumbnails + Right Swiper Slider */}
      <div className="flex flex-col-reverse md:flex-row gap-3.5 items-start w-full">

        {/* 1. Left Vertical Thumbnails Column (Always visible, even with 1 image) */}
        {activeMode === "photos" && displayImages.length > 0 && (
          <div className="flex flex-row md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[540px] w-full md:w-[72px] lg:w-[82px] shrink-0 custom-sidebar-scrollbar pb-1 md:pb-0 pr-0.5 select-none">
            {displayImages.map((img, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onMouseEnter={() => handleSelectThumbnail(idx)}
                  onClick={() => handleSelectThumbnail(idx)}
                  className={`size-16 md:size-[72px] lg:size-[80px] rounded-2xl border p-1.5 flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-[#FF5238] ring-2 ring-[#FF5238]/20 bg-white"
                      : "border-gray-200/80 hover:border-gray-300 bg-transparent"
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
        )}

        {/* 2. Main Large Image Display (Swiper Slider for Smooth Drag & Click) */}
        <div className="flex-1 relative w-full h-[420px] sm:h-[480px] lg:h-[540px] p-2 flex items-center justify-center overflow-hidden group select-none">

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

          {/* Comfortable Large Navigation Arrows */}
          {activeMode === "photos" && displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMainPrev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 size-11 rounded-full bg-white/95 text-gray-800 border border-gray-200/80 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 cursor-pointer shadow-md"
                title="წინა სურათი"
              >
                <ChevronLeft className="size-6 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMainNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 size-11 rounded-full bg-white/95 text-gray-800 border border-gray-200/80 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 cursor-pointer shadow-md"
                title="შემდეგი სურათი"
              >
                <ChevronRight className="size-6 text-gray-700" />
              </button>
            </>
          )}

        </div>

      </div>

      {/* Premium Lightbox Modal (Independent Swiper, Zero Background Motion) */}
      {mounted && isLightboxOpen && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={handleCloseLightbox}
        >
          {/* Floating White Card Modal */}
          <div
            className="relative max-w-4xl w-full bg-white rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center gap-5 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top-Right Close Button */}
            <button
              type="button"
              onClick={handleCloseLightbox}
              className="absolute -top-3 -right-3 md:-top-4 md:-right-4 size-10 rounded-full bg-[#FF5238] hover:bg-[#EA3A20] text-white shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 z-30"
              title="დახურვა (Esc)"
            >
              <X className="size-5" />
            </button>

            {/* Top-Left Photo Counter Badge */}
            <div className="absolute top-4 left-6 text-xs text-gray-500 bg-gray-100/80 px-3 py-1 rounded-xl">
              {lightboxIndex + 1} / {displayImages.length}
            </div>

            {/* Main Image Viewport with Swiper Touch & Mouse Drag */}
            <div className="relative w-full aspect-4/3 max-h-[55vh] flex items-center justify-center overflow-hidden select-none my-2">
              {/* Left Arrow */}
              {displayImages.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLightboxPrev();
                  }}
                  className="absolute left-1 md:left-3 z-30 size-11 rounded-full bg-white/95 text-gray-800 border border-gray-100 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="წინა ფოტო (←)"
                >
                  <ChevronLeft className="size-6 text-gray-700" />
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
                  className="absolute right-1 md:right-3 z-30 size-11 rounded-full bg-white/95 text-gray-800 border border-gray-100 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="შემდეგი ფოტო (→)"
                >
                  <ChevronRight className="size-6 text-gray-700" />
                </button>
              )}
            </div>

            {/* Bottom Thumbnails Row */}
            {displayImages.length > 0 && (
              <div className="flex items-center gap-2.5 overflow-x-auto p-1 max-w-full scrollbar-none">
                {displayImages.map((img, idx) => {
                  const isSelected = lightboxIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleLightboxSelectThumbnail(idx)}
                      className={`size-14 md:size-16 rounded-xl border p-1.5 bg-white flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-[#FF5238] ring-2 ring-[#FF5238]/20 shadow-2xs"
                          : "border-gray-200 hover:border-gray-300"
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
