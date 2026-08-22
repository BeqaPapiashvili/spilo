export const dynamic = "force-dynamic";
export const revalidate = 0;

import React from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { constructMetadata, getSeoSettings } from "@/lib/seo";
import { CategoriesClient } from "./CategoriesClient";

export async function generateMetadata(): Promise<Metadata> {
  const siteSeo = await getSeoSettings("categories");

  return constructMetadata({
    title: siteSeo.title !== "Spilo.ge — ონლაინ ტექნიკის მაღაზია | ტელეფონები, ლეპტოპები" ? siteSeo.title : "კატეგორიები — ტექნიკის სრული კატალოგი",
    description: siteSeo.description !== "შეიძინეთ უახლესი ტექნიკა 0% ონლაინ განვადებით და უფასო მიწოდებით მთელ საქართველოში Spilo-ზე." ? siteSeo.description : "დაათვალიერეთ ტექნიკისა და აქსესუარების ყველა კატეგორია Spilo.ge-ზე. სმარტფონები, ლეპტოპები, ტელევიზორები და სხვა.",
    ogImage: siteSeo.ogImage,
    canonicalUrl: "/categories",
  });
}

export default async function CategoriesPage() {
  const categoriesRaw = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { createdAt: "asc" },
  }).catch(() => []);

  const categories = categoriesRaw.map((cat: any) => {
    let children = cat.children || [];
    if (cat.childrenJson) {
      try {
        children = JSON.parse(cat.childrenJson);
      } catch {
        // fallback
      }
    }
    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      children,
    };
  });

  return <CategoriesClient initialCategories={categories as any} />;
}
