import React from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { constructMetadata, getSeoSettings } from "@/lib/seo";
import { CategoryDetailClient } from "./CategoryDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const category = await prisma.category.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
  }).catch(() => null);

  const siteSeo = await getSeoSettings(`category_${slug}`);

  if (!category) {
    return constructMetadata({
      title: siteSeo.hasSpecificOverride ? siteSeo.title : "კატეგორია ვერ მოიძებნა",
      description: siteSeo.description,
      noIndex: true,
    });
  }

  const title = siteSeo.hasSpecificOverride
    ? siteSeo.title
    : `${category.name} — ტექნიკა და აქსესუარები`;

  const description = siteSeo.hasSpecificOverride
    ? siteSeo.description
    : `შეიძინეთ ${category.name} საუკეთესო ფასად 0% ონლაინ განვადებით და უფასო მიწოდებით მთელ საქართველოში Spilo.ge-ზე.`;


  return constructMetadata({
    title,
    description,
    ogImage: siteSeo.ogImage,
    canonicalUrl: `/categories/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  const categoryRaw = await prisma.category.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
  }).catch(() => null);

  let category = null;
  if (categoryRaw) {
    let children = (categoryRaw as any).children || [];
    if ((categoryRaw as any).childrenJson) {
      try {
        children = JSON.parse((categoryRaw as any).childrenJson);
      } catch {
        // fallback
      }
    }
    category = {
      id: categoryRaw.id,
      name: categoryRaw.name,
      slug: categoryRaw.slug,
      icon: categoryRaw.icon,
      children,
    };
  }

  return (
    <CategoryDetailClient
      slug={slug}
      initialCategory={category as any}
    />
  );
}
