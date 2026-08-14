"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCarousel from "@/components/ProductCarousel";
import { dataService } from "@/services/dataService";
import { Product } from "@/types";
import { ProductGridSkeleton } from "@/components/skeletons/ProductGridSkeleton";

export default function FlashDealsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const list = dataService.getProducts();
    setProducts(list);
    setIsLoading(false);
    const unsub = dataService.subscribe(() => {
      setProducts(dataService.getProducts());
    });
    return () => unsub();
  }, []);

  const formatForCarousel = (items: Product[]) =>
    items.map((p) => ({
      ...p,
      image: p.image || (p.images && p.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    }));

  const djiProducts = formatForCarousel(
    products.filter(
      (p) => (p.brandId === "dji" || (p.brandName && p.brandName.toLowerCase() === "dji") || p.categoryId === "photo-video")
    )
  );
  const mobileProducts = formatForCarousel(
    products.filter(
      (p) => p.categoryId === "mobiles" || (p.categoryName && p.categoryName.toLowerCase().includes("მობილურ"))
    )
  );
  const laptopProducts = formatForCarousel(
    products.filter(
      (p) => p.categoryId === "laptops" || p.categoryId === "gaming" || (p.categoryName && p.categoryName.toLowerCase().includes("ლეპტოპ"))
    )
  );

  const fallbackList = formatForCarousel(products);

  if (isLoading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProductGridSkeleton count={4} />
      </div>
    );
  }

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
            products={djiProducts.length > 0 ? djiProducts : fallbackList} 
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
            products={mobileProducts.length > 0 ? mobileProducts : fallbackList} 
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
            products={laptopProducts.length > 0 ? laptopProducts : fallbackList} 
          />
        </div>
      </section>
    </div>
  );
}
