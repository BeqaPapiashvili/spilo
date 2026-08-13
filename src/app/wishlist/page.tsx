"use client";

import { useStore } from "@/store/useStore";
import ProductCard from "@/components/ProductCard";
import { Heart, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const { wishlist, clearWishlist, addToCart } = useStore();

  const handleMoveAllToCart = () => {
    wishlist.forEach((item) => {
      addToCart({
        id: item.id,
        title: item.title,
        price: item.price,
        discountPrice: item.discountPrice,
        image: item.image,
      });
    });
    clearWishlist();
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <Heart className="w-5 h-5 fill-red-500" />
              <span className="text-xs uppercase tracking-wider text-gray-500">შენახული ნივთები</span>
            </div>
            <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight">
              სურვილების სია ({wishlist.length})
            </h1>
          </div>

          {wishlist.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleMoveAllToCart}
                className="bg-[#111111] hover:bg-black text-white px-5 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-blue-400" />
                <span>ყველას კალათაში გადატანა</span>
              </button>
              <button
                onClick={clearWishlist}
                className="bg-white border border-gray-200 text-gray-600 hover:text-red-600 px-4 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>გასუფთავება</span>
              </button>
            </div>
          )}
        </div>

        {/* Wishlist Grid */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 text-center max-w-md mx-auto space-y-4 shadow-xs border border-gray-100 my-12">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-xl text-gray-900">სურვილების სია ცარიელია</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              დააჭირეთ გულის იკონს ნებისმიერ ნივთზე მის შესანახად
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-[#111111] text-white px-6 py-3 rounded-2xl text-xs sm:text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>პროდუქტების დათვალიერება</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
