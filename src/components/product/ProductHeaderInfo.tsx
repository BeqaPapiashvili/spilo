"use client";

import { Check, Heart, GitCompare, Share2 } from "lucide-react";
import { useStore } from "@/store/useStore";

interface ProductHeaderInfoProps {
  product: {
    id: string;
    title: string;
    brandName?: string;
    stock: number;
    sku?: string;
    code?: string;
    price: number;
    discountPrice?: number;
    images: string[];
  };
  isLiked: boolean;
  isCompared: boolean;
  onToggleWishlist: () => void;
  onToggleCompare: () => void;
}

export function ProductHeaderInfo({
  product,
  isLiked,
  isCompared,
  onToggleWishlist,
  onToggleCompare,
}: ProductHeaderInfoProps) {
  const { addToast } = useStore();

  const handleShare = async () => {
    const shareData = {
      title: product.title,
      text: `ნახეთ ${product.title} Spilo.ge-ზე`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      addToast({
        title: "ბმული დაკოპირდა!",
        message: "პროდუქტის ბმული დაკოპირდა გაზიარებისთვის",
        type: "success",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Brand, Stock & SKU Top Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {product.brandName && (
            <span className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-xl uppercase tracking-wider border border-blue-100">
              {product.brandName}
            </span>
          )}
          {product.stock > 0 ? (
            <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl flex items-center gap-1.5 border border-emerald-100">
              <Check className="size-3.5" /> მარაგშია ({product.stock} ცალი)
            </span>
          ) : (
            <span className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-xl border border-red-100">
              მარაგი ამოწურულია
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>SKU: {product.sku || product.code || product.id}</span>
        </div>
      </div>

      {/* Product Title */}
      <h1 className="text-xl md:text-2xl text-gray-900 leading-snug tracking-tight">
        {product.title}
      </h1>

      {/* Interactive Share/Compare Row */}
      <div className="flex items-center justify-end flex-wrap gap-3 pb-2 border-b border-gray-100">
        {/* Quick Action Badges */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleWishlist}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
              isLiked
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
            title="ფავორიტებში დამატება"
          >
            <Heart className={`size-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            <span className="hidden sm:inline">{isLiked ? "ფავორიტი" : "ფავორიტები"}</span>
          </button>

          <button
            type="button"
            onClick={onToggleCompare}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
              isCompared
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
            title="შედარება"
          >
            <GitCompare className="size-4" />
            <span className="hidden sm:inline">{isCompared ? "შედარებულია" : "შედარება"}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-xs transition-all cursor-pointer"
            title="გაზიარება"
          >
            <Share2 className="size-4" />
            <span className="hidden sm:inline">გაზიარება</span>
          </button>
        </div>
      </div>
    </div>
  );
}
