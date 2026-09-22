"use client";

import { Zap, ShoppingBag, Check } from "lucide-react";

interface ProductMobileStickyBarProps {
  title: string;
  price: number;
  isAdded: boolean;
  stock?: number;
  onOpenQuickBuy: () => void;
  onAddToCart: () => void;
}

export function ProductMobileStickyBar({
  title,
  price,
  isAdded,
  stock,
  onOpenQuickBuy,
  onAddToCart,
}: ProductMobileStickyBarProps) {
  const isOutOfStock = stock !== undefined && stock <= 0;

  return (
    <div
      className="lg:hidden fixed left-3 right-3 z-40 bg-white/92 backdrop-blur-xl border border-gray-200/80 rounded-[22px] p-2.5 flex items-center justify-between gap-3 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.28)]"
      style={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
    >
      <div className="flex flex-col min-w-0 pl-1">
        <p className="text-[11px] text-gray-500 truncate max-w-[130px] sm:max-w-[200px]">{title}</p>
        <p className="text-sm text-gray-900 tracking-tight font-mono">{price.toFixed(2)} ₾</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isOutOfStock ? (
          <span className="h-11 px-4 rounded-2xl bg-gray-100 text-gray-400 text-xs flex items-center">
            არ არის მარაგში
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={onOpenQuickBuy}
              className="h-11 px-3.5 rounded-2xl bg-[#1D1D1F] text-white text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <Zap className="size-3.5" />
              <span>ყიდვა</span>
            </button>
            <button
              type="button"
              onClick={onAddToCart}
              className={`h-11 px-3.5 rounded-2xl text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all ${
                isAdded
                  ? "bg-emerald-500 text-white"
                  : "bg-[#FF5238] text-white"
              }`}
            >
              {isAdded ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
              <span>{isAdded ? "დაემატა" : "კალათაში"}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
