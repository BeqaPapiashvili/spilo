import type { Metadata } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import "./globals.css";
import { StorefrontLayoutWrapper } from "@/components/StorefrontLayoutWrapper";

const notoGeorgian = Noto_Sans_Georgian({
  variable: "--font-noto-georgian",
  subsets: ["georgian", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "spilo.ge - ონლაინ მაღაზია საქართველოში",
  description: "შეიძინეთ საუკეთესო ელექტრონიკა, ტექნიკა და სხვა პროდუქტები საქართველოში მარტივად spilo-თი.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ka-GE"
      className={`${notoGeorgian.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col font-sans bg-background text-foreground pb-16 md:pb-0"
        suppressHydrationWarning
      >
        <StorefrontLayoutWrapper>
          {children}
        </StorefrontLayoutWrapper>
      </body>
    </html>
  );
}
