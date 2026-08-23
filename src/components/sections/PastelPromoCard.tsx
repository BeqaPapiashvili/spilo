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
  const bgColor = card.bgColor || "#FEF08A";

  const content = (
    <div
      className={`relative h-[155px] md:h-[165px] w-full rounded-[24px] overflow-hidden select-none border border-black/5 shadow-xs group cursor-pointer ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Top-Left Badge (ფასდაკლების პილულა) */}
      {card.badge && (
        <div className="absolute top-3.5 left-3.5 z-10 bg-white/95 rounded-full px-3 py-1 shadow-2xs flex items-center gap-1.5 border border-black/5">
          <Flame className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B] shrink-0" />
          <span className="text-xs text-gray-950 tracking-tight">
            {card.badge}
          </span>
        </div>
      )}

      {/* Bottom-Left Title & Subtitle */}
      <div className="absolute bottom-3.5 left-3.5 max-w-[55%] z-10 space-y-0.5">
        <h3 className="text-sm md:text-base text-gray-950 leading-snug line-clamp-2">
          {card.title || "სათაური"}
        </h3>
        {card.subtitle && (
          <p className="text-[11px] text-gray-800 line-clamp-1 opacity-85">
            {card.subtitle}
          </p>
        )}
      </div>

      {/* Right-Aligned Product Image */}
      {card.bgImageUrl && (
        <div className="absolute right-1 bottom-0 top-0 w-[45%] flex items-end justify-end pointer-events-none z-0 p-1.5">
          <img
            src={card.bgImageUrl}
            alt={card.title || "Promo"}
            className="object-contain object-bottom h-[88%] max-h-[145px] drop-shadow-md"
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
