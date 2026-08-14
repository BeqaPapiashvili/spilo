"use client";

import { RecentlyViewedCarousel } from "@/components/RecentlyViewedCarousel";
import { Truck, ShieldCheck, CreditCard, PackageCheck } from "lucide-react";

export default function RecentlyViewedSection() {
  return (
    <div className="space-y-10">
      {/* Recently Viewed Items Carousel */}
      <RecentlyViewedCarousel />

      {/* FOOTER TRUST STRIP */}
      <section className="pt-4">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs md:text-sm text-gray-900">სწრაფი მიწოდება</h4>
                <p className="text-[11px] text-gray-500">უფასოდ მთელ საქართველოში</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs md:text-sm text-gray-900">ოფიციალური გარანტია</h4>
                <p className="text-[11px] text-gray-500">100% ორიგინალი პროდუქცია</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs md:text-sm text-gray-900">0% განვადება</h4>
                <p className="text-[11px] text-gray-500">ყველა წამყვან ბანკში</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs md:text-sm text-gray-900">სასაჩუქრე შეფუთვა</h4>
                <p className="text-[11px] text-gray-500">უფასო შეფუთვა და ბარათი</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
