import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Check, Moon, Star } from "lucide-react";
import { useStore } from "@/store/useStore";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  monthlyInstallment?: number;
  image: string;
  discountPercentage?: number;
  rating?: number;
}

export default function ProductCard({
  id,
  title,
  price,
  discountPrice,
  monthlyInstallment,
  image,
  discountPercentage,
  rating = 4.9,
}: ProductCardProps) {
  const { addToCart } = useStore();
  const [isLiked, setIsLiked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id,
      title,
      price,
      discountPrice,
      image,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const currentPrice = discountPrice || price;

  return (
    <div className="group relative flex flex-col w-full bg-white rounded-xl p-2 select-none cursor-pointer overflow-hidden border border-gray-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
      
      {/* Image Container - Fixed height, transparent, 100% visible image */}
      <Link href={`/product/${id}`} className="relative w-full h-[220px] rounded-lg overflow-hidden bg-transparent flex items-center justify-center p-2 block">
        
        {/* Discount Badge */}
        {discountPercentage && (
          <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
            <span>-{discountPercentage}%</span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={toggleFavorite}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-md cursor-pointer ${
            isLiked 
              ? "bg-red-50 text-red-500" 
              : "bg-gray-100/90 text-gray-400 hover:text-red-500"
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500" : ""}`} />
        </button>

        {/* Product Image - 100% full image visible without any cropping */}
        <img
          src={image}
          alt={title}
          className="w-full h-full object-contain mix-blend-multiply"
        />
      </Link>

      {/* Product Info - Positioned cleanly below image */}
      <div className="mt-3 flex flex-col flex-1 justify-between space-y-2 px-1">
        
        <div className="space-y-1">
          {/* Title */}
          <Link href={`/product/${id}`} className="block text-xs sm:text-sm text-gray-900 hover:text-blue-600 transition-colors leading-snug line-clamp-2 min-h-[38px]">
            {title}
          </Link>
        </div>

        {/* Pricing & Installment Container */}
        <div className="space-y-2 pt-1">
          
          {/* Prices */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg md:text-xl text-gray-900 tracking-tight">
              {currentPrice.toFixed(2)} ₾
            </span>
            {discountPrice && (
              <span className="text-xs text-gray-400 line-through">
                {price.toFixed(2)} ₾
              </span>
            )}
          </div>

          {/* Monthly Installment Pill */}
          {monthlyInstallment && (
            <div className="inline-flex items-center gap-1 bg-[#F5F6F8] text-gray-700 px-2 py-0.5 rounded-md text-[11px]">
              <Moon className="w-3 h-3 text-gray-500" />
              <span>თვეში: {monthlyInstallment} ₾-დან</span>
            </div>
          )}

          {/* Action Buttons: 1 Main "ყიდვა" text button + 1 Cart SVG icon button side by side */}
          <div className="flex items-center gap-2 pt-1.5">
            {/* Main Buy Button */}
            <Link
              href={`/product/${id}`}
              className="flex-1 h-10 bg-[#111111] hover:bg-black text-white rounded-xl text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>ყიდვა</span>
            </Link>

            {/* Cart Icon Button (SVG only, compact size) */}
            <button
              onClick={handleAddToCart}
              title="კალათაში დამატება"
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
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

        </div>

      </div>
    </div>
  );
}
