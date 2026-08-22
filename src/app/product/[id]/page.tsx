export const dynamic = "force-dynamic";
export const revalidate = 0;

import React from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { constructMetadata, getSeoSettings, generateProductJsonLd } from "@/lib/seo";
import { ProductDetailClient } from "./ProductDetailClient";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: {
      brand: true,
      category: true,
    },
  }).catch(() => null);

  if (!product) {
    const siteSeo = await getSeoSettings("product_not_found");
    return constructMetadata({
      title: "პროდუქტი ვერ მოიძებნა",
      description: siteSeo.description,
      noIndex: true,
    });
  }

  const siteSeo = await getSeoSettings(`product_${product.id}`);

  const productImages = Array.isArray(product.images)
    ? (product.images as string[])
    : typeof product.images === "string"
    ? [product.images]
    : [];

  const mainImage = productImages[0] || siteSeo.ogImage;
  const currentPrice = product.discountPrice || product.price;

  // Fallback hierarchy: Page-specific SeoSetting -> Auto-generated product metadata -> Site-wide default
  const title = siteSeo.hasSpecificOverride
    ? siteSeo.title
    : `${product.title} — ${currentPrice} ₾`;

  const description = siteSeo.hasSpecificOverride
    ? siteSeo.description
    : (product.description ? product.description.slice(0, 160) : `შეიძინეთ ${product.title} საუკეთესო ფასად (${currentPrice} ₾) 0% ონლაინ განვადებით და უფასო მიწოდებით Spilo.ge-ზე.`);


  return constructMetadata({
    title,
    description,
    ogImage: mainImage,
    canonicalUrl: `/product/${product.id}`,
    type: "website",
  });
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;

  // Pre-fetch product for Schema.org JSON-LD structured data and fast initial render
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: {
      brand: true,
      category: true,
      reviews: true,
    },
  }).catch(() => null);

  const jsonLd = product ? generateProductJsonLd(product) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient
        id={id}
        initialProduct={
          product
            ? ({
                id: product.id,
                title: product.title,
                slug: product.slug,
                sku: product.sku,
                description: product.description || "",
                price: product.price,
                discountPrice: product.discountPrice || undefined,
                discountPercentage: product.discountPercentage || undefined,
                monthlyInstallment: product.monthlyInstallment || undefined,
                stock: product.stock,
                categoryId: product.categoryId,
                categoryName: product.category?.name,
                brandId: product.brandId,
                brandName: product.brand?.name,
                images: Array.isArray(product.images) ? (product.images as string[]) : [],
                specs: product.specs as any,
                colorName: product.colorName || undefined,
                storage: product.storage || undefined,
                isFeatured: product.isFeatured,
                isFlashDeal: product.isFlashDeal,
              } as any)
            : null
        }
      />
    </>
  );
}
