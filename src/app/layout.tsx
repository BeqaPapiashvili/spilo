import type { Metadata, Viewport } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import "./globals.css";
import { StorefrontLayoutWrapper } from "@/components/StorefrontLayoutWrapper";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

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
        className="min-h-full flex flex-col font-sans bg-background text-foreground pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0 overflow-x-clip"
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var n=performance.getEntriesByType&&performance.getEntriesByType("navigation")[0];var r=(n&&n.type==="reload")||(performance.navigation&&performance.navigation.type===1);if(!r)return;try{history.scrollRestoration="manual"}catch(e){}function p(){if(window.scrollTo)window.scrollTo(0,0);if(document.documentElement)document.documentElement.scrollTop=0;if(document.body)document.body.scrollTop=0}p();document.addEventListener("DOMContentLoaded",p);window.addEventListener("load",function(){p();requestAnimationFrame(function(){p();setTimeout(p,0);setTimeout(p,120)})});window.addEventListener("pageshow",p)})();`,
          }}
        />
        <StorefrontLayoutWrapper>
          {children}
        </StorefrontLayoutWrapper>
      </body>
    </html>
  );
}
