"use client";

import React from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { PromoCardItem } from "@/types/storefront";

interface PastelPromoCardProps {
  card: PromoCardItem;
  asLink?: boolean;
  className?: string;
}

export default function PastelPromoCard({
  card,
  asLink = true,
  className = "",
}: PastelPromoCardProps) {
  const bgColor = card.bgColor || "#FFC5E3";

  const content = (
    <div
      className={`relative h-[160px] md:h-[175px] w-full rounded-[24px] overflow-hidden select-none border border-black/5 shadow-2xs group transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Top-Left Badge (ფასდაკლების პილულა) */}
      {card.badge && (
        <div className="absolute top-4 left-4 z-10 bg-white/95 rounded-full px-3.5 py-1.5 shadow-sm flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500 shrink-0" />
          <span className="text-xs md:text-sm text-gray-900 tracking-tight">
            {card.badge}
          </span>
        </div>
      )}

      {/* Bottom-Left Title (სათაური) */}
      <div className="absolute bottom-4 left-4 max-w-[55%] z-10">
        <h3 className="text-base md:text-lg text-gray-950 leading-tight line-clamp-2">
          {card.title || "სათაური"}
        </h3>
        {card.subtitle && (
          <p className="text-xs text-gray-700 mt-0.5 line-clamp-1 opacity-80">
            {card.subtitle}
          </p>
        )}
      </div>

      {/* Right-Aligned Product Image (პროდუქტის სურათი) */}
      {card.bgImageUrl && (
        <div className="absolute right-0 bottom-0 top-0 w-[48%] flex items-end justify-end pointer-events-none z-0 p-2">
          <img
            src={card.bgImageUrl}
            alt={card.title || "Promo"}
            className="object-contain object-bottom h-[90%] max-h-[160px] drop-shadow-md group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
    </div>
  );

  if (asLink && card.link) {
    return (
      <Link href={card.link} className="block w-full">
        {content}
      </Link>
    );
  }

  return content;
}
