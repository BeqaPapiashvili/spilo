"use client";

import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-[350px] w-full bg-white rounded-2xl p-3 border border-gray-100/80 shadow-xs justify-between">
      {/* Top Image Preview Box */}
      <div className="relative w-full h-[180px] rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-2 shrink-0">
        <Skeleton className="w-full h-full rounded-lg" />
        {/* Top Badges */}
        <div className="absolute top-2 left-2">
          <Skeleton width={42} height={20} className="rounded-md" />
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <Skeleton width={28} height={28} className="rounded-md" />
          <Skeleton width={28} height={28} className="rounded-md" />
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-col flex-1 justify-between pt-3 px-1">
        {/* 2-Line Title */}
        <div className="space-y-1.5">
          <Skeleton variant="text" width="92%" height={14} />
          <Skeleton variant="text" width="65%" height={14} />
        </div>

        {/* Price & Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-baseline gap-2">
            <Skeleton width={80} height={22} className="rounded-md" />
            <Skeleton width={45} height={14} className="rounded-md" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton height={36} className="flex-1 rounded-xl" />
            <Skeleton width={36} height={36} className="rounded-xl shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};
