"use client";

import CategoryCarousel from "@/components/CategoryCarousel";
import { Sparkles, Gift } from "lucide-react";
import Link from "next/link";

export default function HeroBannerSection() {
  return (
    <div className="space-y-14">
      {/* 1. Top Category Carousel */}
      <CategoryCarousel />

      {/* 2. Main Hero Banner */}
      <section>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="rounded-[32px] relative overflow-hidden min-h-[360px] md:min-h-[420px] flex items-center p-6 md:p-12 shadow-xs border border-gray-100">
            <img
              src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1400&q=80"
              alt="spilo Hero Gift"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />

            {/* Floating White Card */}
            <div className="relative z-10 bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-[28px] max-w-md shadow-2xl border border-white/60 space-y-4 text-black">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>სპეციალური შეთავაზება</span>
              </div>
              <h2 className="text-2xl md:text-3xl text-gray-900 leading-tight">
                იპოვე იდეალური საჩუქარი ყველასთვის
              </h2>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                შეარჩიე, შეფუთე, გაუგზავნე საჩუქარი მარტივად spilo-თი
              </p>
              <div className="pt-2 flex items-center justify-between">
                <Link 
                  href="/catalog"
                  className="bg-[#111111] text-white px-6 py-3 rounded-2xl text-xs sm:text-sm hover:bg-black transition-colors cursor-pointer"
                >
                  შეარჩიე საჩუქარი
                </Link>
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer shadow-xs">
                  <Gift className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
