"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Check, GitCompare } from "lucide-react";
import { useStore } from "@/store/useStore";

export interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  monthlyInstallment?: number;
  image: string;
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
  discountPercentage,
  stock,
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist, toggleCompare, compareList } = useStore();
  const [isAdded, setIsAdded] = useState(false);

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
        image,
        stock,
      },
      false
    );

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addToCart(
      {
        id,
        title,
        price,
        discountPrice,
        image,
        stock,
      },
      false
    );
    router.push("/checkout");
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
      image,
      discountPercentage,
    });
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(id);
  };

  const currentPrice = discountPrice || price;

  return (
    <div className="group relative flex flex-col h-[350px] w-full bg-white rounded-2xl p-3 select-none cursor-pointer overflow-hidden border border-gray-100/80 shadow-xs hover:shadow-md transition-all justify-between">
      {/* Image Container */}
      <Link
        href={`/product/${id}`}
        className="relative w-full h-[180px] rounded-xl overflow-hidden bg-transparent flex items-center justify-center p-2 block shrink-0"
      >
        {/* Discount Badge or Out of Stock Badge */}
        {isOutOfStock ? (
          <div className="absolute top-2 left-2 z-10 bg-gray-800/90 text-white text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1">
            <span>ამოიწურა</span>
          </div>
        ) : discountPercentage ? (
          <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
            <span>-{discountPercentage}%</span>
          </div>
        ) : null}

        {/* Action icons top right (Wishlist + Compare) */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
          <button
            onClick={handleToggleCompare}
            className={`p-1.5 rounded-md cursor-pointer transition-colors ${
              isCompared
                ? "bg-blue-50 text-blue-600"
                : "bg-gray-100/90 text-gray-400 hover:text-blue-600"
            }`}
            title="შედარება"
          >
            <GitCompare className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 rounded-md cursor-pointer transition-colors ${
              isLiked
                ? "bg-red-50 text-red-500"
                : "bg-gray-100/90 text-gray-400 hover:text-red-500"
            }`}
            title="სურვილების სია"
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          </button>
        </div>

        {/* Product Image */}
        <img
          src={image}
          alt={title}
          className={`w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300 ${
            isOutOfStock ? "opacity-60 grayscale-[40%]" : ""
          }`}
        />
      </Link>

      {/* Product Info */}
      <div className="flex flex-col flex-1 justify-between pt-2 px-1">
        {/* Title Slot */}
        <div className="h-[40px] flex items-start overflow-hidden">
          <Link
            href={`/product/${id}`}
            className="text-xs sm:text-sm text-gray-900 hover:text-blue-600 transition-colors leading-snug line-clamp-2"
          >
            {title}
          </Link>
        </div>

        {/* Pricing & Actions */}
        <div className="space-y-2.5 pt-1">
          {/* Prices Slot */}
          <div className="h-6 flex items-baseline gap-2">
            <span className="text-lg md:text-xl text-gray-900 tracking-tight">
              {currentPrice.toFixed(2)} ₾
            </span>
            {discountPrice && (
              <span className="text-xs text-gray-400 line-through">
                {price.toFixed(2)} ₾
              </span>
            )}
          </div>

          {/* Buttons */}
          {isOutOfStock ? (
            <button
              disabled
              className="w-full h-9 bg-gray-100 text-gray-400 rounded-xl text-xs flex items-center justify-center cursor-not-allowed select-none"
            >
              <span>არ არის მარაგში</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleBuyNow}
                className="flex-1 h-9 bg-[#111111] hover:bg-black text-white rounded-xl text-xs md:text-sm flex items-center justify-center cursor-pointer transition-colors"
              >
                <span>ყიდვა</span>
              </button>

              <button
                onClick={handleAddToCart}
                title="კალათაში დამატება"
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                  isAdded
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-[#F1F5F9] hover:bg-[#E2E8F0] text-gray-800"
                }`}
              >
                {isAdded ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ShoppingBag className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
