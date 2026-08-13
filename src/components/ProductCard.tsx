import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Check, Moon } from "lucide-react";
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
}: ProductCardProps) {
  const router = useRouter();
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
    }, false);

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id,
      title,
      price,
      discountPrice,
      image,
    }, false);
    router.push("/checkout");
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const currentPrice = discountPrice || price;

  return (
    <div className="group relative flex flex-col h-[420px] w-full bg-white rounded-2xl p-3 select-none cursor-pointer overflow-hidden border border-gray-100/80 shadow-xs hover:shadow-md transition-all justify-between">
      
      {/* 1. Image Container - Clicking image opens product detail page */}
      <Link href={`/product/${id}`} className="relative w-full h-[200px] rounded-xl overflow-hidden bg-transparent flex items-center justify-center p-2 block shrink-0">
        
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

        {/* Product Image */}
        <img
          src={image}
          alt={title}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* 2. Product Info Container */}
      <div className="flex flex-col flex-1 justify-between pt-2 px-1">
        
        {/* Title Slot - Clicking title opens product detail page */}
        <div className="h-[40px] flex items-start overflow-hidden">
          <Link 
            href={`/product/${id}`} 
            className="text-xs sm:text-sm text-gray-900 hover:text-blue-600 transition-colors leading-snug line-clamp-2"
          >
            {title}
          </Link>
        </div>

        {/* Bottom Section: Pricing, Installment & Buttons */}
        <div className="space-y-2 pt-2">
          
          {/* Prices Slot - Fixed height h-6 */}
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

          {/* Monthly Installment Slot - Fixed height h-6 */}
          <div className="h-6 flex items-center">
            {monthlyInstallment ? (
              <div className="inline-flex items-center gap-1 bg-[#F5F6F8] text-gray-700 px-2 py-0.5 rounded-md text-[11px]">
                <Moon className="w-3 h-3 text-gray-500" />
                <span>თვეში: {monthlyInstallment} ₾-დან</span>
              </div>
            ) : (
              <div className="h-full" />
            )}
          </div>

          {/* Action Buttons Slot - Fixed height 40px */}
          <div className="flex items-center gap-2 pt-1">
            {/* Main Buy Button - Adds to cart and navigates directly to /checkout */}
            <button
              onClick={handleBuyNow}
              className="flex-1 h-10 bg-[#111111] hover:bg-black text-white rounded-xl text-xs md:text-sm flex items-center justify-center cursor-pointer transition-colors"
            >
              <span>ყიდვა</span>
            </button>

            {/* Cart Icon Button - Adds to cart without navigating */}
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
