"use client";

import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

interface CategoryBarSkeletonProps {
  count?: number;
}

export const CategoryBarSkeleton: React.FC<CategoryBarSkeletonProps> = ({ count = 8 }) => {
  const items = Array.from({ length: count });

  return (
    <section className="py-4">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1.5">
            <Skeleton width={180} height={20} className="rounded-lg" />
            <Skeleton width={260} height={12} className="rounded-md" />
          </div>
          <Skeleton width={100} height={16} className="rounded-md" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
          {items.map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center p-4 bg-[#F8FAFC] rounded-2xl border border-gray-100/80 space-y-2.5 text-center"
            >
              <Skeleton width={48} height={48} variant="circular" className="bg-white shadow-2xs" />
              <Skeleton width="70%" height={12} className="rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
