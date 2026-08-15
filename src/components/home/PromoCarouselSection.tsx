"use client";

import PromoCarousel from "@/components/PromoCarousel";
import { PromoCardItem, PromoStyleConfig } from "@/lib/storefrontFeed";

interface PromoCarouselSectionProps {
  id?: string;
  title?: string | null;
  subtitle?: string | null;
  cards?: PromoCardItem[];
  config?: {
    styleConfig?: PromoStyleConfig;
    [key: string]: any;
  } | null;
}

export default function PromoCarouselSection({
  title,
  subtitle,
  cards = [],
  config,
}: PromoCarouselSectionProps) {
  if (!cards || cards.length === 0) return null;

  return (
    <section className="py-2">
      <div className="container mx-auto px-4 lg:px-8">
        {title && (
          <div className="mb-4">
            <h2 className="text-xl md:text-2xl text-gray-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        )}
        <PromoCarousel cards={cards} styleConfig={config?.styleConfig} />
      </div>
    </section>
  );
}
