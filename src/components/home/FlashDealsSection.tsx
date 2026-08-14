"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCarousel from "@/components/ProductCarousel";

export default function FlashDealsSection() {
  return (
    <div className="space-y-14">
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
            <Link href="/catalog?category=photo-video" className="flex items-center gap-1 text-xs md:text-sm text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
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
            <Link href="/catalog?category=mobiles" className="flex items-center gap-1 text-xs md:text-sm text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
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
            <Link href="/catalog?category=laptops" className="flex items-center gap-1 text-xs md:text-sm text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
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
    </div>
  );
}
