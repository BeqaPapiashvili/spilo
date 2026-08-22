export const dynamic = "force-dynamic";
export const revalidate = 0;

import React from "react";
import type { Metadata } from "next";
import { constructMetadata, getSeoSettings } from "@/lib/seo";
import { SearchClient } from "./SearchClient";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const siteSeo = await getSeoSettings("search");

  const title = q ? `ძიების შედეგები: "${q}"` : "ძიება კატალოგში";
  const description = q
    ? `საძიებო შედეგები მოთხოვნისთვის "${q}" Spilo.ge-ზე. შეიძინეთ ტექნიკა გარანტიით.`
    : siteSeo.description;

  return constructMetadata({
    title,
    description,
    ogImage: siteSeo.ogImage,
    canonicalUrl: "/search",
    noIndex: Boolean(q), // Search results usually noindex to avoid duplicate content
  });
}

export default function SearchPage() {
  return <SearchClient />;
}
