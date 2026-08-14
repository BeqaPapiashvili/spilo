"use client";

import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "rectangular",
  width,
  height,
  className = "",
  style,
  ...props
}) => {
  const variantClasses = {
    text: "rounded-md h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded-xl",
  };

  return (
    <div
      className={`bg-gray-200 animate-pulse ${variantClasses[variant]} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3">
      <Skeleton height={180} className="w-full" />
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="90%" />
      <div className="flex items-center justify-between mt-2">
        <Skeleton variant="text" width="30%" height={24} />
        <Skeleton width={36} height={36} className="rounded-xl" />
      </div>
    </div>
  );
};
