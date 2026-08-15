"use client";

import PastelPromoCard from "@/components/sections/PastelPromoCard";
import { PromoCardItem } from "@/types/storefront";

interface PastelPromoCardsSectionProps {
  id?: string;
  title?: string | null;
  subtitle?: string | null;
  cards?: PromoCardItem[];
  config?: any;
}

export default function PastelPromoCardsSection({
  title,
  subtitle,
  cards = [],
}: PastelPromoCardsSectionProps) {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {cards.map((card) => (
            <PastelPromoCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
