"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, Home, ShoppingBag } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "SPL-92841";

  return (
    <div className="bg-white rounded-[32px] p-8 md:p-12 max-w-lg w-full text-center space-y-6 shadow-xs border border-gray-100 animate-in zoom-in-95">
      
      {/* Success Icon */}
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      {/* Text Details */}
      <div className="space-y-2">
        <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          შეკვეთა მიღებულია!
        </span>
        <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight pt-1">
          მადლობა შეკვეთისთვის!
        </h1>
        <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
          თქვენი შეკვეთა ნომრით <span className="font-mono text-gray-900 font-semibold">{orderId}</span> წარმატებით დარეგისტრირდა.
        </p>
      </div>

      {/* Status Box */}
      <div className="bg-[#F1F3F6] rounded-2xl p-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5 text-gray-700">
          <Package className="w-4 h-4 text-blue-600" />
          <span>შეკვეთის სტატუსი:</span>
        </div>
        <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg">მუშავდება</span>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <Link
          href="/profile"
          className="flex-1 py-3 bg-[#111111] hover:bg-black text-white rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>ჩემი შეკვეთები</span>
        </Link>
        <Link
          href="/"
          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>მთავარი გვერდი</span>
        </Link>
      </div>

    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="bg-[#F8FAFC] min-h-[80vh] flex items-center justify-center py-16 px-4">
      <Suspense fallback={<div className="text-gray-500 text-sm">იტვირთება...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
