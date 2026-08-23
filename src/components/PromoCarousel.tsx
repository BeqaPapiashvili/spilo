"use client";

import React from "react";
import { PromoCardItem, PromoStyleConfig } from "@/types/storefront";
import PastelPromoCard from "@/components/sections/PastelPromoCard";

interface PromoCarouselProps {
  cards?: PromoCardItem[];
  styleConfig?: PromoStyleConfig;
}

export default function PromoCarousel({
  cards = [],
}: PromoCarouselProps) {
  if (!cards || cards.length === 0) return null;

  // Display up to 3 Bento blocks in a structured grid
  const displayCards = cards.slice(0, 3);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
        {displayCards.map((card, idx) => (
          <PastelPromoCard key={card.id || idx} card={card} index={idx} />
        ))}
      </div>
    </div>
  );
}
