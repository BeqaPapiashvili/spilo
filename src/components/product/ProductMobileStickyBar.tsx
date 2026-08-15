"use client";

import { Zap, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProductMobileStickyBarProps {
  title: string;
  price: number;
  isAdded: boolean;
  onOpenQuickBuy: () => void;
  onAddToCart: () => void;
}

export function ProductMobileStickyBar({
  title,
  price,
  isAdded,
  onOpenQuickBuy,
  onAddToCart,
}: ProductMobileStickyBarProps) {
  return (
    <div className="lg:hidden fixed bottom-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200/80 p-3 flex items-center justify-between gap-3 shadow-2xl">
      <div className="flex flex-col min-w-0">
        <p className="text-xs text-gray-900 truncate max-w-[130px] sm:max-w-[200px]">{title}</p>
        <p className="text-sm text-gray-900 tracking-tight">{price.toFixed(2)} ₾</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button onClick={onOpenQuickBuy} variant="primary" size="sm" leftIcon={<Zap className="size-3.5" />}>
          ყიდვა
        </Button>
        <Button
          onClick={onAddToCart}
          variant="secondary"
          size="sm"
          leftIcon={isAdded ? <Check className="size-4 text-emerald-600" /> : <ShoppingBag className="size-4" />}
        >
          {isAdded ? "დაემატა" : "კალათაში"}
        </Button>
      </div>
    </div>
  );
}
