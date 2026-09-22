"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/store/useStore";
import MobileCategorySheet from "@/components/MobileCategorySheet";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.3 10.3 12 4.2l7.7 6.1" />
      <path d="M6.1 9.7V19a1.3 1.3 0 0 0 1.3 1.3h9.2A1.3 1.3 0 0 0 17.9 19V9.7" fill={active ? "currentColor" : "none"} />
    </svg>
  );
}

function CatalogIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-[21px] h-[21px]" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <rect x="3.3" y="3.3" width="7.3" height="7.3" rx="1.9" />
      <rect x="13.4" y="3.3" width="7.3" height="7.3" rx="1.9" />
      <rect x="3.3" y="13.4" width="7.3" height="7.3" rx="1.9" />
      <rect x="13.4" y="13.4" width="7.3" height="7.3" rx="1.9" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="20" r="1.35" />
      <circle cx="18" cy="20" r="1.35" />
      <path d="M3 3.5h2.2l2.4 11.2a1.8 1.8 0 0 0 1.8 1.4h8.8a1.8 1.8 0 0 0 1.8-1.4l1.5-7.2H6.2" />
    </svg>
  );
}

function CompareIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7H6" />
      <path d="M9 4 6 7l3 3" />
      <path d="M5 17h13" />
      <path d="M15 14l3 3-3 3" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7.2" r="3.6" fill={active ? "currentColor" : "none"} />
      <path d="M5.6 20.4a6.4 6.4 0 0 1 12.8 0" fill={active ? "currentColor" : "none"} />
    </svg>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cart, compareList, user, isAuthModalOpen, toggleAuthModal } = useStore();
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (pathname?.startsWith("/checkout")) {
    return null;
  }

  const isHome = pathname === "/";
  const isCatalog =
    isCategorySheetOpen ||
    pathname.startsWith("/catalog") ||
    pathname.startsWith("/categories") ||
    pathname.startsWith("/search");
  const isCart = pathname.startsWith("/cart");
  const isCompare = pathname.startsWith("/compare");
  const isProfile = pathname.startsWith("/profile") || isAuthModalOpen;

  const closeOverlays = () => {
    setIsCategorySheetOpen(false);
    if (isAuthModalOpen) toggleAuthModal(false);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setIsCategorySheetOpen(false);
      toggleAuthModal(!isAuthModalOpen);
    } else {
      setIsCategorySheetOpen(false);
      if (isAuthModalOpen) toggleAuthModal(false);
    }
  };

  return (
    <>
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-[70] pointer-events-none"
      aria-label="მობილური ნავიგაცია"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div
        className={`px-3 pointer-events-none transition-[padding] duration-300 ${isAuthModalOpen ? "pt-0" : "pt-3"}`}
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <div
          className={`pointer-events-auto relative mx-auto w-full max-w-md items-end px-1.5 pb-1.5 pt-1.5 transition-all duration-300 ${
            isAuthModalOpen
              ? "bg-transparent shadow-none rounded-none border-t border-gray-100"
              : "bg-white/95 backdrop-blur-xl border border-gray-200/70 shadow-[0_8px_30px_-10px_rgba(15,23,42,0.22)] rounded-[26px]"
          }`}
          style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}
        >
          <NavItem
            href="/"
            label="მთავარი"
            active={isHome}
            onClick={closeOverlays}
          >
            <HomeIcon active={isHome} />
          </NavItem>

          <NavItem
            href="/catalog"
            label="კატეგორიები"
            active={isCatalog}
            onClick={(e) => {
              e.preventDefault();
              if (isAuthModalOpen) toggleAuthModal(false);
              setIsCategorySheetOpen((open) => !open);
            }}
          >
            <CatalogIcon active={isCatalog} />
          </NavItem>

          <Link
            href="/cart"
            onClick={closeOverlays}
            className={`relative flex items-center justify-center min-w-0 transition-transform duration-300 ${isAuthModalOpen ? "mt-0" : "-mt-5"}`}
            aria-label="კალათა"
          >
            <span
              className={`relative w-[50px] h-[50px] rounded-full flex items-center justify-center text-white transition-transform active:scale-95 shadow-[0_8px_18px_-6px_rgba(255,82,56,0.5)] ${
                isCart ? "bg-[#EA3A20]" : "bg-[#FF5238]"
              }`}
            >
              <CartIcon />
              {cartItemsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#1D1D1F] text-white text-[9px] font-mono flex items-center justify-center ring-2 ring-white">
                  {cartItemsCount > 99 ? "99+" : cartItemsCount}
                </span>
              )}
            </span>
          </Link>

          <NavItem href="/compare" label="შედარება" active={isCompare} badge={compareList.length} onClick={closeOverlays}>
            <CompareIcon active={isCompare} />
          </NavItem>

          <NavItem
            href="/profile"
            label="პროფილი"
            active={isProfile}
            onClick={handleProfileClick}
          >
            <UserIcon active={isProfile} />
          </NavItem>
        </div>
      </div>
    </nav>
    <MobileCategorySheet
      isOpen={isCategorySheetOpen}
      onClose={() => setIsCategorySheetOpen(false)}
    />
    </>
  );
}

function NavItem({
  href,
  label,
  active,
  badge,
  onClick,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  badge?: number;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`relative flex items-center justify-center min-w-0 h-[48px] rounded-2xl transition-colors ${
        active ? "text-[#FF5238]" : "text-gray-500"
      }`}
    >
      {active && <span className="absolute inset-x-2 inset-y-1 rounded-2xl bg-[#FFF5F2]" />}
      <span className="relative z-10 inline-flex">
        {children}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#FF5238] text-white text-[9px] font-mono flex items-center justify-center">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
    </Link>
  );
}
