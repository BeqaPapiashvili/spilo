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
  Truck
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, addToast } = useStore();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + (item.discountPrice || item.price) * item.quantity,
    0
  );

  const freeShippingThreshold = 100;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const progressPercent = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const discountAmount = promoApplied ? cartSubtotal * 0.1 : 0;
  const finalTotal = cartSubtotal - discountAmount;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toLowerCase() === "spilo10" || promoCode.trim().toLowerCase() === "veli") {
      setPromoApplied(true);
      addToast({
        title: "პრომო კოდი გააქტიურდა!",
        message: "10%-იანი ფასდაკლება გამოყენებულია",
        type: "success",
      });
    } else {
      addToast({
        title: "არასწორი პრომო კოდი",
        message: "სცადეთ: spilo10",
        type: "error",
      });
    }
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
              className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              კალათის გასუფთავება
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 shadow-xs border border-gray-100 my-12">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl text-gray-900">თქვენი კალათა ცარიელია</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              შეარჩიეთ სასურველი პროდუქტები კატალოგიდან
            </p>
            <div className="pt-2">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 bg-[#111111] hover:bg-black text-white px-6 py-3 rounded-2xl text-xs sm:text-sm cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>კატალოგის დათვალიერება</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Active Cart View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart List */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Shipping Progress Bar */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-700">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-600" />
                    {remainingForFreeShipping === 0 ? (
                      <span className="text-emerald-600">თქვენ მიიღებთ უფასო მიწოდებას! 🎉</span>
                    ) : (
                      <span>
                        დაგრჩათ <b>{remainingForFreeShipping.toFixed(2)} ₾</b> უფასო მიწოდებამდე
                      </span>
                    )}
                  </span>
                  <span className="text-gray-400">{progressPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 md:p-5 shadow-2xs border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0 w-full sm:w-auto">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 object-contain bg-gray-50 p-2 rounded-xl shrink-0 border border-gray-100"
                    />
                    <div className="space-y-1 flex-1 min-w-0">
                      <Link
                        href={`/product/${item.id}`}
                        className="text-xs md:text-sm text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 block"
                      >
                        {item.title}
                      </Link>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm md:text-base text-gray-900">
                          {((item.discountPrice || item.price) * item.quantity).toFixed(2)} ₾
                        </span>
                        {item.discountPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {(item.price * item.quantity).toFixed(2)} ₾
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <div className="flex items-center gap-3 bg-gray-100 px-3 py-1.5 rounded-xl text-xs">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="text-gray-600 hover:text-black transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-gray-600 hover:text-black transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="წაშლა"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 text-xs md:text-sm text-gray-600 hover:text-blue-600 transition-colors"
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

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <label className="text-xs text-gray-500 block">პრომო კოდი</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="მაგ: spilo10"
                      className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 bg-gray-900 hover:bg-black text-white text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    გამოყენება
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-xs text-emerald-600 pt-1">-10% პრომო კოდი გააქტიურებულია!</p>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-2.5 border-t border-gray-100 pt-4 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>პროდუქტების ღირებულება:</span>
                  <span className="text-gray-900">{cartSubtotal.toFixed(2)} ₾</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-emerald-600">
                    <span>ფასდაკლება (-10%):</span>
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

              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>დაცული და უსაფრთხო გადახდა</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
