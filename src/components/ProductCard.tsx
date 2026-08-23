"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Check, GitCompare } from "lucide-react";
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
  rating?: number;
  reviewsCount?: number;
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
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist, toggleCompare, compareList } = useStore();
  const [mounted, setMounted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rawImages = (images && images.length > 0) ? images.filter(Boolean) : [image].filter(Boolean);
  const allImages = rawImages.length > 0 ? rawImages : ["/placeholder.png"];

  const isOutOfStock = stock !== undefined && stock <= 0;
  const isLiked = mounted ? isInWishlist(id) : false;
  const isCompared = mounted ? compareList.includes(id) : false;

  // Installment calculation fallback
  const currentPrice = discountPrice || price;
  const calculatedMonthly = monthlyInstallment || Math.round(currentPrice / 12);
  const effectiveDiscount = discountPercentage || (discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0);
  const currentDisplayImage = allImages[activeImageIndex] || allImages[0] || image;

  // Navigate to product page on entire card click
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Don't navigate if clicked on action buttons
    if (target.closest("button")) {
      return;
    }
    router.push(`/product/${id}`);
  };

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
      monthlyInstallment: calculatedMonthly,
      image: allImages[0] || image,
      discountPercentage,
    });
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(id);
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseLeave={() => setActiveImageIndex(0)}
      className="group relative flex flex-col h-[380px] w-full bg-white rounded-[24px] p-4 select-none cursor-pointer border border-zinc-200/70 hover:border-zinc-300/80 transition-all duration-200 justify-between shadow-2xs hover:shadow-xs"
    >
      
      {/* Top Section: Image Area with Floating Hover Actions */}
      <div className="relative w-full h-[190px] flex items-center justify-center p-2 overflow-hidden rounded-2xl cursor-pointer">
        
        {/* Top-Right Floating Actions: Wishlist & Compare */}
        <div className="absolute top-1 right-1 z-30 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full transition-all duration-150 cursor-pointer shadow-xs ${
              isLiked
                ? "bg-[#FFF5F2] text-[#FF5238]"
                : "bg-white/90 backdrop-blur-xs text-zinc-400 hover:text-zinc-800 hover:bg-white"
            }`}
            title="სურვილების სია"
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-[#FF5238]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleToggleCompare}
            className={`p-2 rounded-full transition-all duration-150 cursor-pointer shadow-xs ${
              isCompared
                ? "bg-[#FFF5F2] text-[#FF5238]"
                : "bg-white/90 backdrop-blur-xs text-zinc-400 hover:text-zinc-800 hover:bg-white"
            }`}
            title="შედარება"
          >
            <GitCompare className="w-4 h-4" />
          </button>
        </div>

        {/* Product Image Stage */}
        <div className="w-full h-full flex items-center justify-center cursor-pointer pointer-events-none">
          <img
            src={currentDisplayImage}
            alt={title}
            className={`w-full h-full object-contain mix-blend-multiply transition-opacity duration-150 ${
              isOutOfStock ? "opacity-40 grayscale-[40%]" : ""
            }`}
          />
        </div>

        {/* Hover-triggered Segmented Hover Zones */}
        {allImages.length > 1 && (
          <div className="absolute inset-0 z-10 flex cursor-pointer">
            {allImages.map((_, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveImageIndex(idx)}
                className="flex-1 h-full cursor-pointer"
              />
            ))}
          </div>
        )}

        {/* Segmented Progress Bar at the Bottom of Image (Only on Hover) */}
        {allImages.length > 1 && (
          <div className="absolute bottom-1 left-0 right-0 z-20 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
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

      {/* Lower Content: Discount Badge, Price, Title, Installment */}
      <div className="space-y-2 pt-1 flex-1 flex flex-col justify-end cursor-pointer">
        
        {/* Price & Action Row (With Discount Badge) */}
        <div className="flex items-center justify-between gap-2 min-h-[44px] relative">
          
          {/* Price Stack */}
          <div className="min-w-0 flex-1 space-y-0.5">
            {effectiveDiscount > 0 && (
              <div>
                <span className="inline-block text-[11px] bg-[#10B981] text-white px-2 py-0.5 rounded-md leading-none">
                  -{effectiveDiscount}%
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-lg sm:text-xl text-zinc-900 tracking-tight whitespace-nowrap">
                {currentPrice.toFixed(0)} ₾
              </span>
              {discountPrice && (
                <span className="text-xs text-zinc-400 line-through whitespace-nowrap">
                  {price.toFixed(0)} ₾
                </span>
              )}
            </div>
          </div>

          {/* Red/Coral Cart Button (Appears on Hover) */}
          <div className="shrink-0">
            {isOutOfStock ? (
              <span className="text-[11px] text-zinc-400 bg-zinc-100 px-2 py-1 rounded-lg">
                ამოიწურა
              </span>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 shadow-sm opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 active:scale-95 ${
                  isAdded
                    ? "bg-[#10B981] text-white"
                    : "bg-[#FF5238] hover:bg-[#EA3A20] text-white"
                }`}
                title={isAdded ? "დამატებულია" : "კალათაში დამატება"}
              >
                {isAdded ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <ShoppingCart className="w-5 h-5 fill-white" />
                )}
              </button>
            )}
          </div>

        </div>

        {/* Product Title */}
        <h3 className="text-xs sm:text-[13px] text-zinc-700 group-hover:text-[#FF5238] transition-colors leading-snug line-clamp-2 block min-h-[34px]">
          {title}
        </h3>

        {/* Clean Installment & Stock Row */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-[11px]">
          {calculatedMonthly > 0 && currentPrice >= 50 ? (
            <span className="text-zinc-500 font-mono">
              თვეში <span className="text-zinc-900">{calculatedMonthly} ₾</span>-დან
            </span>
          ) : (
            <span className="text-zinc-400">სტანდარტული ფასი</span>
          )}

          {isOutOfStock ? (
            <span className="text-zinc-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
              ამოწურულია
            </span>
          ) : (
            <span className="text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              მარაგშია
            </span>
          )}
        </div>

      </div>

    </div>
  );
}
