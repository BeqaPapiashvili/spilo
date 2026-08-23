"use client";

import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-[400px] w-full bg-white rounded-3xl p-4 border border-zinc-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] justify-between">
      {/* Top Floating Row Skeleton */}
      <div className="flex items-center justify-between w-full">
        <Skeleton width={50} height={20} className="rounded-full" />
        <div className="flex gap-2">
          <Skeleton width={24} height={24} className="rounded-full" />
          <Skeleton width={24} height={24} className="rounded-full" />
        </div>
      </div>

      {/* Pure Focal Product Image Skeleton */}
      <div className="relative w-full h-[200px] flex items-center justify-center p-2 my-auto">
        <Skeleton className="w-full h-full rounded-2xl" />
      </div>

      {/* Lower Details & Price/Action Area */}
      <div className="space-y-3 pt-2">
        <div className="space-y-1.5">
          <Skeleton variant="text" width="95%" height={14} />
          <Skeleton variant="text" width="60%" height={14} />
        </div>

        <div className="flex items-end justify-between pt-1 border-t border-zinc-100">
          <div className="space-y-1">
            <Skeleton width={70} height={20} className="rounded-md" />
            <Skeleton width={50} height={12} className="rounded-md" />
          </div>

          <Skeleton width={96} height={40} className="rounded-2xl" />
        </div>
      </div>
    </div>
  );
};
