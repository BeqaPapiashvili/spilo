"use client";

import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 lg:px-8 max-w-7xl py-8 space-y-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2">
        <Skeleton width={80} height={14} />
        <Skeleton width={12} height={12} />
        <Skeleton width={100} height={14} />
        <Skeleton width={12} height={12} />
        <Skeleton width={160} height={14} />
      </div>

      {/* Main PDP 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* Left Column: Image Gallery (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Main Image Box */}
          <div className="w-full h-[380px] md:h-[460px] bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-2xl" />
          </div>

          {/* Thumbnails Row */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width={80} height={80} className="rounded-2xl shrink-0" />
            ))}
          </div>
        </div>

        {/* Right Column: Product Specs & Buy Box (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Brand Badge + Code */}
          <div className="flex items-center gap-3">
            <Skeleton width={90} height={24} className="rounded-full" />
            <Skeleton width={110} height={14} />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Skeleton height={28} className="w-full rounded-lg" />
            <Skeleton height={28} className="w-3/4 rounded-lg" />
          </div>

          {/* Price Box */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3">
            <div className="flex items-baseline gap-3">
              <Skeleton width={140} height={36} className="rounded-lg" />
              <Skeleton width={80} height={18} className="rounded-md" />
            </div>
            <Skeleton width={200} height={20} className="rounded-lg" />
          </div>

          {/* Variants Selectors (Color & Storage) */}
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Skeleton width={100} height={14} />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} width={36} height={36} variant="circular" />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton width={120} height={14} />
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height={40} className="rounded-xl" />
                ))}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <Skeleton height={52} className="flex-1 rounded-2xl" />
            <Skeleton width={52} height={52} className="rounded-2xl shrink-0" />
            <Skeleton width={52} height={52} className="rounded-2xl shrink-0" />
          </div>

          {/* Specifications Table Preview */}
          <div className="pt-6 border-t border-gray-100 space-y-3">
            <Skeleton width={160} height={20} className="rounded-md" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-gray-100">
                  <Skeleton width={110} height={14} />
                  <Skeleton width={140} height={14} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
