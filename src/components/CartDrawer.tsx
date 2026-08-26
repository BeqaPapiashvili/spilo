"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CartDrawer() {
  const { isCartOpen, toggleCart, cart, updateQuantity, removeFromCart } = useStore();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  const total = cart.reduce(
    (sum, item) => sum + (item.discountPrice || item.price) * item.quantity,
    0
  );

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-[100vw] sm:max-w-[420px] bg-white shadow-2xl z-50 flex flex-col h-[100dvh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FFF5F2] text-[#FF5238] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h2 className="text-lg sm:text-xl text-gray-900">კალათა</h2>
                {cartItemsCount > 0 && (
                  <span className="text-xs text-gray-400 font-mono">({cartItemsCount})</span>
                )}
              </div>

              <button
                type="button"
                onClick={toggleCart}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                aria-label="დახურვა"
              >
                <X className="w-4 h-4 text-gray-700" />
              </button>
            </div>

            {/* Scrollable Item List */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <ShoppingBag className="w-8 h-8 text-gray-400 stroke-[1.5]" />
                  </div>
                  <p className="text-base text-gray-900">კალათა ცარიელია</p>
                  <p className="text-xs text-gray-500 max-w-xs">
                    დაათვალიერეთ ჩვენი კატალოგი და შეარჩიეთ სასურველი პროდუქტები
                  </p>
                  <Link
                    href="/catalog"
                    onClick={toggleCart}
                    className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1D1D1F] text-white text-xs hover:bg-gray-800 transition-colors"
                  >
                    <span>კატალოგში გადასვლა</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 items-start bg-[#F8FAFC] p-3 sm:p-3.5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white p-1 rounded-xl border border-gray-100 shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.image || "/placeholder.png"}
                        alt={item.title}
                        className="w-full h-full object-contain mix-blend-multiply"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="text-xs text-gray-900 line-clamp-2 leading-snug pr-1">
                          {item.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 p-1 -mr-1 -mt-1 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="წაშლა"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variants badges */}
                      {(item.color || item.storage || item.extraProtection) && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {item.color && (
                            <span className="text-[10px] text-gray-500 bg-gray-200/70 px-1.5 py-0.5 rounded-md leading-none">
                              {item.color}
                            </span>
                          )}
                          {item.storage && (
                            <span className="text-[10px] text-gray-500 bg-gray-200/70 px-1.5 py-0.5 rounded-md leading-none">
                              {item.storage}
                            </span>
                          )}
                          {item.extraProtection && (
                            <span className="text-[10px] text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-md leading-none">
                              +2 წელი
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price & Quantity Controls */}
                      <div className="flex items-center justify-between pt-1.5">
                        <div className="text-xs sm:text-sm text-gray-900 font-mono tracking-tight">
                          {((item.discountPrice || item.price) * item.quantity).toFixed(2)} ₾
                        </div>

                        <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-xl border border-gray-200 text-xs shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="text-gray-500 hover:text-black p-0.5 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-4 text-center font-mono text-xs">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-gray-500 hover:text-black p-0.5 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout Button */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-gray-100 bg-white space-y-3 shrink-0 shadow-lg pb-6 sm:pb-6">
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-gray-500">
                    <span>მიწოდება:</span>
                    <span className="text-emerald-600">უფასო</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-1 border-t border-gray-100">
                    <span className="text-gray-700">სულ გადასახდელი:</span>
                    <span className="text-lg sm:text-xl text-[#FF5238] font-mono tracking-tight">
                      {total.toFixed(2)} ₾
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/cart"
                    onClick={toggleCart}
                    className="py-3 rounded-xl sm:rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-800 text-xs sm:text-sm text-center transition-colors cursor-pointer flex items-center justify-center"
                  >
                    <span>კალათის ნახვა</span>
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={toggleCart}
                    className="py-3 rounded-xl sm:rounded-2xl bg-[#FF5238] hover:bg-[#EA3A20] text-white text-xs sm:text-sm text-center transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>გაფორმება</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
