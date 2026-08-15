"use client";

import PromoCarousel from "@/components/PromoCarousel";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PromoBannersSectionProps {
  title?: string | null;
  subtitle?: string | null;
  config?: any;
}

export default function PromoBannersSection({ title, subtitle }: PromoBannersSectionProps = {}) {
  return (
    <div className="space-y-14">
      {/* Promo Banner Swiper */}
      <PromoCarousel />

      {/* FULL-WIDTH FEATURE BANNER 1: Apple iPhone 16 Pro Series */}
      <section className="py-2">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative rounded-[32px] overflow-hidden min-h-[220px] md:min-h-[260px] flex items-center p-8 md:p-12 bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white shadow-md">
            <img 
              src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1400&q=80" 
              alt="iPhone 16 Pro Promo" 
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
            <div className="relative z-10 max-w-lg space-y-3">
              <span className="text-xs text-blue-400 uppercase tracking-widest">Apple Flagship</span>
              <h3 className="text-2xl md:text-4xl leading-tight">
                iPhone 16 Pro Series
              </h3>
              <p className="text-xs md:text-sm text-gray-300">
                ტიტანის კორპუსი, A18 Pro ჩიპი და ინოვაციური კამერის მართვა. 0%-იანი ონლაინ განვადებით.
              </p>
              <div className="pt-2">
                <Link href="/catalog" className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-black px-6 py-2.5 rounded-2xl text-xs sm:text-sm transition-colors">
                  <span>ყიდვა</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FULL-WIDTH FEATURE BANNER 2: PlayStation 5 Gaming Banner */}
      <section className="py-2">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative rounded-[32px] overflow-hidden min-h-[220px] md:min-h-[260px] flex items-center p-8 md:p-12 bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-950 text-white shadow-md">
            <img 
              src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1400&q=80" 
              alt="PlayStation 5 Gaming Promo" 
              className="absolute inset-0 w-full h-full object-cover opacity-35"
            />
            <div className="relative z-10 max-w-lg space-y-3">
              <span className="text-xs text-blue-300 uppercase tracking-widest">Next-Gen Gaming</span>
              <h3 className="text-2xl md:text-4xl leading-tight">
                PlayStation 5 Slim & DualSense
              </h3>
              <p className="text-xs md:text-sm text-blue-100">
                ჩაერთე გეიმინგის ახალ ეპოქაში. 4K 120Hz გრაფიკა და ულტრა-სწრაფი SSD.
              </p>
              <div className="pt-2">
                <Link href="/catalog" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-xs sm:text-sm transition-colors">
                  <span>კონსოლების ნახვა</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
