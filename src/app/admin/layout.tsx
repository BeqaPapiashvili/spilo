"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

import { usePathname } from "next/navigation";
import AdminRoute from "@/components/auth/AdminRoute";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <AdminRoute>{children}</AdminRoute>;
  }

  return (
    <AdminRoute>
      <div style={{ minHeight: "100vh", background: "#F5F7FA", display: "flex", flexDirection: "column" }}>
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        {/* Content area pushed right of sidebar on lg+ */}
        <div className="lg:pl-[15.5rem]" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: "100vh" }}>
          <AdminHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
          <main style={{ flex: 1, padding: "1.75rem 2rem", maxWidth: "80rem", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {children}
          </main>
        </div>
      </div>
    </AdminRoute>
  );
}
