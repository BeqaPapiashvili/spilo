"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Bell, 
  Headphones, 
  Globe, 
  BarChart3, 
  ShieldCheck, 
  History, 
  Settings, 
  ChevronDown, 
  ExternalLink,
  X,
  Sparkles,
  Zap
} from "lucide-react";

interface MenuItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string;
  children?: { title: string; href: string }[];
}

interface MenuSection {
  sectionTitle: string;
  items: MenuItem[];
}

export const AdminSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    "პროდუქტები": true,
  });

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menuSections: MenuSection[] = [
    {
      sectionTitle: "მთავარი",
      items: [
        {
          title: "Dashboard",
          href: "/admin",
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
      ],
    },
    {
      sectionTitle: "კატალოგი (Catalog)",
      items: [
        {
          title: "პროდუქტები",
          icon: <Package className="w-4 h-4" />,
          children: [
            { title: "ყველა პროდუქტი", href: "/admin/products" },
            { title: "ახალი პროდუქტი", href: "/admin/products/new" },
          ],
        },
        {
          title: "კატეგორიები",
          href: "/admin/categories",
          icon: <FolderTree className="w-4 h-4" />,
        },
        {
          title: "ბრენდები",
          href: "/admin/brands",
          icon: <Award className="w-4 h-4" />,
        },
      ],
    },
    {
      sectionTitle: "გაყიდვები (Sales)",
      items: [
        {
          title: "შეკვეთები",
          href: "/admin/orders",
          icon: <ShoppingBag className="w-4 h-4" />,
          badge: "ახალი",
        },
        {
          title: "მომხმარებლები",
          href: "/admin/customers",
          icon: <Users className="w-4 h-4" />,
        },
        {
          title: "შეფასებები (Reviews)",
          href: "/admin/reviews",
          icon: <MessageSquare className="w-4 h-4" />,
        },
      ],
    },
    {
      sectionTitle: "მარკეტინგი (Marketing)",
      items: [
        {
          title: "აქციები & ფასდაკლებები",
          href: "/admin/promotions",
          icon: <Tag className="w-4 h-4" />,
        },
        {
          title: "კუპონები",
          href: "/admin/coupons",
          icon: <Ticket className="w-4 h-4" />,
        },
        {
          title: "ბანერები",
          href: "/admin/banners",
          icon: <ImageIcon className="w-4 h-4" />,
        },
      ],
    },
    {
      sectionTitle: "Storefront CMS",
      items: [
        {
          title: "მთავარი გვერდი (Homepage)",
          href: "/admin/homepage",
          icon: <LayoutTemplate className="w-4 h-4" />,
        },
        {
          title: "ნავიგაცია (MegaMenu)",
          href: "/admin/navigation",
          icon: <Navigation className="w-4 h-4" />,
        },
        {
          title: "CMS გვერდები",
          href: "/admin/cms",
          icon: <Globe className="w-4 h-4" />,
        },
        {
          title: "SEO მენეჯერი",
          href: "/admin/seo",
          icon: <Globe className="w-4 h-4" />,
        },
      ],
    },
    {
      sectionTitle: "ოპერაციები & სერვისები",
      items: [
        {
          title: "მარაგების კონტროლი",
          href: "/admin/inventory",
          icon: <Warehouse className="w-4 h-4" />,
        },
        {
          title: "მიწოდების პარამეტრები",
          href: "/admin/delivery",
          icon: <Truck className="w-4 h-4" />,
        },
        {
          title: "გადახდები",
          href: "/admin/payments",
          icon: <CreditCard className="w-4 h-4" />,
        },
        {
          title: "ბანკის განვადებები",
          href: "/admin/installments",
          icon: <Banknote className="w-4 h-4" />,
        },
        {
          title: "მხარდაჭერის ჩათი",
          href: "/admin/support",
          icon: <Headphones className="w-4 h-4" />,
        },
      ],
    },
    {
      sectionTitle: "ანალიტიკა & სისტემა",
      items: [
        {
          title: "ანალიტიკა",
          href: "/admin/analytics",
          icon: <BarChart3 className="w-4 h-4" />,
        },
        {
          title: "ადმინები & როლები",
          href: "/admin/users",
          icon: <ShieldCheck className="w-4 h-4" />,
        },
        {
          title: "Audit Log (ისტორია)",
          href: "/admin/audit-logs",
          icon: <History className="w-4 h-4" />,
        },
        {
          title: "პარამეტრები (Settings)",
          href: "/admin/settings",
          icon: <Settings className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#0B132B] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800/80 shadow-2xl lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Logo */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80 shrink-0 bg-[#070D1E]/90 backdrop-blur-md">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-900/40 group-hover:scale-105 transition-transform">
              <Zap className="w-4.5 h-4.5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-base tracking-tight text-white leading-none">spilo</span>
              <span className="text-[9px] text-blue-400 tracking-wider uppercase font-mono mt-0.5">Admin Control</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Back to Storefront Link */}
        <div className="p-3 border-b border-slate-800/60 bg-[#070D1E]/40">
          <Link
            href="/"
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs flex items-center justify-between transition-all border border-slate-700/50 group shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Storefront-ზე დაბრუნება</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] uppercase text-slate-500 tracking-widest font-mono">
                {section.sectionTitle}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item, itemIdx) => {
                  if (item.children) {
                    const key = item.title;
                    const isExpanded = openSubmenus[key] ?? true;

                    return (
                      <div key={itemIdx} className="space-y-0.5">
                        <button
                          onClick={() => toggleSubmenu(key)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-slate-400">{item.icon}</span>
                            <span>{item.title}</span>
                          </div>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-blue-400" : ""
                            }`}
                          />
                        </button>

                        {isExpanded && (
                          <div className="pl-8 pr-2 space-y-0.5 border-l border-slate-800/70 ml-4 py-1">
                            {item.children.map((child, childIdx) => {
                              const isActive = pathname === child.href;
                              return (
                                <Link
                                  key={childIdx}
                                  href={child.href}
                                  onClick={onClose}
                                  className={`block py-1.5 px-3 rounded-lg text-xs transition-all ${
                                    isActive
                                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                  }`}
                                >
                                  {child.title}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={itemIdx}
                      href={item.href || "#"}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/60"
                          : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? "text-white" : "text-slate-400"}>
                          {item.icon}
                        </span>
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Admin User Info */}
        <div className="p-3 border-t border-slate-800/80 bg-[#070D1E] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs shrink-0 shadow-xs">
              BP
            </div>
            <div className="truncate">
              <p className="text-xs text-white truncate">Beka Papiashvili</p>
              <p className="text-[10px] text-slate-400 truncate">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
