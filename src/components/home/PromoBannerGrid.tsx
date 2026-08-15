"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ResolvedBannerItem } from "@/lib/storefrontFeed";

interface PromoBannerGridProps {
  id?: string;
  title?: string | null;
  subtitle?: string | null;
  banners?: ResolvedBannerItem[];
  config?: any;
}

export default function PromoBannerGrid({
  title,
  subtitle,
  banners = [],
}: PromoBannerGridProps) {
  if (!banners || banners.length === 0) return null;

  const count = banners.length;
  const gridClass =
    count === 1
      ? "grid-cols-1"
      : count === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-3";

  return (
    <section className="py-2">
      <div className="container mx-auto px-4 lg:px-8">
        {title && (
          <div className="mb-5">
            <h2 className="text-xl md:text-2xl text-gray-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        )}

        <div className={`grid ${gridClass} gap-4`}>
          {banners.map((b, idx) => (
            <div
              key={idx}
              className="relative rounded-[28px] overflow-hidden min-h-[220px] md:min-h-[250px] flex items-center p-6 md:p-8 bg-gradient-to-r from-gray-950 via-slate-900 to-black text-white shadow-sm"
            >
              <img
                src={b.bannerUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80"}
                alt={b.title || "Promo Banner"}
                className="absolute inset-0 w-full h-full object-cover opacity-35"
              />
              <div className="relative z-10 max-w-sm space-y-2.5">
                {b.tagText && (
                  <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-[11px] border border-blue-400/30">
                    <Sparkles className="w-3 h-3" />
                    <span>{b.tagText}</span>
                  </div>
                )}
                <h3 className="text-xl md:text-2xl leading-tight">
                  {b.title || "სპეციალური შეთავაზება"}
                </h3>
                {b.subtitle && (
                  <p className="text-xs text-gray-300 line-clamp-2">{b.subtitle}</p>
                )}
                <div className="pt-2">
                  <Link
                    href={b.link || "/catalog"}
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 text-black px-5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <span>{b.buttonText || "ნახვა"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
