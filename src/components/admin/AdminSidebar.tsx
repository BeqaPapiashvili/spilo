"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Award, 
  ShoppingBag, 
  Users, 
  Warehouse, 
  Tag, 
  Ticket, 
  MessageSquare, 
  Image as ImageIcon, 
  LayoutTemplate, 
  Navigation, 
  Truck, 
  CreditCard, 
  Banknote, 
  Globe, 
  BarChart3, 
  ShieldCheck, 
  History, 
  Settings, 
  ExternalLink, 
  X, 
  Zap, 
  Search,
  Headphones,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Store,
  Sliders,
  Sparkles,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { isRouteAllowed } from "@/lib/permissions";

// Menu Groups Layout
interface MenuItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface MenuTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  groups: {
    title: string;
    items: MenuItem[];
  }[];
}

const NAVIGATION_TABS: MenuTab[] = [
  {
    id: "shop",
    label: "მაღაზია",
    icon: <Store className="w-3.5 h-3.5" />,
    groups: [
      {
        title: "ძირითადი",
        items: [
          { title: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
          { title: "შეკვეთები", href: "/admin/orders", icon: <ShoppingBag className="w-4 h-4" />, badge: "ახალი" },
          { title: "მომხმარებლები & გუნდი", href: "/admin/customers", icon: <Users className="w-4 h-4" /> },
          { title: "მხარდაჭერა & ჩატი", href: "/admin/support", icon: <Headphones className="w-4 h-4" /> },
        ],
      },
      {
        title: "პროდუქტები & კატალოგი",
        items: [
          { title: "ყველა პროდუქტი", href: "/admin/products", icon: <Package className="w-4 h-4" /> },
          { title: "ახალი პროდუქტი", href: "/admin/products/new", icon: <Package className="w-4 h-4" /> },
          { title: "კატეგორიები", href: "/admin/categories", icon: <FolderTree className="w-4 h-4" /> },
          { title: "ბრენდები", href: "/admin/brands", icon: <Award className="w-4 h-4" /> },
        ],
      },
      {
        title: "მარკეტინგი & აქციები",
        items: [
          { title: "აქციები", href: "/admin/promotions", icon: <Tag className="w-4 h-4" /> },
          { title: "კუპონები", href: "/admin/coupons", icon: <Ticket className="w-4 h-4" /> },
          { title: "ბანერები", href: "/admin/banners", icon: <ImageIcon className="w-4 h-4" /> },
        ],
      },
    ],
  },
  {
    id: "cms",
    label: "CMS",
    icon: <Globe className="w-3.5 h-3.5" />,
    groups: [
      {
        title: "საიტის მართვა",
        items: [
          { title: "Homepage", href: "/admin/homepage", icon: <LayoutTemplate className="w-4 h-4" /> },
          { title: "ნავიგაცია", href: "/admin/navigation", icon: <Navigation className="w-4 h-4" /> },
        ],
      },
    ],
  },
  {
    id: "system",
    label: "სისტემა",
    icon: <Settings className="w-3.5 h-3.5" />,
    groups: [
      {
        title: "პარამეტრები & ლოგები",
        items: [
          { title: "სისტემის პარამეტრები", href: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
          { title: "Audit ლოგები", href: "/admin/audit-logs", icon: <History className="w-4 h-4" /> },
          { title: "უსაფრთხოება", href: "/admin/security", icon: <ShieldCheck className="w-4 h-4" /> },
        ],
      },
    ],
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, logoutAdmin } = useStore();
  const [activeTabId, setActiveTabId] = useState("shop");
  const [searchQuery, setSearchQuery] = useState("");

  const userRole = adminUser?.role || "SUPER_ADMIN";

  // Filter tabs and groups based on user role permissions
  const filteredTabs = NAVIGATION_TABS.map((tab) => {
    const filteredGroups = tab.groups.map((group) => {
      const allowedItems = group.items.filter((item) => isRouteAllowed(userRole, item.href));
      return { ...group, items: allowedItems };
    }).filter((group) => group.items.length > 0);

    return { ...tab, groups: filteredGroups };
  }).filter((tab) => tab.groups.length > 0);

  const activeTab = filteredTabs.find((t) => t.id === activeTabId) || filteredTabs[0] || NAVIGATION_TABS[0];

  const userName = adminUser?.name || "Admin User";
  const userInitials = userName.slice(0, 2).toUpperCase();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Floating Island Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 p-4 transition-all duration-300 pointer-events-none ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-[5.75rem]" : "lg:w-[18.5rem]"} w-72`}
      >
        <div className="w-full h-full bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col pointer-events-auto overflow-hidden">
          
          {/* Header: Brand Logo & Vertical/Horizontal Collapse Layout */}
          <div className={`p-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 ${
            isCollapsed ? "lg:flex-col lg:gap-2.5 lg:items-center lg:justify-center" : ""
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-mono text-xs shrink-0 shadow-2xs">
                sp
              </div>
              
              {!isCollapsed && (
                <div>
                  <h2 className="text-sm text-slate-900 tracking-tight leading-tight">
                    spilo admin
                  </h2>
                  <span className="text-[10px] text-blue-600 leading-tight block font-mono">
                    {userRole}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Collapse / Expand Toggle Button for Desktop */}
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-blue-600 hidden lg:flex items-center justify-center transition-colors cursor-pointer"
                  title={isCollapsed ? "მენიუს გაშლა" : "მენიუს შეკეცვა"}
                >
                  {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
              )}

              {/* Close button for Mobile */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center lg:hidden transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Return to Storefront Link (Only when expanded) */}
          {!isCollapsed && (
            <div className="p-3 border-b border-slate-100 shrink-0">
              <Link
                href="/"
                target="_blank"
                className="w-full h-9 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-2xl text-xs flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Store className="w-3.5 h-3.5 text-blue-600" />
                  <span>Storefront-ზე დაბრუნება</span>
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          )}

          {/* Segmented Category Tabs with SVG Icons */}
          {filteredTabs.length > 0 && (
            <div className="p-2 border-b border-slate-100 shrink-0">
              <div className={`p-1 bg-slate-100 rounded-2xl flex ${isCollapsed ? "flex-col gap-1" : "flex-row gap-1"}`}>
                {filteredTabs.map((tab) => {
                  const isActive = activeTab?.id === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTabId(tab.id)}
                      className={`h-8 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
                        isCollapsed ? "w-full text-sm" : "flex-1"
                      } ${
                        isActive
                          ? "bg-white text-slate-900 shadow-2xs font-mono"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                      title={tab.label}
                    >
                      <span className={isActive ? "text-blue-600" : "text-slate-400"}>
                        {tab.icon}
                      </span>
                      {!isCollapsed && <span>{tab.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Search */}
          {!isCollapsed && (
            <div className="px-3 pt-3 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="სწრაფი ძიება..."
                  className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          {/* Navigation Items Scroll Deck */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-4 admin-sidebar-scroll">
            
            {searchQuery.trim() ? (
              <div className="space-y-1">
                {filteredTabs.flatMap((t) => t.groups.flatMap((g) => g.items))
                  .filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item, idx) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={onClose}
                        className={`h-11 px-3.5 rounded-2xl text-xs flex items-center ${
                          isCollapsed ? "justify-center" : "justify-between"
                        } transition-all ${
                          isActive
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                        title={isCollapsed ? item.title : undefined}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isActive ? "text-white" : "text-slate-400"}>{item.icon}</span>
                          {!isCollapsed && <span>{item.title}</span>}
                        </div>
                      </Link>
                    );
                  })}
              </div>
            ) : (
              /* Segmented Navigation Groups */
              activeTab && activeTab.groups.map((group, gi) => (
                <div key={gi} className="space-y-1.5">
                  {!isCollapsed && (
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block px-2">
                      {group.title}
                    </span>
                  )}

                  <div className="space-y-1">
                    {group.items.map((item, ii) => {
                      const isActive = pathname === item.href;

                      return (
                        <Link
                          key={ii}
                          href={item.href}
                          onClick={onClose}
                          className={`h-10 ${isCollapsed ? "px-0 justify-center" : "px-3.5 justify-between"} rounded-2xl text-xs flex items-center transition-all ${
                            isActive
                              ? "bg-blue-600 text-white shadow-xs"
                              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                          title={isCollapsed ? item.title : undefined}
                        >
                          <div className="flex items-center gap-3">
                            <span className={isActive ? "text-white" : "text-slate-400"}>
                              {item.icon}
                            </span>
                            {!isCollapsed && <span>{item.title}</span>}
                          </div>

                          {!isCollapsed && item.badge && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                              isActive ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))
            )}

          </div>

          {/* Footer User Info Card */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
            <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? "justify-center w-full" : ""}`}>
              <div className="w-9 h-9 rounded-2xl bg-[#111111] text-white flex items-center justify-center text-xs font-mono shrink-0 shadow-xs">
                {userInitials}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-900 truncate">{userName}</p>
                  <p className="text-[10px] text-blue-600 font-mono truncate">{userRole}</p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                type="button"
                onClick={() => {
                  logoutAdmin();
                  router.push("/admin/login");
                }}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                title="გასვლა"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </aside>
    </>
  );
};
