"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface DynamicBannerProps {
  id?: string;
  title?: string | null;
  subtitle?: string | null;
  config?: {
    bannerUrl?: string;
    link?: string;
    buttonText?: string;
    tagText?: string;
  } | null;
}

export default function DynamicBannerSection({
  title,
  subtitle,
  config,
}: DynamicBannerProps) {
  const bannerUrl =
    config?.bannerUrl ||
    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1400&q=80";
  const link = config?.link || "/catalog";
  const buttonText = config?.buttonText || "ნახვა";
  const tagText = config?.tagText || "სპეციალური შეთავაზება";

  return (
    <section className="py-2">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative rounded-[32px] overflow-hidden min-h-[220px] md:min-h-[260px] flex items-center p-8 md:p-12 bg-gradient-to-r from-gray-950 via-slate-900 to-black text-white shadow-md">
          <img
            src={bannerUrl}
            alt={title || "Promo Banner"}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="relative z-10 max-w-lg space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{tagText}</span>
            </div>
            <h3 className="text-2xl md:text-4xl leading-tight">
              {title || "სპეციალური აქცია"}
            </h3>
            {subtitle && (
              <p className="text-xs md:text-sm text-gray-300">{subtitle}</p>
            )}
            <div className="pt-2">
              <Link
                href={link}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-black px-6 py-2.5 rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer"
              >
                <span>{buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
