"use client";

import dynamic from "next/dynamic";
import HeroBannerSection from "@/components/home/HeroBannerSection";
import { Skeleton } from "@/components/ui/Skeleton";

// Section Skeleton Fallback Component
function SectionFallback({ height = 240 }: { height?: number }) {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-4">
      <Skeleton height={height} className="w-full rounded-3xl" />
    </div>
  );
}

// Below-the-fold Sections loaded dynamically for optimal Performance
const FeaturedCategories = dynamic(() => import("@/components/home/FeaturedCategories"), {
  loading: () => <SectionFallback height={120} />,
  ssr: true,
});

const FlashDealsSection = dynamic(() => import("@/components/home/FlashDealsSection"), {
  loading: () => <SectionFallback height={340} />,
  ssr: true,
});

const PromoBannersSection = dynamic(() => import("@/components/home/PromoBannersSection"), {
  loading: () => <SectionFallback height={260} />,
  ssr: true,
});

const BrandsGrid = dynamic(() => import("@/components/home/BrandsGrid"), {
  loading: () => <SectionFallback height={100} />,
  ssr: true,
});

const RecentlyViewedSection = dynamic(() => import("@/components/home/RecentlyViewedSection"), {
  loading: () => <SectionFallback height={160} />,
  ssr: true,
});

export default function Home() {
  return (
    <div className="flex flex-col gap-14 pb-24 bg-white">
      {/* Above-the-fold (Static Import) */}
      <HeroBannerSection />

      {/* Below-the-fold (Dynamic Load with Skeletons) */}
      <FeaturedCategories />
      <FlashDealsSection />
      <PromoBannersSection />
      <BrandsGrid />
      <RecentlyViewedSection />
    </div>
  );
}
