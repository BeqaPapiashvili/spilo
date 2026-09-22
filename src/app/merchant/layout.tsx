"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Store } from "lucide-react";
import { MerchantRoute } from "@/components/merchant/MerchantRoute";
import { MerchantSidebar } from "@/components/merchant/MerchantSidebar";
import { useStore } from "@/store/useStore";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { adminUser } = useStore();
  const storeName = (adminUser as { store?: { name?: string } } | null)?.store?.name || adminUser?.name;

  if (pathname === "/merchant/login") {
    return <MerchantRoute>{children}</MerchantRoute>;
  }

  return (
    <MerchantRoute>
      <div className="h-screen bg-[#F3F4F6] flex overflow-hidden">
        <MerchantSidebar storeName={storeName || undefined} />
        <div className="flex-1 min-w-0 min-h-0 overflow-y-auto">
          <header className="lg:hidden bg-[#111111] text-white px-4 py-3 flex items-center justify-between">
            <span className="text-sm truncate">{storeName || "პარტნიორი"}</span>
            <div className="flex gap-3 text-xs text-white/75">
              <Link href="/merchant">დაფა</Link>
              <Link href="/merchant/orders">შეკვეთები</Link>
              <Link href="/merchant/products">პროდუქტები</Link>
              <Link href="/merchant/store">მაღაზია</Link>
            </div>
          </header>
          <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
              <Store className="w-3.5 h-3.5" />
              მხოლოდ თქვენი მაღაზიის მონაცემები · ასაღები ფასი, არა გაყიდვის ფასი
            </div>
            {children}
          </main>
        </div>
      </div>
    </MerchantRoute>
  );
}
