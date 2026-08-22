"use client";

import { useStore } from "@/store/useStore";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Tag,
  Truck,
  Sparkles,
  Loader2,
  Check
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface AppliedCouponData {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  finalTotal: number;
}

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, addToast } = useStore();
  const [promoCode, setPromoCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponData | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + (item.discountPrice || item.price) * item.quantity,
    0
  );

  const freeShippingThreshold = 100;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const progressPercent = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      addToast({
        title: "შეცდომა",
        message: "გთხოვთ შეიყვანოთ პრომო კოდი",
        type: "error",
      });
      return;
    }

    setIsValidatingPromo(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.trim(),
          orderTotal: cartSubtotal,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.coupon) {
        setAppliedCoupon(data.coupon);
        addToast({
          title: "პრომო კოდი გააქტიურდა!",
          message: data.message || `ფასდაკლება -${data.coupon.discountAmount} ₾`,
          type: "success",
        });
      } else {
        setAppliedCoupon(null);
        addToast({
          title: "არასწორი პრომო კოდი",
          message: data.error || "პრომო კოდი ვერ მოიძებნა ან ვადაგასულია",
          type: "error",
        });
      }
    } catch (err) {
      addToast({
        title: "შეცდომა",
        message: "პრომო კოდის გადამოწმება ვერ მოხერხდა",
        type: "error",
      });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedCoupon(null);
    setPromoCode("");
    addToast({
      title: "ინფორმაცია",
      message: "პრომო კოდი მოხსნილია",
      type: "info",
    });
  };

  return (
    <div className="bg-gray-50/50 min-h-screen py-10">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight">
              ჩემი კალათა ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              გადაამოწმეთ არჩეული ნივთები შეკვეთის გაფორმებამდე
            </p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>კალათის გასუფთავება</span>
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto shadow-2xs border border-gray-100 my-12">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl text-gray-900">კალათა ცარიელია</h2>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              თქვენს კალათაში ჯერ არ არის დამატებული არცერთი პროდუქტი.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-xs sm:text-sm cursor-pointer transition-colors shadow-xs"
            >
              <span>შოპინგის დაწყება</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Delivery Tracker */}
              <div className="bg-white rounded-2xl p-4 shadow-2xs border border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>
                      {remainingForFreeShipping > 0
                        ? `დაამატეთ ${remainingForFreeShipping.toFixed(2)} ₾ უფასო მიწოდებისთვის`
                        : "გილოცავთ! თქვენ მიიღებთ უფასო მიწოდებას"}
                    </span>
                  </div>
                  <span className="text-gray-900">{progressPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                {cart.map((item) => {
                  const itemPrice = item.discountPrice || item.price;
                  return (
                    <div key={`${item.id}-${item.color}-${item.storage}`} className="p-4 sm:p-5 flex gap-4 items-center">
                      <Link href={`/product/${item.id}`} className="size-20 bg-gray-50 rounded-xl p-2 shrink-0 flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </Link>

                      <div className="flex-1 min-w-0 space-y-1">
                        <Link
                          href={`/product/${item.id}`}
                          className="text-xs sm:text-sm text-gray-900 hover:text-blue-600 transition-colors line-clamp-1 block"
                        >
                          {item.title}
                        </Link>
                        {(item.color || item.storage) && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {item.color && <span>ფერი: {item.color}</span>}
                            {item.storage && <span>მეხსიერება: {item.storage}</span>}
                          </div>
                        )}
                        <div className="text-sm text-gray-900 pt-1">
                          {itemPrice.toFixed(2)} ₾
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 bg-white text-gray-600 hover:text-gray-900 rounded-lg flex items-center justify-center cursor-pointer shadow-2xs"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 bg-white text-gray-600 hover:text-gray-900 rounded-lg flex items-center justify-center cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total and Delete */}
                      <div className="text-right shrink-0 min-w-[70px]">
                        <div className="text-sm text-gray-900">
                          {(itemPrice * item.quantity).toFixed(2)} ₾
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-gray-400 hover:text-red-500 mt-1 cursor-pointer transition-colors"
                        >
                          წაშლა
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Shopping Continuity Actions */}
              <div className="flex justify-between items-center pt-2">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 text-xs text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>შოპინგის გაგრძელება</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-2xs border border-gray-100 space-y-6 sticky top-24">
              <h3 className="text-base text-gray-900 border-b border-gray-100 pb-3">
                შეკვეთის ჯამი
              </h3>

              {/* Live Database Coupon Form */}
              {appliedCoupon ? (
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs text-emerald-900 font-mono">{appliedCoupon.code}</p>
                      <p className="text-[11px] text-emerald-700">
                        -{appliedCoupon.discountType === "percentage" ? `${appliedCoupon.discountValue}%` : `${appliedCoupon.discountValue} ₾`} ფასდაკლება
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    მოხსნა
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <label className="text-xs text-gray-500 block">პრომო კოდი</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="შეიყვანეთ კოდი"
                        className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600 uppercase font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isValidatingPromo}
                      className="px-4 bg-gray-900 hover:bg-black text-white text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1 shrink-0"
                    >
                      {isValidatingPromo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "გამოყენება"}
                    </button>
                  </div>
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2.5 border-t border-gray-100 pt-4 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>პროდუქტების ღირებულება:</span>
                  <span className="text-gray-900">{cartSubtotal.toFixed(2)} ₾</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600">
                    <span>ფასდაკლება ({appliedCoupon.code}):</span>
                    <span>-{discountAmount.toFixed(2)} ₾</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>მიწოდების სერვისი:</span>
                  <span className="text-emerald-600">უფასო</span>
                </div>
                <div className="flex justify-between text-sm text-gray-900 pt-3 border-t border-gray-100">
                  <span>სულ გადასახდელი:</span>
                  <span className="text-xl text-blue-600">{finalTotal.toFixed(2)} ₾</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <span>შეკვეთის გაფორმება</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Security & Warranty Banner */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-500 space-y-1.5">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% უსაფრთხო გადახდა</span>
                </div>
                <p>ოფიციალური საგარანტიო მომსახურება ყველა ტექნიკაზე</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
