export const dynamic = "force-dynamic";
export const revalidate = 0;

import React from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { constructMetadata, getSeoSettings } from "@/lib/seo";
import { CatalogClient } from "./CatalogClient";

interface CatalogPageProps {
  searchParams: Promise<{ category?: string; brand?: string; q?: string }>;
}

export async function generateMetadata({ searchParams }: CatalogPageProps): Promise<Metadata> {
  const { category, brand, q } = await searchParams;

  let title = "კატალოგი — ყველა პროდუქტი";
  let description = "შეიძინეთ უახლესი ტექნიკა, სმარტფონები, ლეპტოპები და აქსესუარები 0% ონლაინ განვადებით Spilo.ge-ზე.";

  if (category) {
    const cat = await prisma.category.findFirst({
      where: { OR: [{ slug: category }, { id: category }] },
    }).catch(() => null);

    if (cat) {
      title = `${cat.name} — კატალოგი`;
      description = `დაათვალიერეთ და შეიძინეთ ${cat.name} საუკეთესო ფასად 0% განვადებით Spilo-ზე.`;
    }
  } else if (brand) {
    const b = await prisma.brand.findFirst({
      where: { OR: [{ slug: brand }, { id: brand }, { name: brand }] },
    }).catch(() => null);

    if (b) {
      title = `${b.name} — ოფიციალური პროდუქცია`;
      description = `${b.name}-ის ოფიციალური ტექნიკა და აქსესუარები გარანტიით Spilo.ge-ზე.`;
    }
  } else if (q) {
    title = `ძიება: "${q}"`;
    description = `საძიებო შედეგები მოთხოვნისთვის "${q}" Spilo.ge-ზე.`;
  }

  const siteSeo = await getSeoSettings(category ? `category_${category}` : "catalog");

  return constructMetadata({
    title: siteSeo.hasSpecificOverride ? siteSeo.title : title,
    description: siteSeo.hasSpecificOverride ? siteSeo.description : description,
    ogImage: siteSeo.ogImage,
    canonicalUrl: "/catalog",
  });

}

export default function CatalogPage() {
  return <CatalogClient />;
}
