"use client";

import { useState } from "react";
import {
  Check,
  Heart,
  GitCompare,
  Share2,
  CreditCard,
  Zap,
  ShoppingBag,
  Plus,
  Minus,
  Truck,
  MapPin,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { useStore } from "@/store/useStore";

export interface ProductPurchaseOptions {
  color?: string;
  storage?: string;
  unitPrice?: number;
}

interface ProductPurchasePanelProps {
  product: {
    id: string;
    title: string;
    brandName?: string;
    stock: number;
    sku?: string;
    code?: string;
    price: number;
    discountPrice?: number;
    discountPercentage?: number;
    images: string[];
    variants?: {
      id: string;
      name: string;
      options: { label: string; value: string; colorHex?: string; priceDelta?: number }[];
    }[];
  };
  isLiked: boolean;
  isCompared: boolean;
  isAdded: boolean;
  onToggleWishlist: () => void;
  onToggleCompare: () => void;
  onAddToCart: (qty: number, options?: ProductPurchaseOptions) => void;
  onBuyNow: (qty: number, options?: ProductPurchaseOptions) => void;
}

export function ProductPurchasePanel({
  product,
  isLiked,
  isCompared,
  isAdded,
  onToggleWishlist,
  onToggleCompare,
  onAddToCart,
  onBuyNow,
}: ProductPurchasePanelProps) {
  const { addToast } = useStore();

  const [quantity, setQuantity] = useState(1);

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v) => {
        if (v.options && v.options.length > 0) {
          defaults[v.id] = v.options[0].value;
        }
      });
    }
    return defaults;
  });

  const unitPrice = product.discountPrice || product.price;
  const totalPrice = unitPrice * quantity;
  const savings = product.discountPrice ? (product.price - product.discountPrice) * quantity : 0;
  const discountPercent = product.discountPercentage || (product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `ნახეთ ${product.title} Spilo.ge-ზე`,
          url: window.location.href,
        });
      } catch (e) { }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      addToast({
        title: "ბმული დაკოპირდა!",
        message: "გაზიარების ბმული დაკოპირებულია გაცვლის ბუფერში.",
        type: "success",
      });
    }
  };

  const handleAddToCartClick = () => {
    const colorVal = Object.entries(selectedVariants).find(([k]) => k.toLowerCase().includes("color") || k.includes("ფერ"))?.[1] || Object.values(selectedVariants)[0];
    const storageVal = Object.entries(selectedVariants).find(([k]) => k.toLowerCase().includes("storage") || k.includes("მეხსიერებ") || k.includes("ზომ"))?.[1] || Object.values(selectedVariants)[1];
    onAddToCart(quantity, {
      color: colorVal,
      storage: storageVal,
      unitPrice,
    });
  };

  const handleBuyNowClick = () => {
    const colorVal = Object.entries(selectedVariants).find(([k]) => k.toLowerCase().includes("color") || k.includes("ფერ"))?.[1] || Object.values(selectedVariants)[0];
    const storageVal = Object.entries(selectedVariants).find(([k]) => k.toLowerCase().includes("storage") || k.includes("მეხსიერებ") || k.includes("ზომ"))?.[1] || Object.values(selectedVariants)[1];
    onBuyNow(quantity, {
      color: colorVal,
      storage: storageVal,
      unitPrice,
    });
  };

  return (
    <div className="flex flex-col gap-6">

      {/* 1. Header: Brand, Stock Status & Floating Actions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            {product.brandName && (
              <span className="text-xs text-[#FF5238] bg-[#FFF5F2] ring-1 ring-[#FED7CC] px-3 py-1 rounded-full uppercase tracking-wider">
                {product.brandName}
              </span>
            )}
            {product.stock > 0 ? (
              <span className="text-xs text-emerald-700 bg-emerald-50/80 ring-1 ring-emerald-600/15 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                მარაგშია ({product.stock} ცალი)
              </span>
            ) : (
              <span className="text-xs text-rose-600 bg-rose-50 ring-1 ring-rose-500/20 px-3 py-1 rounded-full">
                მარაგი ამოწურულია
              </span>
            )}
          </div>

          {/* Floating Actions (Wishlist, Compare, Share) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleWishlist}
              className={`size-9 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 ${
                isLiked
                  ? "bg-[#FFF5F2] text-[#FF5238] border-[#FED7CC] shadow-2xs"
                  : "bg-white text-gray-500 border-gray-200/70 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50"
              }`}
              title={isLiked ? "ფავორიტებიდან წაშლა" : "ფავორიტებში დამატება"}
            >
              <Heart className={`size-4 ${isLiked ? "fill-[#FF5238]" : ""}`} />
            </button>

            <button
              type="button"
              onClick={onToggleCompare}
              className={`size-9 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 ${
                isCompared
                  ? "bg-[#FFF5F2] text-[#FF5238] border-[#FED7CC] shadow-2xs"
                  : "bg-white text-gray-500 border-gray-200/70 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50"
              }`}
              title={isCompared ? "შედარებიდან წაშლა" : "შედარება"}
            >
              <GitCompare className="size-4" />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="size-9 rounded-full border border-gray-200/70 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95"
              title="გაზიარება"
            >
              <Share2 className="size-4" />
            </button>
          </div>
        </div>

        {/* Main Product Title */}
        <h1 className="text-2xl lg:text-3xl text-gray-950 leading-snug tracking-tight font-sans">
          {product.title}
        </h1>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>კოდი:</span>
          <span className="font-mono text-gray-600 bg-gray-100/70 px-2 py-0.5 rounded-md">
            {product.sku || product.code || product.id}
          </span>
        </div>
      </div>

      {/* 2. Modern 2026 Price Display */}
      <div className="flex items-baseline justify-between flex-wrap gap-3 pb-3 border-b border-gray-100/80">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl lg:text-4xl text-gray-950 tracking-tight font-sans">
            {totalPrice.toFixed(2)} ₾
          </span>
          {product.discountPrice && (
            <span className="text-base text-gray-400 line-through">
              {(product.price * quantity).toFixed(2)} ₾
            </span>
          )}
          {discountPercent > 0 && (
            <span className="text-xs text-rose-600 bg-rose-50 ring-1 ring-rose-500/20 px-2.5 py-0.5 rounded-full">
              -{discountPercent}% ფასდაკლება
            </span>
          )}
        </div>

        {savings > 0 && (
          <span className="text-xs text-emerald-700 bg-emerald-50/90 ring-1 ring-emerald-600/20 px-3 py-1 rounded-full">
            დაზოგეთ: {savings.toFixed(2)} ₾
          </span>
        )}
      </div>

      {/* 3. Modern Variant Selection (Colors, Storage, Specs) */}
      {product.variants && product.variants.length > 0 && (
        <div className="flex flex-col gap-4 py-1">
          {product.variants.map((v) => {
            const isColorVariant = v.name.toLowerCase().includes("color") || v.name.includes("ფერ");
            return (
              <div key={v.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">{v.name}:</span>
                  <span className="text-gray-950">
                    {v.options.find((o) => o.value === selectedVariants[v.id])?.label || ""}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {v.options.map((opt) => {
                    const isSelected = selectedVariants[v.id] === opt.value;

                    if (isColorVariant && opt.colorHex) {
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSelectedVariants((prev) => ({ ...prev, [v.id]: opt.value }))}
                          className={`size-8.5 rounded-full p-0.5 border transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "border-[#FF5238] ring-2 ring-[#FF5238]/25 scale-105 shadow-2xs"
                              : "border-gray-200/90 hover:scale-105"
                          }`}
                          title={opt.label}
                        >
                          <span
                            className="block w-full h-full rounded-full border border-black/10 shadow-inner"
                            style={{ backgroundColor: opt.colorHex }}
                          />
                        </button>
                      );
                    }

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedVariants((prev) => ({ ...prev, [v.id]: opt.value }))}
                        className={`px-4 py-2 rounded-xl text-xs border transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                          isSelected
                            ? "border-[#FF5238] bg-[#FFF5F2] text-[#FF5238] shadow-2xs"
                            : "border-gray-200/90 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {opt.priceDelta && opt.priceDelta > 0 && (
                          <span className="text-[10px] text-gray-400">+{opt.priceDelta} ₾</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Actions: Ergonomic Quantity Stepper + Solid Primary Buttons */}
      <div className="flex flex-col gap-3">
        {product.stock <= 0 ? (
          <button
            disabled
            className="w-full h-12 bg-gray-100 text-gray-400 rounded-2xl text-sm cursor-not-allowed select-none flex items-center justify-center border border-gray-200"
          >
            მარაგი ამოწურულია
          </button>
        ) : (
          <>
            <div className="flex items-center gap-3">
              {/* Ergonomic Stepper */}
              <div className="flex items-center gap-1 bg-gray-50/90 rounded-2xl p-1 border border-gray-200/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="size-10 rounded-xl bg-white text-gray-700 flex items-center justify-center hover:bg-gray-100 cursor-pointer border border-gray-100 shadow-2xs active:scale-90 transition-all duration-150"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-8 text-center text-xs text-gray-900 select-none">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  className="size-10 rounded-xl bg-white text-gray-700 flex items-center justify-center hover:bg-gray-100 cursor-pointer border border-gray-100 shadow-2xs active:scale-90 transition-all duration-150"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              {/* Solid Primary Add-to-Cart Button */}
              <button
                type="button"
                onClick={handleAddToCartClick}
                className="flex-1 h-12 bg-[#FF5238] hover:bg-[#EA3A20] active:scale-[0.98] text-white rounded-2xl text-sm flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_4px_16px_rgba(255,82,56,0.25)] hover:shadow-[0_6px_22px_rgba(255,82,56,0.35)] transition-all duration-200"
              >
                {isAdded ? (
                  <>
                    <Check className="size-4.5 text-white" />
                    <span>დამატებულია კალათაში</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="size-4.5" />
                    <span>კალათაში დამატება</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct Buy Now Button */}
            <button
              type="button"
              onClick={handleBuyNowClick}
              className="w-full h-12 bg-white hover:bg-[#FFF5F2] active:scale-[0.98] text-[#FF5238] border border-[#FED7CC] hover:border-[#FF5238] rounded-2xl text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
            >
              <Zap className="size-4 text-[#FF5238]" />
              <span>ყიდვა</span>
            </button>
          </>
        )}
      </div>

      {/* 5. Clean Human-Designed Delivery & Pickup Details */}
      <div className="flex flex-col gap-2.5 pt-4 border-t border-gray-100 text-xs text-gray-600">
        <div className="flex items-center gap-2.5">
          <Truck className="size-4 text-gray-400 shrink-0" />
          <span>მიწოდება თბილისში 24 საათში, რეგიონებში 1-2 დღე</span>
        </div>
        <div className="flex items-center gap-2.5">
          <MapPin className="size-4 text-gray-400 shrink-0" />
          <span>უფასო გატანა Spilo-ს ფილიალებიდან</span>
        </div>
        <div className="flex items-center gap-2.5">
          <CreditCard className="size-4 text-gray-400 shrink-0" />
          <span>გადახდა ბარათით ონლაინ ან კურიერთან</span>
        </div>
      </div>

    </div>
  );
}
