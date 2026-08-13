"use client";

import CategoryCarousel from "@/components/CategoryCarousel";
import PromoCarousel from "@/components/PromoCarousel";
import ProductCarousel from "@/components/ProductCarousel";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, Flame, Gift } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-10 pb-20 bg-white">
      
      {/* 1. Exact Category Carousel built using VELI.store HTML & SVGs */}
      <CategoryCarousel />

      {/* 2. Hero Banner - Image fully spread across box */}
      <section>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="rounded-3xl relative overflow-hidden min-h-[360px] md:min-h-[400px] flex items-center p-6 md:p-10 shadow-xs border border-gray-100">
            {/* Image fully spread across the ENTIRE box background */}
            <img
              src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1400&q=80"
              alt="spilo Hero Gift"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Light ambient overlay for image depth */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Floating White Card for Text on Left */}
            <div className="relative z-10 bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-[24px] max-w-md shadow-2xl border border-white/60 space-y-3 text-black">
              <h2 className="text-2xl md:text-3xl text-gray-900 leading-tight">
                იპოვე იდეალური საჩუქარი ყველასთვის
              </h2>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                შეარჩიე, შეფუთე, გაუგზავნე საჩუქარი მარტივად spilo-თი
              </p>
              <div className="pt-2 flex items-center justify-between">
                <button className="bg-[#111111] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm hover:bg-black transition-colors cursor-pointer">
                  შეარჩიე საჩუქარი
                </button>
                <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer shadow-xs">
                  <Gift className="w-5 h-5" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Promo Swiper Section */}
      <PromoCarousel />

      {/* 4. Product Sections */}
      <section className="pt-2">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl md:text-2xl text-black tracking-tight">
              DJI ტექნიკა & აქსესუარები
            </h2>
            <button className="flex items-center gap-1 text-sm text-black hover:text-gray-600 transition-colors cursor-pointer">
              <span>სრულად</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <ProductCarousel 
            products={[
              { 
                id: "dji-neo", 
                title: "დრონი DJI Neo Drone Gray", 
                price: 799, 
                discountPrice: 699, 
                monthlyInstallment: 28, 
                image: "https://veli.store/media-cdn/__sized__/product/DJI_Neo_Drone-1-thumbnail-200x200-95.jpeg", 
                discountPercentage: 12 
              },
              { 
                id: "dji-mini-4", 
                title: "დრონი DJI Mini 4 Pro Fly More Combo", 
                price: 3899, 
                discountPrice: 3299, 
                monthlyInstallment: 132, 
                image: "https://veli.store/media-cdn/__sized__/product/DJI-ZM700_20250710210650-thumbnail-200x200-95.jpg", 
                discountPercentage: 15 
              },
              { 
                id: "dji-pocket-3", 
                title: "სტაბილიზატორი DJI Osmo Pocket 3 Creator Combo", 
                price: 2499, 
                discountPrice: 2199, 
                monthlyInstallment: 88, 
                image: "https://veli.store/media-cdn/__sized__/product/DJI-ZPK300-C1-8_20250710160051-thumbnail-200x200-95.jpg", 
                discountPercentage: 12 
              },
              { 
                id: "dji-osmo-6", 
                title: "სმარტფონის სტაბილიზატორი DJI Osmo Mobile 6", 
                price: 599, 
                discountPrice: 499, 
                monthlyInstallment: 20, 
                image: "https://veli.store/media-cdn/__sized__/product/DJI_Osmo_Mobile_7P-thumbnail-200x200-95.jpg", 
                discountPercentage: 17 
              },
              { 
                id: "dji-rc-n3", 
                title: "დისტანციური მართვის პულტი DJI RC-N3 Remote Controller", 
                price: 449, 
                discountPrice: 379, 
                monthlyInstallment: 15, 
                image: "https://veli.store/media-cdn/__sized__/product/DJI_RC-N3-1-thumbnail-200x200-95.jpg", 
                discountPercentage: 15 
              },
            ]} 
          />
        </div>
      </section>

    </div>
  );
}
