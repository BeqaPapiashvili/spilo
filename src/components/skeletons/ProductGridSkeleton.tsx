"use client";

import React from "react";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

interface ProductGridSkeletonProps {
  count?: number;
}

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({ count = 8 }) => {
  const items = Array.from({ length: count });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 w-full">
      {items.map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};
