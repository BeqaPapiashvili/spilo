"use client";

import { useState, useEffect } from "react";
import CategoryCarousel from "@/components/CategoryCarousel";
import PromoCarousel from "@/components/PromoCarousel";
import ProductCarousel from "@/components/ProductCarousel";
import { 
  ArrowRight, 
  Flame, 
  Gift, 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  PackageCheck, 
  Star, 
  Clock, 
  Sparkles,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  // Live Countdown Timer State for "Hot Deals" (Starts at 8h 42m 19s)
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-12 pb-24 bg-white">
      
      {/* 1. Category Carousel (VELI.store style icons & subcategories) */}
      <CategoryCarousel />

      {/* 2. Main Hero Banner - Image fully spread across box */}
      <section>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="rounded-[32px] relative overflow-hidden min-h-[360px] md:min-h-[420px] flex items-center p-6 md:p-12 shadow-xs border border-gray-100">
            <img
              src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1400&q=80"
              alt="spilo Hero Gift"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />

            {/* Floating Glassmorphic White Card */}
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

      {/* 3. Promo Banner Swiper */}
      <PromoCarousel />

      {/* 4. 🔥 Hot Deals of the Day (Live Countdown Timer + Flash Sales) */}
      <section className="pt-2">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="bg-gradient-to-r from-red-500/5 via-orange-500/5 to-transparent p-6 md:p-8 rounded-[32px] border border-red-100 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-100/60 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-xs">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl text-gray-900 tracking-tight">
                    დღის ცხელი შეთავაზებები
                  </h2>
                  <p className="text-xs text-gray-500">
                    შეზღუდული რაოდენობის პროდუქცია ექსკლუზიურ ფასად
                  </p>
                </div>
              </div>

              {/* Live Countdown Timer Badge */}
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-xs border border-gray-100 shrink-0">
                <Clock className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="text-xs text-gray-500">სრულდება:</span>
                <div className="flex items-center gap-1 text-sm font-mono text-gray-900">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-lg">{String(timeLeft.hours).padStart(2, "0")}</span>
                  <span>:</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded-lg">{String(timeLeft.minutes).padStart(2, "0")}</span>
                  <span>:</span>
                  <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-lg">{String(timeLeft.seconds).padStart(2, "0")}</span>
                </div>
              </div>
            </div>

            <ProductCarousel 
              products={[
                { 
                  id: "apple-iphone-16-pro", 
                  title: "სმარტფონი Apple iPhone 16 Pro Max 256GB Desert Titanium", 
                  price: 4899, 
                  discountPrice: 4399, 
                  monthlyInstallment: 175, 
                  image: "https://veli.store/media-cdn/__sized__/product/Apple_iPhone_16_Pro_Desert_Titanium_1-thumbnail-200x200-95.png", 
                  discountPercentage: 10 
                },
                { 
                  id: "sony-wh-1000xm5", 
                  title: "უსადენო ყურსასმენი Sony WH-1000XM5 Black", 
                  price: 1399, 
                  discountPrice: 1099, 
                  monthlyInstallment: 44, 
                  image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80", 
                  discountPercentage: 21 
                },
                { 
                  id: "macbook-air-m3", 
                  title: "ლეპტოპი Apple MacBook Air 15\" M3 / 16GB / 512GB Midnight", 
                  price: 5299, 
                  discountPrice: 4699, 
                  monthlyInstallment: 188, 
                  image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80", 
                  discountPercentage: 11 
                },
                { 
                  id: "playstation-5-slim", 
                  title: "თამაშების კონსოლი Sony PlayStation 5 Slim Digital Edition", 
                  price: 1799, 
                  discountPrice: 1499, 
                  monthlyInstallment: 60, 
                  image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&q=80", 
                  discountPercentage: 17 
                },
                { 
                  id: "dyson-airwrap", 
                  title: "თმის სტაილერი Dyson Airwrap Multi-Styler Complete Long Strawberry Bronze", 
                  price: 2199, 
                  discountPrice: 1899, 
                  monthlyInstallment: 76, 
                  image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80", 
                  discountPercentage: 13 
                },
              ]} 
            />
          </div>
        </div>
      </section>

      {/* 5. 🎁 Category Spotlight Grid (3 Visual Promo Cards) */}
      <section>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Smartphones */}
            <div className="relative rounded-[28px] overflow-hidden group min-h-[260px] bg-gray-900 flex flex-col justify-between p-6 shadow-sm border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80" 
                alt="Smartphones" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10">
                <span className="text-xs text-blue-400 uppercase tracking-wider">ტექნოლოგიები</span>
                <h3 className="text-xl text-white mt-1">სმარტფონები & ტაბლეტები</h3>
              </div>
              <div className="relative z-10 pt-4">
                <Link href="/catalog" className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-xl text-xs backdrop-blur-xs transition-colors">
                  <span>იხილეთ კოლექცია</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 2: Audio */}
            <div className="relative rounded-[28px] overflow-hidden group min-h-[260px] bg-gray-900 flex flex-col justify-between p-6 shadow-sm border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80" 
                alt="Audio" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10">
                <span className="text-xs text-blue-400 uppercase tracking-wider">აუდიო სისტემები</span>
                <h3 className="text-xl text-white mt-1">ყურსასმენები & დინამიკები</h3>
              </div>
              <div className="relative z-10 pt-4">
                <Link href="/catalog" className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-xl text-xs backdrop-blur-xs transition-colors">
                  <span>იხილეთ კოლექცია</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 3: Gaming */}
            <div className="relative rounded-[28px] overflow-hidden group min-h-[260px] bg-gray-900 flex flex-col justify-between p-6 shadow-sm border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80" 
                alt="Gaming" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10">
                <span className="text-xs text-blue-400 uppercase tracking-wider">გეიმინგი</span>
                <h3 className="text-xl text-white mt-1">კონსოლები & აქსესუარები</h3>
              </div>
              <div className="relative z-10 pt-4">
                <Link href="/catalog" className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-xl text-xs backdrop-blur-xs transition-colors">
                  <span>იხილეთ კოლექცია</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Product Section: DJI Drones & Accessories */}
      <section>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl md:text-2xl text-gray-900 tracking-tight">
                DJI ტექნიკა & აქსესუარები
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                პროფესიონალური დრონები და სტაბილიზატორები
              </p>
            </div>
            <Link href="/catalog" className="flex items-center gap-1 text-xs md:text-sm text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
              <span>სრულად ნახვა</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
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

      {/* 7. 🏷️ Top Brands Section */}
      <section>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl md:text-2xl text-gray-900 tracking-tight">
              პოპულარული ბრენდები
            </h2>
            <span className="text-xs text-gray-500">მსოფლიო დონის მწარმოებლები</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {[
              { name: "Apple", logo: "" },
              { name: "Samsung", logo: "SAMSUNG" },
              { name: "Sony", logo: "SONY" },
              { name: "DJI", logo: "DJI" },
              { name: "Marshall", logo: "Marshall" },
              { name: "JBL", logo: "JBL" },
              { name: "Dyson", logo: "dyson" },
              { name: "Asus", logo: "ASUS" },
            ].map((brand, idx) => (
              <div 
                key={idx} 
                className="bg-[#F1F3F6] hover:bg-gray-200/80 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[90px] cursor-pointer transition-colors border border-transparent hover:border-gray-300/50"
              >
                <span className="text-base text-gray-900 tracking-wider">{brand.logo}</span>
                <span className="text-[11px] text-gray-500 mt-1">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. 🚚 Why Shop at spilo (Trust Service Features Grid) */}
      <section>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-[#F1F3F6] rounded-3xl p-6 flex items-start gap-4 transition-transform hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm text-gray-900">სწრაფი მიწოდება</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  უფასო მიტანის სერვისი მთელ საქართველოში
                </p>
              </div>
            </div>

            <div className="bg-[#F1F3F6] rounded-3xl p-6 flex items-start gap-4 transition-transform hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm text-gray-900">ოფიციალური გარანტია</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  100% ორიგინალი პროდუქცია გარანტიით
                </p>
              </div>
            </div>

            <div className="bg-[#F1F3F6] rounded-3xl p-6 flex items-start gap-4 transition-transform hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm text-gray-900">0% ონლაინ განვადება</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  მოქნილი განვადება ყველა წამყვან ბანკში
                </p>
              </div>
            </div>

            <div className="bg-[#F1F3F6] rounded-3xl p-6 flex items-start gap-4 transition-transform hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm text-gray-900">სასაჩუქრე შეფუთვა</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  უფასო სასაჩუქრე შეფუთვა და მისალოცი ბარათი
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. ⭐ Real Verified Customer Testimonials */}
      <section>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl md:text-2xl text-gray-900 tracking-tight">
                რას ამბობენ მომხმარებლები
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                spilo-ს კმაყოფილი მომხმარებლების შეფასებები
              </p>
            </div>
            <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full text-xs">
              <Star className="w-4 h-4 fill-amber-500" />
              <span className="text-gray-900">4.9 / 5.0 (2,400+ შეფასება)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: "გიორგი ბერიძე",
                role: "ვერიფიცირებული მყიდველი",
                comment: "DJI Neo დრონი შევუკვეთე და 2 საათში უკვე ადგილზე იყო. სასაჩუქრე შეფუთვაც უნაკლო იყო!",
                rating: 5,
                product: "დრონი DJI Neo Drone Gray",
              },
              {
                name: "ნინო ყიფიანი",
                role: "ვერიფიცირებული მყიდველი",
                comment: "ძალიან მოსახერხებელი საიტია. 0%-იანი განვადება 1 წუთში დამტკიცდა. რეკომენდაციას ვუწევ spilo-ს!",
                rating: 5,
                product: "Apple iPhone 16 Pro Max",
              },
              {
                name: "დავით მესხი",
                role: "ვერიფიცირებული მყიდველი",
                comment: "Sony-ს ყურსასმენები საუკეთესო ფასად ავიღე. ოფიციალური გარანტია და უმაღლესი სერვისი.",
                rating: 5,
                product: "Sony WH-1000XM5",
              },
            ].map((review, idx) => (
              <div 
                key={idx} 
                className="bg-[#F1F3F6] rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 text-amber-500">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500" />
                      ))}
                    </div>
                    <span className="text-[11px] text-gray-400">spilo Verified</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-700 leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs text-gray-900">{review.name}</h5>
                    <span className="text-[10px] text-gray-500">{review.role}</span>
                  </div>
                  <span className="text-[11px] text-blue-600 max-w-[120px] truncate">{review.product}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
