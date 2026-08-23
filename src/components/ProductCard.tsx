"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Check, GitCompare } from "lucide-react";
import { useStore } from "@/store/useStore";

export interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  monthlyInstallment?: number;
  image: string;
  images?: string[];
  discountPercentage?: number;
  stock?: number;
}

export default function ProductCard({
  id,
  title,
  price,
  discountPrice,
  monthlyInstallment,
  image,
  images,
  discountPercentage,
  stock,
}: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist, toggleCompare, compareList } = useStore();
  const [isAdded, setIsAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const rawImages = (images && images.length > 0) ? images.filter(Boolean) : [image].filter(Boolean);
  const allImages = rawImages.length > 0 ? rawImages : ["/placeholder.png"];

  const isOutOfStock = stock !== undefined && stock <= 0;
  const isLiked = isInWishlist(id);
  const isCompared = compareList.includes(id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addToCart(
      {
        id,
        title,
        price,
        discountPrice,
        image: allImages[0] || image,
        stock,
      },
      false
    );

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id,
      title,
      price,
      discountPrice,
      monthlyInstallment,
      image: allImages[0] || image,
      discountPercentage,
    });
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(id);
  };

  const currentPrice = discountPrice || price;
  const calculatedInstallment = monthlyInstallment || Math.round(currentPrice / 12);
  const currentDisplayImage = allImages[activeImageIndex] || allImages[0] || image;

  return (
    <div
      onMouseLeave={() => setActiveImageIndex(0)}
      className="group relative flex flex-col h-[405px] w-full bg-white rounded-3xl p-4 select-none cursor-pointer border border-zinc-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] justify-between"
    >
      
      {/* Top Floating Row: Badges & Action Buttons */}
      <div className="flex items-center justify-between w-full z-10">
        <div>
          {discountPercentage ? (
            <span className="text-[11px] text-red-600 bg-red-50 border border-red-200/70 px-2.5 py-0.5 rounded-full">
              -{discountPercentage}%
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleCompare}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isCompared
                ? "text-[#FF5238] bg-[#FFF5F2]"
                : "text-zinc-300 hover:text-zinc-700"
            }`}
            title="შედარება"
          >
            <GitCompare className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isLiked
                ? "text-[#FF5238] bg-[#FFF5F2]"
                : "text-zinc-300 hover:text-zinc-700"
            }`}
            title="სურვილების სია"
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-[#FF5238]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Interactive Product Image Canvas with Hover Segments */}
      <div className="relative w-full h-[200px] flex items-center justify-center p-2 my-auto overflow-hidden">
        
        {/* Main Product Link & Active Image */}
        <Link
          href={`/product/${id}`}
          className="w-full h-full flex items-center justify-center"
        >
          <img
            src={currentDisplayImage}
            alt={title}
            className={`w-full h-full object-contain mix-blend-multiply transition-opacity duration-150 ${
              isOutOfStock ? "opacity-40 grayscale-[40%]" : ""
            }`}
          />
        </Link>

        {/* Hover-triggered Segmented Hover Zones */}
        {allImages.length > 1 && (
          <div className="absolute inset-0 z-10 flex">
            {allImages.map((_, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveImageIndex(idx)}
                className="flex-1 h-full cursor-pointer"
              />
            ))}
          </div>
        )}

        {/* Full-width Segmented Progress Bar (Only on Hover) */}
        {allImages.length > 1 && (
          <div className="absolute bottom-1.5 left-0 right-0 z-20 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="flex items-center gap-1.5 w-full">
              {allImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full flex-1 transition-all duration-200 ${
                    activeImageIndex === idx
                      ? "bg-[#FF5238]"
                      : "bg-black/15"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lower Details & Price/Action Area */}
      <div className="space-y-3 pt-2 z-20">
        
        {/* Title */}
        <Link
          href={`/product/${id}`}
          className="text-xs sm:text-sm text-zinc-800 hover:text-[#FF5238] transition-colors leading-snug line-clamp-2 block h-[38px]"
        >
          {title}
        </Link>

        {/* Price & Action Row (Strictly aligned height & flex) */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 gap-2 min-h-[48px]">
          
          {/* Price Stack */}
          <div className="min-w-0 shrink-0 space-y-0.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg text-zinc-900 tracking-tight whitespace-nowrap">
                {currentPrice.toFixed(2)} ₾
              </span>
              {discountPrice && (
                <span className="text-[11px] text-zinc-400 line-through whitespace-nowrap">
                  {price.toFixed(2)} ₾
                </span>
              )}
            </div>
            
            <p className="text-[11px] text-zinc-400 whitespace-nowrap">
              თვეში {calculatedInstallment} ₾-დან
            </p>
          </div>

          {/* Action Button (Strict shrink-0 & matching height) */}
          <div className="shrink-0">
            {isOutOfStock ? (
              <button
                disabled
                className="h-9.5 px-3 rounded-2xl text-xs bg-zinc-100 text-zinc-400 cursor-not-allowed select-none border border-zinc-200/60 whitespace-nowrap flex items-center justify-center"
              >
                <span>ამოიწურა</span>
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className={`h-9.5 px-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs whitespace-nowrap ${
                  isAdded
                    ? "bg-[#FFF5F2] text-[#FF5238] border border-[#FED7CC]"
                    : "bg-[#18181B] hover:bg-[#FF5238] text-white"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#FF5238]" />
                    <span>დამატებულია</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>კალათაში</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
