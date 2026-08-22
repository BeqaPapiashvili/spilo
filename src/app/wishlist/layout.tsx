import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "სურვილების სია — Spilo.ge",
  description: "თქვენი შენახული და რჩეული პროდუქტები Spilo.ge-ზე.",
  noIndex: true,
});

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
