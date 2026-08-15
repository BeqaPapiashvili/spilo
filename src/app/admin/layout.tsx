"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { usePathname } from "next/navigation";
import AdminRoute from "@/components/auth/AdminRoute";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <AdminRoute>{children}</AdminRoute>;
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col antialiased">
        
        {/* Floating Left Sidebar with Collapse/Expand Toggle */}
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
        
        {/* Content area pushed right according to sidebar state (Expanded: 18.5rem, Collapsed: 5.75rem) */}
        <div 
          className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${
            isCollapsed ? "lg:pl-[5.75rem]" : "lg:pl-[18.5rem]"
          }`}
        >
          <AdminHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>

      </div>
    </AdminRoute>
  );
}
