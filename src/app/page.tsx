export const dynamic = "force-dynamic";
export const revalidate = 0;

import dynamicImport from "next/dynamic";
import { resolveStorefrontFeed, ResolvedStorefrontSection } from "@/lib/storefrontFeed";
import { Skeleton } from "@/components/ui/Skeleton";

function SectionFallback({ height = 240 }: { height?: number }) {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-2">
      <Skeleton height={height} className="w-full rounded-3xl" />
    </div>
  );
}

// Dynamic Imports for Granular Polymorphic Section Components
const HeroBannerSection = dynamicImport(() => import("@/components/home/HeroBannerSection"), {
  loading: () => <SectionFallback height={360} />,
  ssr: true,
});

const FeaturedCategories = dynamicImport(() => import("@/components/home/FeaturedCategories"), {
  loading: () => <SectionFallback height={120} />,
  ssr: true,
});

const DynamicProductCarouselSection = dynamicImport(() => import("@/components/home/DynamicProductCarouselSection"), {
  loading: () => <SectionFallback height={320} />,
  ssr: true,
});

const DynamicProductGridSection = dynamicImport(() => import("@/components/home/DynamicProductGridSection"), {
  loading: () => <SectionFallback height={340} />,
  ssr: true,
});

const PromoBannerGrid = dynamicImport(() => import("@/components/home/PromoBannerGrid"), {
  loading: () => <SectionFallback height={240} />,
  ssr: true,
});

const PromoCarouselSection = dynamicImport(() => import("@/components/home/PromoCarouselSection"), {
  loading: () => <SectionFallback height={240} />,
  ssr: true,
});

const DynamicBannerSection = dynamicImport(() => import("@/components/home/DynamicBannerSection"), {
  loading: () => <SectionFallback height={220} />,
  ssr: true,
});

const BrandsGrid = dynamicImport(() => import("@/components/home/BrandsGrid"), {
  loading: () => <SectionFallback height={100} />,
  ssr: true,
});

const RecentlyViewedSection = dynamicImport(() => import("@/components/home/RecentlyViewedSection"), {
  loading: () => <SectionFallback height={160} />,
  ssr: true,
});

const TrustStripSection = dynamicImport(() => import("@/components/home/TrustStripSection"), {
  loading: () => <SectionFallback height={100} />,
  ssr: true,
});

export default async function Home() {
  const sections: ResolvedStorefrontSection[] = await resolveStorefrontFeed();

  const renderSection = (sec: ResolvedStorefrontSection) => {
    const type = (sec.type || "").toUpperCase();
    const key = (sec.key || "").toLowerCase();

    // 1. Hero Banner
    // 1. Hero Banner Slider
    if (type === "HERO_BANNER" || key === "hero_banner" || key === "hero") {
      return (
        <HeroBannerSection
          key={sec.id}
          title={sec.title}
          subtitle={sec.subtitle}
          heroSlides={sec.resolvedHeroSlides}
          config={sec.config}
        />
      );
    }

    // 2. Category Grid / Cards
    if (type === "CATEGORY_GRID" || type === "CATEGORY_CIRCLE_LIST" || key === "categories_grid" || key === "categories") {
      return (
        <FeaturedCategories
          key={sec.id}
          title={sec.title}
          subtitle={sec.subtitle}
          categories={sec.resolvedCategories}
          config={sec.config}
        />
      );
    }

    // 3. Product Carousel (e.g. DJI, Mobiles, Laptops, Flash Deals, etc.)
    if (type === "PRODUCT_CAROUSEL" || key === "dji_products" || key === "mobile_products" || key === "laptop_products" || key === "flash_deals") {
      return (
        <DynamicProductCarouselSection
          key={sec.id}
          title={sec.title}
          subtitle={sec.subtitle}
          config={sec.config}
          products={sec.resolvedProducts}
        />
      );
    }

    // 4. Product Grid
    if (type === "PRODUCT_GRID") {
      return (
        <DynamicProductGridSection
          key={sec.id}
          title={sec.title}
          subtitle={sec.subtitle}
          config={sec.config}
          products={sec.resolvedProducts}
        />
      );
    }

    // 5. Promo Banner Grid / Cards
    if (type === "PROMO_BANNER_GRID") {
      return (
        <PromoBannerGrid
          key={sec.id}
          title={sec.title}
          subtitle={sec.subtitle}
          banners={sec.resolvedBanners}
          config={sec.config}
        />
      );
    }

    // 6. Promo Carousel Swiper Cards / Pastel Promo Cards
    if (type === "PROMO_CAROUSEL" || type === "PROMO_CARDS" || type === "PASTEL_PROMO_CARDS" || key === "promo_cards" || key === "promos") {
      return (
        <PromoCarouselSection
          key={sec.id}
          title={sec.title}
          subtitle={sec.subtitle}
          cards={sec.resolvedPromoCards}
          config={sec.config}
        />
      );
    }

    // 7. Feature Banners (Apple, PS5, Custom Banners)
    if (type === "BANNER" || type === "CUSTOM_BANNER" || key === "apple_promo_banner" || key === "ps5_promo_banner" || key === "custom_banner") {
      return (
        <DynamicBannerSection
          key={sec.id}
          title={sec.title}
          subtitle={sec.subtitle}
          config={sec.config}
        />
      );
    }

    // 8. Brands Grid / Marquee
    if (type === "BRAND_GRID" || type === "BRAND_MARQUEE" || key === "brands_carousel" || key === "brands") {
      return (
        <BrandsGrid
          key={sec.id}
          title={sec.title}
          subtitle={sec.subtitle}
          brands={sec.resolvedBrands}
          config={sec.config}
        />
      );
    }

    // 9. Recently Viewed
    if (type === "RECENTLY_VIEWED" || key === "recently_viewed") {
      return (
        <RecentlyViewedSection
          key={sec.id}
          title={sec.title}
          subtitle={sec.subtitle}
          config={sec.config}
        />
      );
    }

    // 10. Trust Features Strip
    if (type === "TRUST_STRIP" || key === "trust_strip") {
      return (
        <TrustStripSection
          key={sec.id}
          title={sec.title}
          subtitle={sec.subtitle}
          trustItems={sec.resolvedTrustItems}
          config={sec.config}
        />
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col gap-10 pb-24 bg-white min-h-[50vh]">
      {sections.map((sec) => renderSection(sec))}
    </div>
  );
}
