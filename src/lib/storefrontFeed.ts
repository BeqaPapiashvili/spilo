import { getPrismaClient } from "@/lib/prisma";

export interface ResolvedProductItem {
  id: string;
  title: string;
  slug: string;
  sku: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  monthlyInstallment?: number;
  image: string;
  images: string[];
  categoryName: string;
  categorySlug: string;
  brandName: string;
  brandSlug: string;
  brandLogo?: string;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  stock: number;
}

export interface ResolvedCategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  productCount?: number;
}

export interface ResolvedBrandItem {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  productCount?: number;
}

export interface ResolvedBannerItem {
  id?: string;
  title?: string;
  subtitle?: string;
  tagText?: string;
  buttonText?: string;
  bannerUrl?: string;
  link?: string;
  badge?: string;
}

import { 
  PromoStyleConfig, 
  PromoCardItem, 
  TrustItem, 
  HeroSlideItem, 
  DEFAULT_PROMO_CARDS, 
  DEFAULT_TRUST_ITEMS, 
  DEFAULT_HERO_SLIDES 
} from "@/types/storefront";
export * from "@/types/storefront";

export interface ResolvedStorefrontSection {
  id: string;
  key?: string | null;
  type: string;
  title?: string | null;
  subtitle?: string | null;
  isEnabled: boolean;
  sortOrder: number;
  config?: any;
  resolvedProducts?: ResolvedProductItem[];
  resolvedCategories?: ResolvedCategoryItem[];
  resolvedBrands?: ResolvedBrandItem[];
  resolvedBanners?: ResolvedBannerItem[];
  resolvedPromoCards?: PromoCardItem[];
  resolvedHeroBanners?: any[];
  resolvedHeroSlides?: HeroSlideItem[];
  resolvedTrustItems?: TrustItem[];
}

