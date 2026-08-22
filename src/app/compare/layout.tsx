import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "პროდუქტების შედარება — Spilo.ge",
  description: "შეადარეთ ტექნიკისა და სმარტფონების მახასიათებლები, ფასები და პარამეტრები Spilo.ge-ზე.",
});

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
