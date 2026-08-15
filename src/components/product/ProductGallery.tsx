"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  title: string;
  discountPercentage?: number;
  isHot?: boolean;
}

export function ProductGallery({
  images,
  title,
  discountPercentage,
  isHot,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const displayImages = images && images.length > 0 ? images : ["/placeholder.png"];

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Display Container */}
      <div className="relative aspect-4/3 w-full bg-gray-50/80 rounded-3xl border border-gray-100 p-6 flex items-center justify-center overflow-hidden shadow-2xs group">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          {discountPercentage && discountPercentage > 0 && (
            <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-xl shadow-xs">
              -{discountPercentage}%
            </span>
          )}
          {isHot && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-xl shadow-xs flex items-center gap-1">
              <Sparkles className="size-3.5" /> HOT
            </span>
          )}
        </div>

        {/* Expand / Lightbox Trigger Button */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-4 right-4 z-10 size-10 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-200 text-gray-700 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-white cursor-pointer shadow-xs"
          title="გადიდება"
        >
          <Maximize2 className="size-4" />
        </button>

        {/* Main Image with Motion Transition */}
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            src={displayImages[selectedIndex]}
            alt={`${title} - image ${selectedIndex + 1}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full object-contain mix-blend-multiply cursor-pointer group-hover:scale-105 transition-transform duration-500"
            onClick={() => setIsLightboxOpen(true)}
          />
        </AnimatePresence>

        {/* Navigation Arrows for Main Gallery (if multiple images) */}
        {displayImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 text-gray-700 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-white cursor-pointer shadow-xs"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 text-gray-700 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-white cursor-pointer shadow-xs"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {displayImages.map((img, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`size-20 rounded-2xl border bg-gray-50/80 p-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? "border-blue-600 ring-2 ring-blue-500/20 bg-white"
                    : "border-gray-200 hover:border-gray-300 hover:bg-white"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 size-11 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="size-6" />
          </button>

          {displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 size-12 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="size-7" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 size-12 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="size-7" />
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[85vh] w-full flex items-center justify-center p-4">
            <img
              src={displayImages[selectedIndex]}
              alt={title}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
