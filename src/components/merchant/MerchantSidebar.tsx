"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Package, Settings, ShoppingBag, Store, Warehouse } from "lucide-react";
import { useStore } from "@/store/useStore";

const LINKS = [
  { href: "/merchant", label: "დაფა", icon: LayoutDashboard },
  { href: "/merchant/orders", label: "შეკვეთები", icon: ShoppingBag },
  { href: "/merchant/products", label: "პროდუქტები", icon: Package },
  { href: "/merchant/warehouses", label: "საწყობები", icon: Warehouse },
  { href: "/merchant/store", label: "მაღაზია", icon: Settings },
];

export function MerchantSidebar({ storeName }: { storeName?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logoutMerchant } = useStore();

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col bg-[#111111] h-screen sticky top-0 p-5 text-white">
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="w-10 h-10 rounded-2xl bg-[#FF5238] flex items-center justify-center">
          <Store className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm truncate">{storeName || "პარტნიორი"}</p>
          <p className="text-[11px] text-white/45">მაღაზიის დაფა</p>
        </div>
      </div>
      <nav className="mt-6 space-y-1">
        {LINKS.map((item) => {
          const active = item.href === "/merchant" ? pathname === "/merchant" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 h-11 px-3 rounded-2xl text-sm ${
                active ? "bg-white text-[#111111]" : "text-white/70 hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-[#FF5238]" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={() => {
          logoutMerchant();
          router.push("/merchant/login");
        }}
        className="mt-auto h-11 px-3 rounded-2xl text-sm text-white/60 hover:bg-white/8 hover:text-white inline-flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        გასვლა
      </button>
    </aside>
  );
}
