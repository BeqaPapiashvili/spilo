import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "პირადი კაბინეტი — Spilo.ge",
  description: "თქვენი ანგარიში, შეკვეთების ისტორია და შენახული მისამართები Spilo.ge-ზე.",
  noIndex: true,
});

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
