"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F8FA] flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white antialiased">
      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Layout Wrap */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen transition-all duration-300">
        {/* Header */}
        <AdminHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Dynamic Admin Page Container */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
