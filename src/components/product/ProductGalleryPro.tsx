"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Play
} from "lucide-react";

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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<"photos" | "video">("photos");

  const displayImages = images && images.length > 0 ? images : ["/placeholder.png"];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  // Keyboard Navigation (ESC to close, Left/Right arrows to switch photos)
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev + 1) % displayImages.length);
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
    <div className="flex flex-col gap-4 sticky top-24">
      {/* Mode Switcher pill container aligned with site design system */}
      {videoUrl && (
        <div className="inline-flex items-center gap-1.5 p-1.5 bg-gray-100/70 backdrop-blur-md rounded-2xl border border-gray-200/60 self-start shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveMode("photos")}
            className={`py-1.5 px-3.5 rounded-xl text-xs flex items-center gap-2 transition-all duration-200 cursor-pointer ${
              activeMode === "photos"
                ? "bg-white text-gray-900 shadow-xs border border-gray-200/80"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Camera className="size-3.5 text-blue-600" />
            <span>ფოტოები ({displayImages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("video")}
            className={`py-1.5 px-3.5 rounded-xl text-xs flex items-center gap-2 transition-all duration-200 cursor-pointer ${
              activeMode === "video"
                ? "bg-white text-gray-900 shadow-xs border border-gray-200/80"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Play className="size-3.5 text-purple-600" />
            <span>ვიდეო მიმოხილვა</span>
          </button>
        </div>
      )}

      {/* Main Display Container */}
      <div className="relative aspect-4/3 w-full bg-gradient-to-br from-slate-50/80 via-white to-blue-50/30 rounded-3xl border border-gray-200/60 p-6 flex items-center justify-center overflow-hidden shadow-xs group">
        
        {/* Status Badges */}
        <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
          {discountPercentage && discountPercentage > 0 && (
            <span className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-xl shadow-xs tracking-tight">
              -{discountPercentage}% ფასდაკლება
            </span>
          )}
          {isHot && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-xl shadow-xs flex items-center gap-1.5">
              <Sparkles className="size-3.5" /> პოპულარული
            </span>
          )}
        </div>

        {/* Fullscreen Lightbox Button */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-5 right-5 z-10 size-10 rounded-2xl bg-white/90 backdrop-blur-md border border-gray-200/80 text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-white cursor-pointer shadow-xs"
          title="სრულ ეკრანზე ნახვა"
        >
          <Maximize2 className="size-4" />
        </button>

        {/* Display Image */}
        {activeMode === "photos" ? (
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedIndex}
              src={displayImages[selectedIndex]}
              alt={`${title} - photo ${selectedIndex + 1}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full object-contain cursor-pointer transition-transform duration-300 group-hover:scale-102"
              onClick={() => setIsLightboxOpen(true)}
            />
          </AnimatePresence>
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

        {/* Gallery Carousel Arrows */}
        {activeMode === "photos" && displayImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 size-10 rounded-2xl bg-white/90 backdrop-blur-md border border-gray-200/80 text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-white cursor-pointer shadow-xs"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 size-10 rounded-2xl bg-white/90 backdrop-blur-md border border-gray-200/80 text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-white cursor-pointer shadow-xs"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Carousel */}
      {activeMode === "photos" && displayImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {displayImages.map((img, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`size-20 rounded-2xl border bg-slate-50/60 p-2 flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-blue-600 ring-2 ring-blue-500/20 bg-white shadow-xs"
                    : "border-gray-200/80 hover:border-gray-300 hover:bg-white"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Premium Lightbox Modal Matched to Spilo Site Brand Colors */}
      {mounted && isLightboxOpen && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-black/65 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Floating White Card Modal */}
          <div 
            className="relative max-w-4xl w-full bg-white rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col items-center gap-6 border border-gray-100/80"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top-Right Circular Brand Blue Close Button */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-3 -right-3 md:-top-4 md:-right-4 size-10 md:size-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 z-30"
              title="დახურვა (Esc)"
            >
              <X className="size-5 md:size-6" />
            </button>

            {/* Top-Left Photo Counter Badge */}
            <div className="absolute top-4 left-6 text-xs text-gray-500 bg-gray-100/80 px-3 py-1 rounded-xl">
              {selectedIndex + 1} / {displayImages.length}
            </div>

            {/* Main Image Viewport with Chevron Navigation */}
            <div className="relative w-full aspect-4/3 max-h-[60vh] flex items-center justify-center overflow-hidden select-none my-2">
              {/* Left Arrow */}
              {displayImages.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-1 md:left-3 z-20 p-2 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                  title="წინა ფოტო (←)"
                >
                  <ChevronLeft className="size-8 md:size-10 stroke-[2.5]" />
                </button>
              )}

              {/* Center Image Display */}
              <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedIndex}
                    src={displayImages[selectedIndex]}
                    alt={title}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.15 }}
                    className="max-w-full max-h-[55vh] object-contain select-none"
                    draggable={false}
                  />
                </AnimatePresence>
              </div>

              {/* Right Arrow */}
              {displayImages.length > 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-1 md:right-3 z-20 p-2 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                  title="შემდეგი ფოტო (→)"
                >
                  <ChevronRight className="size-8 md:size-10 stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Bottom Thumbnails Row (Matched to Spilo Blue Brand Color) */}
            {displayImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto p-1 max-w-full scrollbar-none">
                {displayImages.map((img, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      className={`size-16 md:size-20 rounded-2xl border p-1.5 bg-white flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-blue-600 ring-2 ring-blue-500/20 shadow-xs"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain" />
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
