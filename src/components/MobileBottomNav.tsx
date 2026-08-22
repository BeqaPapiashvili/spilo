"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, User } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cart, user } = useStore();
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { href: "/", label: "მთავარი", icon: Home },
    { href: "/search", label: "ძიება", icon: Search },
    { href: "/cart", label: "კალათა", icon: ShoppingBag, badge: cartItemsCount },
    { href: "/profile", label: "პროფილი", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-4 py-2 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 text-[11px] transition-colors relative cursor-pointer px-3 py-1 ${isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {!!item.badge && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-mono shadow-xs">
                  {item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
