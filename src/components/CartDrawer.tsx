"use client";

import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CartDrawer() {
  const { isCartOpen, toggleCart, cart, updateQuantity, removeFromCart } = useStore();

  const total = cart.reduce(
    (sum, item) => sum + (item.discountPrice || item.price) * item.quantity,
    0
  );

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl md:text-2xl text-gray-900">ჩემი კალათა</h2>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 mt-20 space-y-3">
                  <p className="text-base text-gray-900">კალათა ცარიელია</p>
                  <p className="text-xs text-gray-400">შეარჩიეთ სასურველი პროდუქტები კატალოგიდან</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center bg-[#F8FAFC] p-4 rounded-2xl border border-gray-100">
                    <img src={item.image} alt={item.title} className="w-16 h-16 object-contain bg-white p-1 rounded-xl shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs md:text-sm text-gray-900 truncate">{item.title}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-sm md:text-base text-gray-900 tracking-tight">
                          {((item.discountPrice || item.price) * item.quantity).toFixed(2)} ₾
                        </div>
                        <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border border-gray-200 text-xs">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="text-gray-500 hover:text-black transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-gray-500 hover:text-black transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-white space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">სულ გადასახდელი:</span>
                  <span className="text-xl md:text-2xl text-blue-600 tracking-tight">{total.toFixed(2)} ₾</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={toggleCart}
                  className="w-full bg-[#111111] hover:bg-black text-white text-sm md:text-base py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <span>შეკვეთის გაფორმება</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
