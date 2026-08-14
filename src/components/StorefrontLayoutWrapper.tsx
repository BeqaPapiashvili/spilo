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

export function StorefrontLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <>
        <NetworkStatusToast />
        <ToastContainer />
        {children}
      </>
    );
  }

  return (
    <>
      <NetworkStatusToast />
      <Header />
      <CartDrawer />
      <AuthModal />
      <SupportChatWidget />
      <ToastContainer />
      <main className="flex-1">{children}</main>
      <MobileBottomNav />
      <Footer />
    </>
  );
}
