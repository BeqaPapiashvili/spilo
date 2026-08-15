"use client";

import React from "react";
import Link from "next/link";
import { 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  Headphones, 
  RotateCcw, 
  Sparkles, 
  Award, 
  Clock 
} from "lucide-react";
import { TrustItem, DEFAULT_TRUST_ITEMS } from "@/types/storefront";

const ICON_MAP: Record<string, any> = {
  Truck,
  CreditCard,
  ShieldCheck,
  Headphones,
  RotateCcw,
  Sparkles,
  Award,
  Clock,
};

interface TrustStripSectionProps {
  id?: string;
  title?: string | null;
  subtitle?: string | null;
  trustItems?: TrustItem[];
  config?: any;
}

export default function TrustStripSection({
  title,
  subtitle,
  trustItems,
  config,
}: TrustStripSectionProps = {}) {
  const items: TrustItem[] =
    (trustItems && trustItems.length > 0)
      ? trustItems
      : (config?.trustItems && Array.isArray(config.trustItems) && config.trustItems.length > 0)
      ? config.trustItems
      : DEFAULT_TRUST_ITEMS;

  return (
    <section className="py-2">
      <div className="container mx-auto px-4 lg:px-8">
        {title && (
          <div className="mb-4">
            <h2 className="text-xl md:text-2xl text-gray-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        )}

        <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || Sparkles;
            const iconColor = item.iconColor || "#2563eb";

            const cardContent = (
              <div className="flex items-center gap-3 group transition-transform duration-200 hover:translate-x-0.5 cursor-pointer">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-200 group-hover:scale-105"
                  style={{
                    backgroundColor: `${iconColor}15`,
                    color: iconColor,
                  }}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs md:text-sm text-gray-900 truncate">
                    {item.title}
                  </h4>
                  {item.subtitle && (
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
            );

            if (item.link) {
              return (
                <Link key={item.id} href={item.link} className="block">
                  {cardContent}
                </Link>
              );
            }

            return <div key={item.id}>{cardContent}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
