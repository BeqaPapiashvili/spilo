import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const DEFAULT_SITE_TITLE = "Spilo.ge — ონლაინ ტექნიკის მაღაზია | ტელეფონები, ლეპტოპები";
export const DEFAULT_SITE_DESC = "შეიძინეთ უახლესი ტექნიკა 0% ონლაინ განვადებით და უფასო მიწოდებით მთელ საქართველოში Spilo-ზე.";
export const DEFAULT_OG_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://spilo.ge";

export interface ParsedSeoData {
  title: string;
  description: string;
  keywords?: string;
  ogImage: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
}

/**
 * Fetches SEO settings from MySQL database with automatic hierarchy fallback:
 * pageSlug entry -> home entry -> hardcoded default
 */
export async function getSeoSettings(pageSlug?: string): Promise<ParsedSeoData & { hasSpecificOverride: boolean }> {
  try {
    let setting = null;
    let hasSpecificOverride = false;

    if (pageSlug && pageSlug !== "home") {
      setting = await prisma.seoSetting.findUnique({
        where: { pageSlug },
      }).catch(() => null);

      if (setting) {
        hasSpecificOverride = true;
      }
    }

    if (!setting) {
      setting = await prisma.seoSetting.findUnique({
        where: { pageSlug: "home" },
      }).catch(() => null);
    }

    let ogImage = DEFAULT_OG_IMAGE;
    let googleAnalyticsId: string | undefined = undefined;
    let facebookPixelId: string | undefined = undefined;

    if (setting?.metaKeywords) {
      try {
        const parsed = JSON.parse(setting.metaKeywords);
        if (parsed.ogImage) ogImage = parsed.ogImage;
        if (parsed.googleAnalyticsId) googleAnalyticsId = parsed.googleAnalyticsId;
        if (parsed.facebookPixelId) facebookPixelId = parsed.facebookPixelId;
      } catch {
        // Plain text keywords
      }
    }

    return {
      title: setting?.metaTitle?.trim() || DEFAULT_SITE_TITLE,
      description: setting?.metaDescription?.trim() || DEFAULT_SITE_DESC,
      keywords: setting?.metaKeywords || undefined,
      ogImage,
      googleAnalyticsId,
      facebookPixelId,
      hasSpecificOverride,
    };
  } catch (error) {
    console.error("getSeoSettings error:", error);
    return {
      title: DEFAULT_SITE_TITLE,
      description: DEFAULT_SITE_DESC,
      ogImage: DEFAULT_OG_IMAGE,
      hasSpecificOverride: false,
    };
  }
}


export interface ConstructMetadataOptions {
  title?: string;
  description?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  type?: "website" | "article";
}

/**
 * Constructs standard Next.js App Router Metadata object.
 */
export function constructMetadata(options: ConstructMetadataOptions = {}): Metadata {
  const {
    title = DEFAULT_SITE_TITLE,
    description = DEFAULT_SITE_DESC,
    ogImage = DEFAULT_OG_IMAGE,
    canonicalUrl,
    noIndex = false,
    type = "website",
  } = options;

  const fullTitle = title.includes("Spilo") ? title : `${title} | Spilo.ge`;
  const cleanDescription = description.length > 165 ? `${description.slice(0, 162)}...` : description;
  const canonical = canonicalUrl ? (canonicalUrl.startsWith("http") ? canonicalUrl : `${SITE_URL}${canonicalUrl}`) : undefined;

  return {
    title: fullTitle,
    description: cleanDescription,
    metadataBase: new URL(SITE_URL),
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: fullTitle,
      description: cleanDescription,
      url: canonical || SITE_URL,
      siteName: "Spilo.ge",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: "ka_GE",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: cleanDescription,
      images: [ogImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

/**
 * Generates Schema.org Product Structured Data (JSON-LD) for enhanced search results.
 */
export function generateProductJsonLd(product: {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  discountPrice?: number | null;
  sku?: string;
  stock?: number;
  images?: any;
  brand?: { name: string } | null;
  category?: { name: string } | null;
  reviews?: Array<{ rating: number }>;
}) {
  const images = Array.isArray(product.images)
    ? product.images
    : typeof product.images === "string"
    ? [product.images]
    : [];

  const effectivePrice = product.discountPrice || product.price;
  const availability = (product.stock ?? 1) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

  const reviewsCount = product.reviews?.length || 0;
  const avgRating = reviewsCount > 0
    ? (product.reviews!.reduce((acc, r) => acc + r.rating, 0) / reviewsCount).toFixed(1)
    : undefined;

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: images.length > 0 ? images : [DEFAULT_OG_IMAGE],
    description: product.description || `${product.title} - შეიძინეთ საუკეთესო ფასად Spilo.ge-ზე.`,
    sku: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: product.brand?.name || "Spilo",
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.id}`,
      priceCurrency: "GEL",
      price: effectivePrice,
      availability,
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  if (reviewsCount > 0 && avgRating) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating,
      reviewCount: reviewsCount,
    };
  }

  return jsonLd;
}
