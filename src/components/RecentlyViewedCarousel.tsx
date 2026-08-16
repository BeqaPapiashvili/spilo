"use client";

import React from "react";
import { useStore } from "@/store/useStore";
import ProductCard from "./ProductCard";

export const RecentlyViewedCarousel: React.FC = () => {
  const { recentlyViewed } = useStore();

  if (recentlyViewed.length === 0) return null;

  return (
    <section className="py-8 border-t border-gray-100">
      <div className="container mx-auto px-4 lg:px-8">
        <h3 className="text-lg text-gray-900 mb-4">ბოლოს ნანახი პროდუქტები</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recentlyViewed.slice(0, 5).map((item) => (
            <ProductCard
              key={item.id}
              id={item.id}
              title={item.title}
              price={item.price}
              discountPrice={item.discountPrice}
              monthlyInstallment={item.monthlyInstallment}
              image={item.image}
              discountPercentage={item.discountPercentage}
              stock={item.stock}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
