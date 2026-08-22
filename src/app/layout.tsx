import type { Metadata } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import "./globals.css";
import { StorefrontLayoutWrapper } from "@/components/StorefrontLayoutWrapper";

const notoGeorgian = Noto_Sans_Georgian({
  variable: "--font-noto-georgian",
  subsets: ["georgian", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

import { getSeoSettings, constructMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings("home");
  return constructMetadata({
    title: seo.title,
    description: seo.description,
    ogImage: seo.ogImage,
    canonicalUrl: "/",
  });
}


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
