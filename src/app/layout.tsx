import type { Metadata } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import AuthModal from "@/components/AuthModal";
import Footer from "@/components/Footer";

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
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Header />
        <CartDrawer />
        <AuthModal />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
