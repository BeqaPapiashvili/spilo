import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "კალათა — Spilo.ge",
  description: "თქვენი არჩეული პროდუქტები Spilo.ge-ზე. გააფორმეთ შეკვეთა მარტივად და სწრაფად.",
  noIndex: true,
});

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
