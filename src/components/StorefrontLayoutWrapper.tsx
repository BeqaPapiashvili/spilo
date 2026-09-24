"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import AuthModal from "@/components/AuthModal";
import SupportChatWidget from "@/components/SupportChatWidget";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import { NetworkStatusToast } from "@/components/ui/NetworkStatusToast";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { NavigationProgressBar } from "@/components/NavigationProgressBar";

export function StorefrontLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") || pathname?.startsWith("/merchant") || pathname === "/offline";

  if (isAdmin) {
    return (
      <>
        <NavigationProgressBar />
        <NetworkStatusToast />
        <ToastContainer />
        {children}
      </>
    );
  }

  return (
    <>
      <NavigationProgressBar />
      <NetworkStatusToast />
      <Header />
      <CartDrawer />
      <AuthModal />
      <SupportChatWidget />
      <ToastContainer />
      <main className="flex-1 min-w-0">{children}</main>
      <MobileBottomNav />
      <div className={pathname === "/profile" ? "hidden md:block" : ""}>
        <Footer />
      </div>
    </>
  );
}
