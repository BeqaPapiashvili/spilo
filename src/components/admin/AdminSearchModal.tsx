"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  X, 
  Package, 
  ShoppingBag, 
  Users, 
  FolderTree, 
  Tag, 
  ArrowRight, 
  Plus, 
  Settings, 
  CornerDownLeft, 
  LayoutDashboard, 
  Award, 
  MessageSquare, 
  Ticket, 
  Image as ImageIcon, 
  LayoutTemplate, 
  Navigation, 
  History, 
  ShieldCheck, 
  Globe, 
  Sliders, 
  ExternalLink 
} from "lucide-react";
import { Product, Category, Brand } from "@/types";
import { useStore } from "@/store/useStore";
import { isRouteAllowed } from "@/lib/permissions";

interface AdminSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface SearchOrder {
  id: string;
  orderNumber?: string;
  customerName: string;
  contactPhone?: string;
  phone?: string;
  createdAt: string;
  totalAmount: number;
  status: string;
}

interface SearchCustomer {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface AdminPageSection {
  title: string;
  description: string;
  href: string;
  category: string;
  icon: React.ReactNode;
}

const ADMIN_SECTIONS: AdminPageSection[] = [
  { title: "მმართველობის დეშბორდი", description: "შემოსავლები, ანალიტიკა და სისტემური მეტრიკები", href: "/admin", category: "ძირითადი", icon: <LayoutDashboard className="w-4 h-4 text-blue-600" /> },
  { title: "შეკვეთები", description: "შეკვეთების სია, სტატუსები და ინვოისები", href: "/admin/orders", category: "გაყიდვები", icon: <ShoppingBag className="w-4 h-4 text-emerald-600" /> },
  { title: "მომხმარებლები", description: "რეგისტრირებული კლიენტები და დანახარჯები", href: "/admin/customers", category: "გაყიდვები", icon: <Users className="w-4 h-4 text-purple-600" /> },
  { title: "ყველა პროდუქტი", description: "პროდუქტების კატალოგი, SKU, ფასები და მარაგი", href: "/admin/products", category: "კატალოგი", icon: <Package className="w-4 h-4 text-blue-600" /> },
  { title: "ახალი პროდუქტის დამატება", description: "ახალი პროდუქტის რეგისტრაცია", href: "/admin/products/new", category: "კატალოგი", icon: <Plus className="w-4 h-4 text-blue-600" /> },
  { title: "კატეგორიების მენეჯერი", description: "3-დონიანი იერარქია (L1 > L2 > L3)", href: "/admin/categories", category: "კატალოგი", icon: <FolderTree className="w-4 h-4 text-indigo-600" /> },
  { title: "ბრენდები", description: "პარტნიორი ბრენდები და ლოგოები", href: "/admin/brands", category: "კატალოგი", icon: <Award className="w-4 h-4 text-amber-600" /> },
  { title: "აქციები & ფასდაკლებები", description: "სპეციალური ფასდაკლებები და სეზონური აქციები", href: "/admin/promotions", category: "მარკეტინგი", icon: <Tag className="w-4 h-4 text-purple-600" /> },
  { title: "კუპონები & პრომო კოდები", description: "ფასდაკლების კოდების შექმნა და ანალიტიკა", href: "/admin/coupons", category: "მარკეტინგი", icon: <Ticket className="w-4 h-4 text-indigo-600" /> },
  { title: "ბანერები", description: "Hero და promotional ბანერების მართვა", href: "/admin/banners", category: "მარკეტინგი", icon: <ImageIcon className="w-4 h-4 text-blue-600" /> },
  { title: "Homepage CMS", description: "მთავარი გვერდის ბლოკების რედაქტირება", href: "/admin/homepage", category: "CMS", icon: <LayoutTemplate className="w-4 h-4 text-emerald-600" /> },
  { title: "ნავიგაცია", description: "მენიუსა და ფუტერის ბმულები", href: "/admin/navigation", category: "CMS", icon: <Navigation className="w-4 h-4 text-indigo-600" /> },
  { title: "CMS გვერდები", description: "წესები, კონფიდენციალურობა, FAQ", href: "/admin/cms", category: "CMS", icon: <Globe className="w-4 h-4 text-blue-600" /> },
  { title: "სისტემის პარამეტრები", description: "მაღაზიის გლობალური კონფიგურაცია", href: "/admin/settings", category: "სისტემა", icon: <Settings className="w-4 h-4 text-slate-600" /> },
  { title: "Audit ლოგები", description: "ადმინისტრატორების მოქმედებების ისტორია", href: "/admin/audit-logs", category: "სისტემა", icon: <History className="w-4 h-4 text-slate-600" /> },
  { title: "უსაფრთხოება & 2FA", description: "წვდომის უფლებები და პაროლები", href: "/admin/security", category: "სისტემა", icon: <ShieldCheck className="w-4 h-4 text-red-600" /> },
];

export const AdminSearchModal: React.FC<AdminSearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = "",
}) => {
  const router = useRouter();
  const { adminUser } = useStore();
  const userRole = adminUser?.role || "SUPER_ADMIN";

  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "SECTIONS" | "PRODUCTS" | "ORDERS" | "CATEGORIES" | "CUSTOMERS">("ALL");
  const inputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [orders, setOrders] = useState<SearchOrder[]>([]);
  const [customers, setCustomers] = useState<SearchCustomer[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);

      Promise.all([
        fetch("/api/products").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/categories").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/brands").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/orders").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/admin/customers").then((r) => r.json()).catch(() => ({ success: false })),
      ]).then(([pJson, cJson, bJson, oJson, custJson]) => {
        if (pJson.success && Array.isArray(pJson.data)) setProducts(pJson.data);
        if (cJson.success && Array.isArray(cJson.data)) setCategories(cJson.data);
        if (bJson.success && Array.isArray(bJson.data)) setBrands(bJson.data);
        if (oJson.success && Array.isArray(oJson.data)) {
          setOrders(
            oJson.data.map((o: any) => ({
              id: o.id,
              orderNumber: o.orderNumber || o.id,
              customerName: o.customerName || "მომხმარებელი",
              phone: o.contactPhone || "",
              createdAt: o.createdAt ? new Date(o.createdAt).toLocaleDateString("ka-GE") : "დღეს",
              totalAmount: Number(o.totalAmount || 0),
              status: o.status || "PROCESSING",
            }))
          );
        }
        if (custJson.success && Array.isArray(custJson.data)) {
          setCustomers(custJson.data);
        }
      }).catch((err) => console.error("AdminSearchModal data load error:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const searchQuery = query.trim().toLowerCase();

  // Filtered Sections based on Role Permissions
  const allowedSections = ADMIN_SECTIONS.filter((s) => isRouteAllowed(userRole, s.href));
  const filteredSections = searchQuery
    ? allowedSections.filter((s) => s.title.toLowerCase().includes(searchQuery) || s.description.toLowerCase().includes(searchQuery) || s.category.toLowerCase().includes(searchQuery))
    : allowedSections.slice(0, 4);

  // Filtered Products
  const filteredProducts = searchQuery
    ? products.filter((p) => p.title.toLowerCase().includes(searchQuery) || p.sku?.toLowerCase().includes(searchQuery) || p.brandName?.toLowerCase().includes(searchQuery))
    : products.slice(0, 3);

  // Filtered Orders
  const filteredOrders = searchQuery
    ? orders.filter((o) => (o.orderNumber && o.orderNumber.toLowerCase().includes(searchQuery)) || o.id.toLowerCase().includes(searchQuery) || (o.customerName && o.customerName.toLowerCase().includes(searchQuery)) || (o.phone && o.phone.includes(searchQuery)))
    : orders.slice(0, 2);

  // Filtered Categories & Subcategories
  const filteredCategories = searchQuery
    ? categories.filter((c) => {
        const matchL1 = c.name.toLowerCase().includes(searchQuery) || c.slug.toLowerCase().includes(searchQuery);
        const matchL2 = c.children?.some((s) => s.name.toLowerCase().includes(searchQuery) || s.items?.some((i) => i.name.toLowerCase().includes(searchQuery)));
        return matchL1 || matchL2;
      })
    : categories.slice(0, 3);

  // Filtered Customers
  const filteredCustomers = searchQuery
    ? customers.filter((c) => (c.name && c.name.toLowerCase().includes(searchQuery)) || (c.email && c.email.toLowerCase().includes(searchQuery)) || (c.phone && c.phone.includes(searchQuery)))
    : customers.slice(0, 2);

  const handleItemClick = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 md:pt-20 p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Spotlight Dialog */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-2xl max-w-2xl w-full z-10 overflow-hidden space-y-4 animate-in zoom-in-95 duration-150">
        
        {/* Top Search Input Field */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ძიება: სექციები, კატეგორიები, პროდუქტი, SKU, შეკვეთა, კლიენტი..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button 
              type="button" 
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-mono text-slate-500 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="px-4 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: "ALL", label: "ყველა" },
            { id: "SECTIONS", label: "სექციები" },
            { id: "PRODUCTS", label: "პროდუქტები" },
            { id: "ORDERS", label: "შეკვეთები" },
            { id: "CATEGORIES", label: "კატეგორიები" },
            { id: "CUSTOMERS", label: "კლიენტები" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer shrink-0 ${
                activeFilter === tab.id
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto px-4 pb-4 space-y-4">
          
          {/* Quick Sections Navigation */}
          {(activeFilter === "ALL" || activeFilter === "SECTIONS") && filteredSections.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
                სექციები ({filteredSections.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredSections.map((sec, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleItemClick(sec.href)}
                    className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200/60 hover:border-blue-200 rounded-2xl flex items-center justify-between text-xs text-slate-800 transition-all cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-xl bg-white border border-slate-200 shrink-0">
                        {sec.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {sec.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{sec.category}</p>
                      </div>
                    </div>
                    <CornerDownLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories & Subcategories Results */}
          {(activeFilter === "ALL" || activeFilter === "CATEGORIES") && filteredCategories.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
                კატეგორიები & ქვეკატეგორიები ({filteredCategories.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredCategories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleItemClick("/admin/categories")}
                    className="p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs text-slate-900 transition-all cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FolderTree className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div className="truncate">
                        <span className="truncate group-hover:text-blue-600 transition-colors block">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block truncate">
                          {c.children?.length || 0} ქვეკატეგორია
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">/{c.slug}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Results */}
          {(activeFilter === "ALL" || activeFilter === "PRODUCTS") && filteredProducts.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
                პროდუქტები ({filteredProducts.length})
              </span>
              <div className="space-y-1.5">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleItemClick(`/admin/products/${p.id}/edit`)}
                    className="w-full p-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.images?.[0] || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80"}
                        alt={p.title}
                        className="w-10 h-10 object-contain rounded-xl bg-slate-50 p-1 border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {p.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          SKU: {p.sku || p.code || "—"} · {p.categoryName || "ზოგადი"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-900 font-mono block">{p.discountPrice ?? p.price} ₾</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        p.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      }`}>
                        {p.stock > 0 ? `${p.stock} ცალი` : "ამოწურულია"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Orders Results */}
          {(activeFilter === "ALL" || activeFilter === "ORDERS") && filteredOrders.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
                შეკვეთები ({filteredOrders.length})
              </span>
              <div className="space-y-1.5">
                {filteredOrders.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => handleItemClick(`/admin/orders/${o.id}`)}
                    className="w-full p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs shrink-0">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-900 font-mono group-hover:text-blue-600 transition-colors">
                          #{o.orderNumber || o.id} · {o.customerName}
                        </p>
                        <p className="text-[10px] text-slate-400">{o.createdAt} · {o.phone || "—"}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-900 font-mono block">{o.totalAmount.toLocaleString()} ₾</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono">
                        {o.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customers Results */}
          {(activeFilter === "ALL" || activeFilter === "CUSTOMERS") && filteredCustomers.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
                მომხმარებლები ({filteredCustomers.length})
              </span>
              <div className="space-y-1.5">
                {filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleItemClick("/admin/customers")}
                    className="w-full p-3 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xs shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                          {c.name || "მომხმარებელი"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">{c.email || c.phone || "—"}</p>
                      </div>
                    </div>
                    <CornerDownLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {searchQuery && 
            filteredSections.length === 0 && 
            filteredProducts.length === 0 && 
            filteredOrders.length === 0 && 
            filteredCategories.length === 0 && 
            filteredCustomers.length === 0 && (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Search className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-600">შედეგები ვერ მოიძებნა ფრაზისთვის: &ldquo;{query}&rdquo;</p>
                <p className="text-[10px] text-slate-400">სცადეთ მოძებნოთ სხვა საკვანძო სიტყვით</p>
              </div>
          )}

        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 px-4">
          <div className="flex items-center gap-2">
            <span>ნავიგაცია:</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">↓</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">ENTER</kbd>
          </div>
          <span>Spilo Command Bar</span>
        </div>

      </div>
    </div>
  );
};
