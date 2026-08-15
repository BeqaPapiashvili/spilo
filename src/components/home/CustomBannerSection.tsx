"use client";

import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";

interface CustomBannerSectionProps {
  title?: string | null;
  subtitle?: string | null;
  config?: {
    bannerUrl?: string;
    link?: string;
    buttonText?: string;
    tagText?: string;
    bgGradient?: string;
  } | null;
}

export default function CustomBannerSection({
  title,
  subtitle,
  config,
}: CustomBannerSectionProps) {
  const bannerUrl =
    config?.bannerUrl ||
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&q=80";
  const link = config?.link || "/catalog";
  const buttonText = config?.buttonText || "შეთავაზების ნახვა";
  const tagText = config?.tagText || "სპეციალური აქცია";

  return (
    <section className="py-2">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative rounded-[32px] overflow-hidden min-h-[220px] md:min-h-[260px] flex items-center p-8 md:p-12 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white shadow-md">
          <img
            src={bannerUrl}
            alt={title || "Custom Banner"}
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="relative z-10 max-w-lg space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs border border-blue-400/30">
              <Tag className="w-3.5 h-3.5" />
              <span>{tagText}</span>
            </div>
            <h3 className="text-2xl md:text-4xl leading-tight">
              {title || "სპეციალური შეთავაზება Spilo-სგან"}
            </h3>
            {subtitle && (
              <p className="text-xs md:text-sm text-slate-300">{subtitle}</p>
            )}
            <div className="pt-2">
              <Link
                href={link}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 px-6 py-2.5 rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer"
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
