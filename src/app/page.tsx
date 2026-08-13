"use client";

import CategoryCarousel from "@/components/CategoryCarousel";
import PromoCarousel from "@/components/PromoCarousel";
import ProductCarousel from "@/components/ProductCarousel";
import { 
  ArrowRight, 
  Gift, 
  Sparkles, 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  PackageCheck,
  Headphones
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 pb-24 bg-white">
      
      {/* 1. Category Carousel (VELI.store style icons & subcategories) */}
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

      {/* 3. Promo Banner Swiper */}
      <PromoCarousel />

      {/* ==================== SECTION GROUP 1 ==================== */}

      {/* Product Carousel 1: DJI Drones & Accessories */}
      <section className="pt-2">
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

      {/* Product Carousel 2: Smartphones & Accessories */}
      <section>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl md:text-2xl text-gray-900 tracking-tight">
                სმარტფონები & აქსესუარები
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                უახლესი ფლაგმანური სმარტფონები ოფიციალური გარანტიით
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
                id: "iphone-16-pro-max", 
                title: "სმარტფონი Apple iPhone 16 Pro Max 256GB Desert Titanium", 
                price: 4899, 
                discountPrice: 4399, 
                monthlyInstallment: 175, 
                image: "https://veli.store/media-cdn/__sized__/product/Apple_iPhone_16_Pro_Desert_Titanium_1-thumbnail-200x200-95.png", 
                discountPercentage: 10 
              },
              { 
                id: "samsung-s25-ultra", 
                title: "სმარტფონი Samsung Galaxy S25 Ultra 12GB/512GB Titanium Black", 
                price: 4599, 
                discountPrice: 3999, 
                monthlyInstallment: 160, 
                image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80", 
                discountPercentage: 13 
              },
              { 
                id: "google-pixel-9-pro", 
                title: "სმარტფონი Google Pixel 9 Pro XL 16GB/256GB Obsidian", 
                price: 3699, 
                discountPrice: 3199, 
                monthlyInstallment: 128, 
                image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80", 
                discountPercentage: 14 
              },
              { 
                id: "airpods-pro-2", 
                title: "უსადენო ყურსასმენი Apple AirPods Pro 2 USB-C Case", 
                price: 899, 
                discountPrice: 749, 
                monthlyInstallment: 30, 
                image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&q=80", 
                discountPercentage: 17 
              },
              { 
                id: "magsafe-charger", 
                title: "უსადენო დამტენი Apple MagSafe Charger 25W White", 
                price: 199, 
                discountPrice: 169, 
                monthlyInstallment: 7, 
                image: "https://images.unsplash.com/photo-1622445268465-843d31ed157c?w=400&q=80", 
                discountPercentage: 15 
              },
            ]} 
          />
        </div>
      </section>

      {/* 🌟 ELEGANT BREAK 1: Premium Soft Feature Banner */}
      <section className="py-2">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50/80 via-[#F8FAFC] to-blue-50/50 rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-100/60 shadow-xs">
            <div className="space-y-3 max-w-lg text-left">
              <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                <Headphones className="w-3.5 h-3.5" />
                <span>პრემიუმ აუდიო</span>
              </div>
              <h3 className="text-2xl md:text-3xl text-gray-900 leading-tight">
                აღმოაჩინე უმაღლესი ჟღერადობა
              </h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                Sony, Marshall, Bose და Apple — უსადენო ყურსასმენები 0%-იანი განვადებით და ოფიციალური გარანტიით.
              </p>
              <div className="pt-1">
                <Link href="/catalog" className="inline-flex items-center gap-2 bg-[#111111] hover:bg-black text-white px-5 py-2.5 rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer">
                  <span>ყურსასმენების ნახვა</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="w-full md:w-auto h-48 md:h-56 shrink-0 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80" 
                alt="Audio Premium" 
                className="h-full object-contain mix-blend-multiply drop-shadow-md rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION GROUP 2 ==================== */}

      {/* Product Carousel 3: Laptops & Computers */}
      <section>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl md:text-2xl text-gray-900 tracking-tight">
                ლეპტოპები & კომპიუტერული ტექნიკა
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                სამუშაო და გეიმინგ ნოუთბუქები საუკეთესო ფასად
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
                id: "macbook-pro-16", 
                title: "ლეპტოპი Apple MacBook Pro 16\" M3 Max / 36GB / 1TB Space Black", 
                price: 11499, 
                discountPrice: 9999, 
                monthlyInstallment: 400, 
                image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80", 
                discountPercentage: 13 
              },
              { 
                id: "asus-rog-zephyrus", 
                title: "გეიმინგ ლეპტოპი ASUS ROG Zephyrus G16 OLED i9/32GB/1TB RTX 4080", 
                price: 8999, 
                discountPrice: 7999, 
                monthlyInstallment: 320, 
                image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80", 
                discountPercentage: 11 
              },
              { 
                id: "dell-xps-15", 
                title: "ლეპტოპი Dell XPS 15 9530 i7 / 16GB / 512GB RTX 4050 Silver", 
                price: 5499, 
                discountPrice: 4799, 
                monthlyInstallment: 192, 
                image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&q=80", 
                discountPercentage: 13 
              },
              { 
                id: "logitech-mx-master-3s", 
                title: "უსადენო მაუსი Logitech MX Master 3S Performance Graphite", 
                price: 389, 
                discountPrice: 329, 
                monthlyInstallment: 13, 
                image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&q=80", 
                discountPercentage: 15 
              },
              { 
                id: "samsung-odyssey-g9", 
                title: "მონიტორი Samsung Odyssey OLED G9 49\" 240Hz Gaming", 
                price: 4999, 
                discountPrice: 4299, 
                monthlyInstallment: 172, 
                image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80", 
                discountPercentage: 14 
              },
            ]} 
          />
        </div>
      </section>

      {/* Product Carousel 4: Gaming & Consoles */}
      <section>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl md:text-2xl text-gray-900 tracking-tight">
                გეიმინგი & კონსოლები
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                სათამაშო კონსოლები, ჯოისტიკები და აქსესუარები
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
                id: "ps5-slim-digital", 
                title: "თამაშების კონსოლი Sony PlayStation 5 Slim Digital Edition White", 
                price: 1799, 
                discountPrice: 1499, 
                monthlyInstallment: 60, 
                image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&q=80", 
                discountPercentage: 17 
              },
              { 
                id: "nintendo-switch-oled", 
                title: "სათამაშო კონსოლი Nintendo Switch OLED Model White Set", 
                price: 1299, 
                discountPrice: 1099, 
                monthlyInstallment: 44, 
                image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&q=80", 
                discountPercentage: 15 
              },
              { 
                id: "xbox-series-x", 
                title: "თამაშების კონსოლი Microsoft Xbox Series X 1TB Black Console", 
                price: 1899, 
                discountPrice: 1599, 
                monthlyInstallment: 64, 
                image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&q=80", 
                discountPercentage: 16 
              },
              { 
                id: "dualsense-edge", 
                title: "უსადენო ჯოისტიკი Sony DualSense Edge Wireless Controller", 
                price: 799, 
                discountPrice: 699, 
                monthlyInstallment: 28, 
                image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=400&q=80", 
                discountPercentage: 12 
              },
              { 
                id: "steelseries-arctis-nova", 
                title: "გეიმინგ ყურსასმენი SteelSeries Arctis Nova Pro Wireless", 
                price: 1199, 
                discountPrice: 999, 
                monthlyInstallment: 40, 
                image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80", 
                discountPercentage: 17 
              },
            ]} 
          />
        </div>
      </section>

      {/* 🌟 ELEGANT BREAK 2: Minimal Single-Line Trust Service Strip */}
      <section className="py-2">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-gray-100/80 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4">
            
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

      {/* ==================== SECTION GROUP 3 ==================== */}

      {/* Product Carousel 5: Audio & Speakers */}
      <section>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl md:text-2xl text-gray-900 tracking-tight">
                აუდიო & ყურსასმენები
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                პრემიუმ ხარისხის აკუსტიკური სისტემები და დინამიკები
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
                id: "sony-wh-1000xm5-sec", 
                title: "უსადენო ყურსასმენი Sony WH-1000XM5 Noise Canceling Silver", 
                price: 1399, 
                discountPrice: 1099, 
                monthlyInstallment: 44, 
                image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80", 
                discountPercentage: 21 
              },
              { 
                id: "marshall-stanmore-3", 
                title: "აკუსტიკური სისტემა Marshall Stanmore III Bluetooth Speaker Black", 
                price: 1499, 
                discountPrice: 1299, 
                monthlyInstallment: 52, 
                image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80", 
                discountPercentage: 13 
              },
              { 
                id: "airpods-max", 
                title: "უსადენო ყურსასმენი Apple AirPods Max Space Gray", 
                price: 2199, 
                discountPrice: 1899, 
                monthlyInstallment: 76, 
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", 
                discountPercentage: 14 
              },
              { 
                id: "jbl-boombox-3", 
                title: "პორტატული დინამიკი JBL Boombox 3 Wi-Fi & Bluetooth Black", 
                price: 1699, 
                discountPrice: 1449, 
                monthlyInstallment: 58, 
                image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80", 
                discountPercentage: 15 
              },
              { 
                id: "bose-quietcomfort-ultra", 
                title: "ყურსასმენი Bose QuietComfort Ultra Wireless Headphones Black", 
                price: 1499, 
                discountPrice: 1249, 
                monthlyInstallment: 50, 
                image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80", 
                discountPercentage: 17 
              },
            ]} 
          />
        </div>
      </section>

      {/* Product Carousel 6: Smart Home & Vacuum Cleaners */}
      <section>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl md:text-2xl text-gray-900 tracking-tight">
                ჭკვიანი სახლი & საყოფაცხოვრებო ტექნიკა
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                რობოტი მტვერსასრუტები და ჭკვიანი მოწყობილობები
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
                id: "dreame-l20-ultra", 
                title: "რობოტი მტვერსასრუტი Dreame L20 Ultra Robot Vacuum Cleaner", 
                price: 3499, 
                discountPrice: 2999, 
                monthlyInstallment: 120, 
                image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&q=80", 
                discountPercentage: 14 
              },
              { 
                id: "dyson-v15-detect", 
                title: "ხელის მტვერსასრუტი Dyson V15 Detect Extra Cordless Vacuum", 
                price: 2799, 
                discountPrice: 2399, 
                monthlyInstallment: 96, 
                image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80", 
                discountPercentage: 14 
              },
              { 
                id: "ariete-espresso", 
                title: "ყავის აპარატი Ariete 1318 Moderna Espresso Coffee Machine", 
                price: 699, 
                discountPrice: 579, 
                monthlyInstallment: 23, 
                image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&q=80", 
                discountPercentage: 17 
              },
              { 
                id: "philips-hue-starter", 
                title: "ჭკვიანი განათება Philips Hue White & Color Ambiance Starter Kit", 
                price: 549, 
                discountPrice: 449, 
                monthlyInstallment: 18, 
                image: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&q=80", 
                discountPercentage: 18 
              },
            ]} 
          />
        </div>
      </section>

      {/* 🌟 ELEGANT BREAK 3: Sleek Brand Badges Bar */}
      <section className="py-2">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg text-gray-900 tracking-tight">
              პოპულარული ბრენდები
            </h3>
            <span className="text-xs text-gray-500">ოფიციალური პარტნიორები</span>
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
                className="bg-[#F8FAFC] hover:bg-gray-200/70 rounded-2xl p-3 flex flex-col items-center justify-center min-h-[72px] cursor-pointer transition-colors border border-gray-100/60"
              >
                <span className="text-sm text-gray-900 tracking-wider">{brand.logo}</span>
                <span className="text-[10px] text-gray-500 mt-0.5">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
