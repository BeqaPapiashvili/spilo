"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  aspectRatio?: string;
  shimmer?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "rectangular",
  width,
  height,
  aspectRatio,
  shimmer = true,
  className = "",
  style,
  ...props
}) => {
  const variantClasses = {
    text: "rounded-md h-4 w-full",
    circular: "rounded-full shrink-0",
    rectangular: "rounded-xl",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gray-200/80",
        shimmer ? "shimmer" : "animate-pulse",
        variantClasses[variant],
        className
      )}
      style={{
        width,
        height,
        aspectRatio,
        ...style,
      }}
      {...props}
    />
  );
};