function parseImages(imagesJson: any): string[] {
  if (Array.isArray(imagesJson)) return imagesJson;
  if (typeof imagesJson === "string") {
    try {
      const parsed = JSON.parse(imagesJson);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    if (imagesJson.startsWith("http") || imagesJson.startsWith("/")) {
      return [imagesJson];
    }
  }
  return ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"];
}

export async function resolveStorefrontFeed(): Promise<ResolvedStorefrontSection[]> {
  const prisma = getPrismaClient();

  if (!prisma.storefrontSection) {
    return [];
  }

  const rawSections = await prisma.storefrontSection.findMany({
    where: { isEnabled: true },
    orderBy: { sortOrder: "asc" },
  });

  const enrichedSections: ResolvedStorefrontSection[] = [];

  for (const sec of rawSections) {
    const type = (sec.type || "PRODUCT_CAROUSEL").toUpperCase();
    const config = (sec.config as any) || {};

    const enrichedSec: ResolvedStorefrontSection = {
      id: sec.id,
      key: sec.key,
      type,
      title: sec.title,
      subtitle: sec.subtitle,
      isEnabled: sec.isEnabled,
      sortOrder: sec.sortOrder,
      config,
    };

    // 1. PRODUCT CAROUSEL or PRODUCT GRID
    if (type === "PRODUCT_CAROUSEL" || type === "PRODUCT_GRID") {
      let products: any[] = [];
      const limit = Number(config.limit) || 8;

      if (config.sourceType === "MANUAL" && Array.isArray(config.manualProductIds) && config.manualProductIds.length > 0) {
        // Query exact manual IDs
        const found = await prisma.product.findMany({
          where: { id: { in: config.manualProductIds } },
          include: {
            category: true,
            brand: true,
            reviews: { select: { rating: true } },
          },
        });
        // Preserve exact manual array order
        const map = new Map(found.map((p) => [p.id, p]));
        products = config.manualProductIds
          .map((id: string) => map.get(id))
          .filter(Boolean);
      } else {
        // AUTOMATIC SOURCE: Dynamic Prisma where clause
        const whereClause: any = {};

        // Brand filter
        if (config.brand) {
          const b = String(config.brand).trim();
          whereClause.OR = [
            { brandId: b },
            { brand: { slug: b.toLowerCase() } },
            { brand: { name: { contains: b } } },
          ];
        }

        // Category filter
        if (config.categoryId) {
          const c = String(config.categoryId).trim();
          const catCondition = [
            { categoryId: c },
            { category: { slug: c.toLowerCase() } },
            { category: { name: { contains: c } } },
          ];
          if (whereClause.OR) {
            whereClause.AND = [
              { OR: whereClause.OR },
              { OR: catCondition },
            ];
            delete whereClause.OR;
          } else {
            whereClause.OR = catCondition;
          }
        }

        // Discounted only
        if (config.onlyDiscounted || config.isFlash) {
          whereClause.discountPrice = { not: null, gt: 0 };
        }

        // Featured only
        if (config.isFeatured) {
          whereClause.isFeatured = true;
        }

        // Dynamic OrderBy
        let orderByClause: any = { createdAt: "desc" };
        if (config.orderBy === "price_asc") {
          orderByClause = { price: "asc" };
        } else if (config.orderBy === "price_desc") {
          orderByClause = { price: "desc" };
        } else if (config.orderBy === "discount_desc") {
          orderByClause = { discountPercentage: "desc" };
        }

        products = await prisma.product.findMany({
          where: whereClause,
          orderBy: orderByClause,
          take: limit,
          include: {
            category: true,
            brand: true,
            reviews: { select: { rating: true } },
          },
        });
      }

      // Format resolved products
      enrichedSec.resolvedProducts = products.map((p) => {
        const imageList = parseImages(p.images);
        const totalRating = p.reviews && p.reviews.length > 0
          ? p.reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / p.reviews.length
          : 5;

        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          sku: p.sku,
          price: p.price,
          discountPrice: p.discountPrice || undefined,
          discountPercentage: p.discountPercentage || (p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : undefined),
          monthlyInstallment: p.monthlyInstallment || Math.round(p.price / 24),
          image: imageList[0] || "/placeholder.png",
          images: imageList,
          categoryName: p.category?.name || "ტექნიკა",
          categorySlug: p.category?.slug || "tech",
          brandName: p.brand?.name || "Spilo",
          brandSlug: p.brand?.slug || "spilo",
          brandLogo: p.brand?.logo || undefined,
          rating: Number(totalRating.toFixed(1)),
          reviewCount: p.reviews?.length || 0,
          isFeatured: p.isFeatured,
          isFlashDeal: p.isFlashDeal,
          stock: p.stock,
        };
      });

      // If section yields 0 products, omit it so no empty white block is rendered
      if (enrichedSec.resolvedProducts.length === 0) {
        continue;
      }
    }

    // 2. CATEGORY GRID or CATEGORY CIRCLE LIST
    else if (type === "CATEGORY_GRID" || type === "CATEGORY_CIRCLE_LIST") {
      const limit = Number(config.limit) || 12;
      const isManual = config.categoryMode === "MANUAL" && Array.isArray(config.selectedCategoryIds) && config.selectedCategoryIds.length > 0;

      const whereClause = isManual
        ? { OR: [{ id: { in: config.selectedCategoryIds } }, { slug: { in: config.selectedCategoryIds } }] }
        : {};

      const categories = await prisma.category.findMany({
        where: whereClause,
        take: isManual ? undefined : limit,
        include: {
          _count: { select: { products: true } },
        },
      });

      let mappedCategories = categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon || "Sparkles",
        productCount: c._count?.products || 0,
      }));

      // Preserve manual order if manual mode
      if (isManual) {
        const orderMap = new Map<string, number>(config.selectedCategoryIds.map((id: string, idx: number) => [id, idx]));
        mappedCategories.sort((a, b) => {
          const idxA: number = orderMap.get(a.id) ?? orderMap.get(a.slug) ?? 999;
          const idxB: number = orderMap.get(b.id) ?? orderMap.get(b.slug) ?? 999;
          return idxA - idxB;
        });
      }

      enrichedSec.resolvedCategories = mappedCategories;
    }

    // 3. BRAND GRID or BRAND MARQUEE
    else if (type === "BRAND_GRID" || type === "BRAND_MARQUEE") {
      const limit = Number(config.limit) || 16;
      const isManual = config.brandMode === "MANUAL" && Array.isArray(config.selectedBrandIds) && config.selectedBrandIds.length > 0;

      const whereClause = isManual
        ? { OR: [{ id: { in: config.selectedBrandIds } }, { slug: { in: config.selectedBrandIds } }] }
        : {};

      const brands = await prisma.brand.findMany({
        where: whereClause,
        take: isManual ? undefined : limit,
        include: {
          _count: { select: { products: true } },
        },
      });

      let mappedBrands = brands.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        logo: b.logo || undefined,
        productCount: b._count?.products || 0,
      }));

      // Preserve manual order if manual mode
      if (isManual) {
        const orderMap = new Map<string, number>(config.selectedBrandIds.map((id: string, idx: number) => [id, idx]));
        mappedBrands.sort((a, b) => {
          const idxA: number = orderMap.get(a.id) ?? orderMap.get(a.slug) ?? 999;
          const idxB: number = orderMap.get(b.id) ?? orderMap.get(b.slug) ?? 999;
          return idxA - idxB;
        });
      }

      enrichedSec.resolvedBrands = mappedBrands;
    }

    // 4. PROMO CAROUSEL / PROMO CARDS
    else if (type === "PROMO_CAROUSEL" || type === "PROMO_CARDS") {
      if (Array.isArray(config.promoCards) && config.promoCards.length > 0) {
        enrichedSec.resolvedPromoCards = config.promoCards;
      } else {
        enrichedSec.resolvedPromoCards = DEFAULT_PROMO_CARDS;
      }
    }

    // 5. PROMO BANNER GRID
    else if (type === "PROMO_BANNER_GRID") {
      if (Array.isArray(config.bannerData) && config.bannerData.length > 0) {
        enrichedSec.resolvedBanners = config.bannerData;
      } else {
        enrichedSec.resolvedBanners = [
          {
            title: "ექსკლუზიური შეთავაზება",
            subtitle: "შეიძინე ტექნიკა საუკეთესო ფასად 0%-იანი განვადებით",
            bannerUrl: config.bannerUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
            link: config.link || "/catalog",
            buttonText: config.buttonText || "ნახვა",
          },
        ];
      }
    }

    // 6. BANNER or CUSTOM_BANNER
    else if (type === "BANNER" || type === "CUSTOM_BANNER") {
      enrichedSec.resolvedBanners = [
        {
          title: sec.title || config.title || "სპეციალური აქცია",
          subtitle: sec.subtitle || config.subtitle || "",
          tagText: config.tagText || "სპეციალური შეთავაზება",
          buttonText: config.buttonText || "ყიდვა",
          bannerUrl: config.bannerUrl || "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1400&q=80",
          link: config.link || config.targetLink || "/catalog",
        },
      ];
    }

    // 7. HERO BANNER
    else if (type === "HERO_BANNER") {
      if (Array.isArray(config.heroSlides) && config.heroSlides.length > 0) {
        enrichedSec.resolvedHeroSlides = config.heroSlides;
      } else if (config.bannerUrl || config.title) {
        enrichedSec.resolvedHeroSlides = [
          {
            id: "slide-1",
            image: config.bannerUrl || "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1400&q=80",
            badge: config.tagText || config.badgeText || "სპეციალური შეთავაზება",
            title: config.title || sec.title || "იპოვე იდეალური საჩუქარი ყველასთვის",
            subtitle: config.subtitle || sec.subtitle || "შეარჩიე, შეფუთე, გაუგზავნე საჩუქარი მარტივად spilo-თი",
            buttonText: config.buttonText || "შეარჩიე საჩუქარი",
            link: config.link || config.targetLink || "/catalog",
          },
        ];
      } else {
        enrichedSec.resolvedHeroSlides = DEFAULT_HERO_SLIDES;
      }

      try {
        if (prisma.banner) {
          const banners = await prisma.banner.findMany({
            where: { isActive: true },
            orderBy: { priority: "asc" },
          });
          enrichedSec.resolvedHeroBanners = banners;
        }
      } catch {}
    }

    // 8. TRUST STRIP
    else if (type === "TRUST_STRIP") {
      if (Array.isArray(config.trustItems) && config.trustItems.length > 0) {
        enrichedSec.resolvedTrustItems = config.trustItems;
      } else {
        enrichedSec.resolvedTrustItems = DEFAULT_TRUST_ITEMS;
      }
    }

    enrichedSections.push(enrichedSec);
  }

  return enrichedSections;
}
