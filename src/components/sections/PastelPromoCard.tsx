"use client";

import React from "react";
import Link from "next/link";
import { Flame, Sparkles, Zap, ArrowRight } from "lucide-react";
import { PromoCardItem } from "@/types/storefront";

interface PastelPromoCardProps {
  card: PromoCardItem;
  asLink?: boolean;
  className?: string;
  index?: number;
}

// Preset luxury gradient colorways if not explicitly provided
const COLOR_PRESETS = [
  {
    bg: "bg-gradient-to-br from-[#FFF5F2] via-[#FFEAE5] to-[#FED7CC]/60",
    border: "border-[#FED7CC]/80 hover:border-[#FF5238]/40",
    badgeBg: "bg-white/95 text-[#FF5238]",
    badgeBorder: "border-[#FED7CC]",
    textColor: "text-zinc-900",
    subtextColor: "text-zinc-600",
    ctaBg: "bg-white text-zinc-900 hover:bg-[#FF5238] hover:text-white",
    icon: Flame,
    iconColor: "text-[#FF5238]",
  },
  {
    bg: "bg-gradient-to-br from-zinc-900 via-zinc-800 to-black text-white",
    border: "border-zinc-800 hover:border-zinc-700",
    badgeBg: "bg-white/10 backdrop-blur-md text-zinc-200",
    badgeBorder: "border-white/10",
    textColor: "text-white",
    subtextColor: "text-zinc-400",
    ctaBg: "bg-white text-zinc-900 hover:bg-[#FF5238] hover:text-white",
    icon: Sparkles,
    iconColor: "text-amber-400",
  },
  {
    bg: "bg-gradient-to-br from-[#F0FDF4] via-[#DCFCE7]/70 to-[#BBF7D0]/50",
    border: "border-emerald-200/80 hover:border-emerald-400/60",
    badgeBg: "bg-white/95 text-emerald-700",
    badgeBorder: "border-emerald-200",
    textColor: "text-zinc-900",
    subtextColor: "text-zinc-600",
    ctaBg: "bg-white text-zinc-900 hover:bg-emerald-600 hover:text-white",
    icon: Zap,
    iconColor: "text-emerald-600",
  },
];

export default function PastelPromoCard({
  card,
  asLink = true,
  className = "",
  index = 0,
}: PastelPromoCardProps) {
  const preset = COLOR_PRESETS[index % COLOR_PRESETS.length];
  const BadgeIcon = preset.icon;

  const content = (
    <div
      className={`group relative h-[180px] sm:h-[195px] w-full rounded-[28px] overflow-hidden select-none border transition-all duration-300 shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between p-5 ${preset.bg} ${preset.border} ${className}`}
    >
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-white/20 blur-2xl pointer-events-none" />

      {/* Top Header: Badge Pill */}
      <div className="relative z-10 flex items-center justify-between">
        {card.badge ? (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border shadow-2xs ${preset.badgeBg} ${preset.badgeBorder}`}
          >
            <BadgeIcon className={`w-3.5 h-3.5 ${preset.iconColor}`} />
            <span>{card.badge}</span>
          </div>
        ) : (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border shadow-2xs ${preset.badgeBg} ${preset.badgeBorder}`}
          >
            <BadgeIcon className={`w-3.5 h-3.5 ${preset.iconColor}`} />
            <span>სპეციალური შეთავაზება</span>
          </div>
        )}
      </div>

      {/* Bottom Content: Title, Subtitle, and CTA Button */}
      <div className="relative z-10 max-w-[58%] space-y-2">
        <div className="space-y-0.5">
          <h3 className={`text-sm sm:text-base leading-snug line-clamp-2 ${preset.textColor}`}>
            {card.title || "სპეციალური აქცია"}
          </h3>
          {card.subtitle && (
            <p className={`text-[11px] sm:text-xs line-clamp-1 ${preset.subtextColor}`}>
              {card.subtitle}
            </p>
          )}
        </div>

        {/* Interactive Action Pill */}
        <div className="pt-0.5">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] shadow-xs transition-all duration-200 group-hover:gap-1.5 ${preset.ctaBg}`}
          >
            <span>ნახვა</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>

      {/* Right-Aligned Floating 3D Product Image */}
      {card.bgImageUrl && (
        <div className="absolute right-2 bottom-0 top-0 w-[45%] flex items-end justify-end pointer-events-none z-0 p-2">
          <img
            src={card.bgImageUrl}
            alt={card.title || "Promo"}
            className="object-contain object-bottom h-[90%] max-h-[165px] drop-shadow-xl transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1"
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
