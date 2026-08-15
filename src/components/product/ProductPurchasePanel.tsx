"use client";

import { useState } from "react";
import { 
  Check, 
  Heart, 
  GitCompare, 
  Share2, 
  Moon, 
  CreditCard, 
  Zap, 
  ShoppingBag, 
  Bell, 
  Plus, 
  Minus,
  ShieldCheck,
  Building2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/store/useStore";

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
  onAddToCart: (qty: number) => void;
  onOpenQuickBuy: (qty: number) => void;
}

export function ProductPurchasePanel({
  product,
  isLiked,
  isCompared,
  isAdded,
  onToggleWishlist,
  onToggleCompare,
  onAddToCart,
  onOpenQuickBuy,
}: ProductPurchasePanelProps) {
  const { addToast } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [purchaseMode, setPurchaseMode] = useState<"direct" | "installment">("direct");
  const [selectedBank, setSelectedBank] = useState<"TBC" | "BOG" | "Credo" | "Space">("TBC");
  const [installmentMonths, setInstallmentMonths] = useState<number>(12);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [hasExtraProtection, setHasExtraProtection] = useState(false);
  const [isPriceAlertActive, setIsPriceAlertActive] = useState(false);

  const unitPrice = product.discountPrice || product.price;
  const protectionFee = hasExtraProtection ? 29 : 0;
  const totalPrice = (unitPrice + protectionFee) * quantity;
  const monthlyInstallment = (totalPrice / installmentMonths).toFixed(2);
  const savings = product.discountPrice ? (product.price - product.discountPrice) * quantity : 0;

  const handlePriceAlertToggle = () => {
    setIsPriceAlertActive(!isPriceAlertActive);
    addToast({
      title: !isPriceAlertActive ? "შეტყობინება ჩაირთო" : "შეტყობინება გაითიშა",
      message: !isPriceAlertActive
        ? "შეგატყობინებთ ფასის დაკლებისთანავე!"
        : "ფასის დაკლების შეტყობინება გაუქმებულია.",
      type: "info",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `ნახეთ ${product.title} Spilo.ge-ზე`,
          url: window.location.href,
        });
      } catch (e) {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      addToast({
        title: "ბმული დაკოპირდა!",
        message: "გაზიარების ბმული დაკოპირებულია გაცვლის ბუფერში.",
        type: "success",
      });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* Brand, Stock Urgency & SKU Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {product.brandName && (
            <span className="text-xs text-blue-700 bg-blue-50/80 px-3 py-1 rounded-xl uppercase tracking-wider border border-blue-100/80">
              {product.brandName}
            </span>
          )}
          {product.stock > 0 ? (
            <span className="text-xs text-emerald-700 bg-emerald-50/80 px-3 py-1 rounded-xl flex items-center gap-1.5 border border-emerald-100/80">
              <Clock className="size-3.5" /> მარაგშია (მხოლოდ {product.stock} ცალი)
            </span>
          ) : (
            <span className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-xl border border-red-100">
              მარაგი ამოწურულია
            </span>
          )}
        </div>

        <span className="text-xs text-gray-400">SKU: {product.sku || product.code || product.id}</span>
      </div>

      {/* Main Title */}
      <h1 className="text-xl md:text-2xl text-gray-900 leading-snug tracking-tight">
        {product.title}
      </h1>

      {/* Quick Actions Bar - Clean Borderless Human Layout */}
      <div className="flex items-center gap-6 pb-3 border-b border-gray-100/80 text-xs text-gray-500">
        <button
          type="button"
          onClick={onToggleWishlist}
          className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
            isLiked ? "text-red-500" : "hover:text-gray-900"
          }`}
        >
          <Heart className={`size-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          <span>{isLiked ? "ფავორიტი" : "ფავორიტები"}</span>
        </button>

        <button
          type="button"
          onClick={onToggleCompare}
          className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
            isCompared ? "text-blue-600" : "hover:text-gray-900"
          }`}
        >
          <GitCompare className="size-4" />
          <span>{isCompared ? "შედარებულია" : "შედარება"}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <Share2 className="size-4" />
          <span>გაზიარება</span>
        </button>
      </div>

      {/* Primary Price Card */}
      <div className="p-5 bg-gradient-to-br from-gray-50/90 via-white to-slate-50/70 rounded-3xl border border-gray-200/60 shadow-2xs flex flex-col gap-3">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl text-gray-900 tracking-tight">
              {totalPrice.toFixed(2)} ₾
            </span>
            {product.discountPrice && (
              <span className="text-sm text-gray-400 line-through">
                {(product.price * quantity).toFixed(2)} ₾
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {savings > 0 && (
              <span className="text-xs text-emerald-700 bg-emerald-50/90 border border-emerald-100 px-3 py-1 rounded-xl">
                დაზოგეთ: {savings.toFixed(2)} ₾
              </span>
            )}
            <button
              type="button"
              onClick={handlePriceAlertToggle}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isPriceAlertActive
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
              title="ფასის დაკლების შეტყობინება"
            >
              <Bell className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2.5">
          <span className="flex items-center gap-1.5">
            <CreditCard className="size-3.5 text-blue-600" /> დღგ ჩათვლილია
          </span>
          <span className="text-emerald-600 flex items-center gap-1">
            <Check className="size-3.5" /> საუკეთესო ფასის გარანტია
          </span>
        </div>
      </div>

      {/* Purchase Mode Switcher */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100/70 backdrop-blur-md rounded-2xl border border-gray-200/60">
          <button
            type="button"
            onClick={() => setPurchaseMode("direct")}
            className={`py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
              purchaseMode === "direct"
                ? "bg-white text-gray-900 shadow-xs border border-gray-200/80"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Zap className="size-3.5 text-blue-600" />
            <span>პირდაპირი ყიდვა</span>
          </button>
          <button
            type="button"
            onClick={() => setPurchaseMode("installment")}
            className={`py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
              purchaseMode === "installment"
                ? "bg-white text-gray-900 shadow-xs border border-gray-200/80"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Moon className="size-3.5 text-purple-600" />
            <span>0% ონლაინ განვადება</span>
          </button>
        </div>

        {/* 0% Installment Bank Hub Calculator */}
        {purchaseMode === "installment" && (
          <div className="p-4 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/20 rounded-3xl border border-purple-100/70 flex flex-col gap-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-900 flex items-center gap-1.5">
                <Building2 className="size-3.5 text-purple-600" /> აირჩიეთ ბანკი:
              </span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                0% ეფექტური
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(["TBC", "BOG", "Credo", "Space"] as const).map((bank) => (
                <button
                  key={bank}
                  type="button"
                  onClick={() => setSelectedBank(bank)}
                  className={`py-2 rounded-xl text-xs border transition-all duration-200 cursor-pointer flex items-center justify-center ${
                    selectedBank === bank
                      ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {bank}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <span className="text-gray-500">ვადა (თვე):</span>
              <div className="grid grid-cols-5 gap-1.5">
                {[3, 6, 12, 24, 36].map((months) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setInstallmentMonths(months)}
                    className={`py-1.5 rounded-xl text-xs border transition-all duration-200 cursor-pointer ${
                      installmentMonths === months
                        ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {months} თვე
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-purple-100 flex items-center justify-between text-xs">
              <span className="text-gray-600">ყოველთვიური შენატანი:</span>
              <span className="text-sm text-gray-900">{monthlyInstallment} ₾ / თვეში</span>
            </div>
          </div>
        )}
      </div>

      {/* Product Variants (Color & Specs Options) */}
      {product.variants && product.variants.length > 0 && (
        <div className="flex flex-col gap-3 py-2 border-t border-gray-100">
          {product.variants.map((v) => (
            <div key={v.id} className="flex flex-col gap-1.5">
              <span className="text-xs text-gray-700">{v.name}:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {v.options.map((opt) => {
                  const isSelected = selectedVariants[v.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setSelectedVariants((prev) => ({ ...prev, [v.id]: opt.value }))
                      }
                      className={`px-3.5 py-2 rounded-xl text-xs border transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/80 text-blue-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {opt.colorHex && (
                        <span
                          className="size-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: opt.colorHex }}
                        />
                      )}
                      <span>{opt.label}</span>
                      {opt.priceDelta && opt.priceDelta > 0 && (
                        <span className="text-[10px] text-gray-400">+{opt.priceDelta} ₾</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Protection Plan Checkbox Add-on */}
      <label className="p-3.5 bg-purple-50/40 hover:bg-purple-50/70 rounded-2xl border border-purple-100 flex items-center justify-between gap-3 cursor-pointer transition-colors duration-200">
        <div className="flex items-center gap-2.5 text-xs">
          <input
            type="checkbox"
            checked={hasExtraProtection}
            onChange={(e) => setHasExtraProtection(e.target.checked)}
            className="size-4 accent-purple-600 rounded cursor-pointer"
          />
          <ShieldCheck className="size-4 text-purple-600 shrink-0" />
          <span className="text-gray-900">დაამატეთ +2 წლიანი გაფართოებული გარანტია</span>
        </div>
        <span className="text-xs text-purple-700 font-sans">+29.00 ₾</span>
      </label>

      {/* Quantity Stepper & Standard Button Components */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-1 bg-gray-100/70 rounded-xl p-1 border border-gray-200/60">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="size-9 rounded-lg bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50 cursor-pointer shadow-2xs"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center text-xs text-gray-900">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
              className="size-9 rounded-lg bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50 cursor-pointer shadow-2xs"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          {/* 1-Click Buy Primary Button using Button UI component */}
          <Button
            type="button"
            onClick={() => onOpenQuickBuy(quantity)}
            variant="primary"
            size="lg"
            leftIcon={<Zap className="size-4" />}
            className="flex-1 shadow-xs"
          >
            1-დაწკაპუნებით ყიდვა
          </Button>
        </div>

        {/* Add to Cart Secondary Button using Button UI component */}
        <Button
          type="button"
          onClick={() => onAddToCart(quantity)}
          variant="secondary"
          size="lg"
          leftIcon={isAdded ? <Check className="size-5 text-emerald-600" /> : <ShoppingBag className="size-5" />}
          className="w-full shadow-xs"
        >
          {isAdded ? "დაემატა კალათაში" : "კალათაში დამატება"}
        </Button>
      </div>

    </div>
  );
}
