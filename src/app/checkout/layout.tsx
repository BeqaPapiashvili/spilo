import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "შეკვეთის გაფორმება — Spilo.ge",
  description: "შეიძინეთ უსაფრთხოდ 0% ონლაინ განვადებით და ბარათით Spilo.ge-ზე.",
  noIndex: true,
});

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
