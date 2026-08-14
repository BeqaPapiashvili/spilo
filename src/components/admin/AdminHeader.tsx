"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Menu, 
  Search, 
  Bell, 
  Plus, 
  ExternalLink, 
  ShieldCheck, 
  User, 
  Settings, 
  LogOut,
  ChevronDown
} from "lucide-react";
import { dataService } from "@/services/dataService";

export const AdminHeader: React.FC<{ onOpenSidebar: () => void }> = ({ onOpenSidebar }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const auditLogs = dataService.getAuditLogs().slice(0, 5);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 shadow-xs">
      
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ძიება: პროდუქტი, SKU, შეკვეთა #, კლიენტი..."
            className="w-full h-9 pl-9 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-xs md:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-gray-400"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        
        {/* Quick Create Dropdown / Button */}
        <Link
          href="/admin/products/new"
          className="hidden sm:inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer font-medium shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>პროდუქტი</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-900">შეტყობინებები & ისტორია</h4>
                <span className="text-[10px] text-blue-600 font-medium">{auditLogs.length} ახალი</span>
              </div>
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 hover:bg-gray-50 transition-colors text-left">
                    <p className="text-xs font-semibold text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-600">{log.details}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">{log.timestamp} • {log.userName}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 pt-2 border-t border-gray-100 text-center">
                <Link
                  href="/admin/audit-logs"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  სრული Audit Log-ის ნახვა
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative border-l border-gray-200 pl-3 ml-1">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              BP
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-gray-900 leading-tight">Beka Papiashvili</p>
              <p className="text-[10px] text-gray-500 leading-tight">Super Admin</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-900">Beka Papiashvili</p>
                <p className="text-xs text-gray-500">beka@spilo.ge</p>
              </div>
              <div className="py-1">
                <Link
                  href="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>პარამეტრები</span>
                </Link>
                <Link
                  href="/admin/users"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-gray-400" />
                  <span>როლები & ნებართვები</span>
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-2 px-4 py-2 text-xs text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-100"
                >
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <span>Storefront-ზე გადასვლა</span>
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
