"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Package, FolderTree, Award, ShoppingBag, Users, Warehouse, Tag, 
  Ticket, MessageSquare, Image as ImageIcon, LayoutTemplate, Navigation, Truck, 
  CreditCard, Banknote, Bell, Headphones, Globe, BarChart3, ShieldCheck, History, 
  Settings, ChevronDown, ExternalLink, X, Zap, Plus
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

const NAV: MenuSection[] = [
  {
    sectionTitle: "მთავარი",
    items: [
      { title: "Dashboard", href: "/admin", icon: <LayoutDashboard size={15} /> },
    ],
  },
  {
    sectionTitle: "კატალოგი",
    items: [
      {
        title: "პროდუქტები",
        icon: <Package size={15} />,
        children: [
          { title: "ყველა პროდუქტი", href: "/admin/products" },
          { title: "ახალი პროდუქტი", href: "/admin/products/new" },
        ],
      },
      { title: "კატეგორიები", href: "/admin/categories", icon: <FolderTree size={15} /> },
      { title: "ბრენდები", href: "/admin/brands", icon: <Award size={15} /> },
    ],
  },
  {
    sectionTitle: "გაყიდვები",
    items: [
      { title: "შეკვეთები", href: "/admin/orders", icon: <ShoppingBag size={15} />, badge: "new" },
      { title: "მომხმარებლები", href: "/admin/customers", icon: <Users size={15} /> },
      { title: "შეფასებები", href: "/admin/reviews", icon: <MessageSquare size={15} /> },
    ],
  },
  {
    sectionTitle: "მარკეტინგი",
    items: [
      { title: "აქციები", href: "/admin/promotions", icon: <Tag size={15} /> },
      { title: "კუპონები", href: "/admin/coupons", icon: <Ticket size={15} /> },
      { title: "ბანერები", href: "/admin/banners", icon: <ImageIcon size={15} /> },
    ],
  },
  {
    sectionTitle: "Storefront CMS",
    items: [
      { title: "Homepage", href: "/admin/homepage", icon: <LayoutTemplate size={15} /> },
      { title: "ნავიგაცია", href: "/admin/navigation", icon: <Navigation size={15} /> },
      { title: "CMS გვერდები", href: "/admin/cms", icon: <Globe size={15} /> },
      { title: "SEO მენეჯერი", href: "/admin/seo", icon: <Globe size={15} /> },
    ],
  },
  {
    sectionTitle: "ოპერაციები",
    items: [
      { title: "მარაგები", href: "/admin/inventory", icon: <Warehouse size={15} /> },
      { title: "მიწოდება", href: "/admin/delivery", icon: <Truck size={15} /> },
      { title: "გადახდები", href: "/admin/payments", icon: <CreditCard size={15} /> },
      { title: "განვადებები", href: "/admin/installments", icon: <Banknote size={15} /> },
      { title: "მხარდაჭერის ჩათი", href: "/admin/support", icon: <Headphones size={15} /> },
    ],
  },
  {
    sectionTitle: "სისტემა",
    items: [
      { title: "ანალიტიკა", href: "/admin/analytics", icon: <BarChart3 size={15} /> },
      { title: "ადმინები & როლები", href: "/admin/users", icon: <ShieldCheck size={15} /> },
      { title: "Audit Log", href: "/admin/audit-logs", icon: <History size={15} /> },
      { title: "პარამეტრები", href: "/admin/settings", icon: <Settings size={15} /> },
    ],
  },
];

export const AdminSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({ "პროდუქტები": true });

  const toggleSubmenu = (key: string) => setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
            backdropFilter: "blur(4px)", zIndex: 40
          }}
          className="lg:hidden"
        />
      )}

      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
        width: "15.5rem",
        background: "#0C1322",
        display: "flex", flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.25)",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        transform: isOpen ? "translateX(0)" : undefined,
      }}
      className={`${!isOpen ? "-translate-x-full lg:translate-x-0" : ""}`}
      >
        
        {/* Logo */}
        <div style={{
          height: "3.75rem", padding: "0 1.25rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.2)",
        }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            <div style={{
              width: "2rem", height: "2rem", borderRadius: "0.625rem",
              background: "linear-gradient(135deg, #4f46e5, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
            }}>
              <Zap size={14} style={{ color: "#fff", fill: "#fff" }} />
            </div>
            <div>
              <div style={{ fontSize: "0.9rem", color: "#f8fafc", letterSpacing: "-0.02em", lineHeight: 1 }}>spilo</div>
              <div style={{ fontSize: "0.55rem", color: "#818cf8", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace", marginTop: "2px" }}>Admin Panel</div>
            </div>
          </Link>
          <button onClick={onClose} className="adm-icon-btn lg:hidden" style={{ color: "#94a3b8" }}>
            <X size={16} />
          </button>
        </div>

        {/* Storefront link */}
        <div style={{ padding: "0.625rem 0.875rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0.5rem 0.875rem", borderRadius: "0.75rem",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            fontSize: "0.72rem", color: "#cbd5e1", textDecoration: "none",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
          >
            <span>← Storefront-ზე დაბრუნება</span>
            <ExternalLink size={12} style={{ color: "#64748b" }} />
          </Link>
        </div>

        {/* Nav */}
        <div
          className="adm-scrollbar"
          style={{ flex: 1, overflowY: "auto", padding: "1rem 0.875rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {NAV.map((section, si) => (
            <div key={si}>
              <p className="adm-section-label" style={{ color: "rgba(148,163,184,0.6)", paddingLeft: "0.5rem", marginBottom: "0.375rem" }}>
                {section.sectionTitle}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                {section.items.map((item, ii) => {
                  if (item.children) {
                    const isExpanded = openSubmenus[item.title] ?? false;
                    return (
                      <div key={ii}>
                        <button
                          onClick={() => toggleSubmenu(item.title)}
                          style={{
                            width: "100%", display: "flex", alignItems: "center",
                            justifyContent: "space-between", padding: "0.5rem 0.75rem",
                            borderRadius: "0.625rem", cursor: "pointer",
                            background: "transparent", border: "none",
                            fontSize: "0.76rem", color: "#94a3b8",
                            transition: "background 0.15s, color 0.15s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#e2e8f0"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                            <span style={{ color: "#64748b" }}>{item.icon}</span>
                            <span>{item.title}</span>
                          </span>
                          <ChevronDown size={12} style={{ color: "#64748b", transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                        </button>
                        {isExpanded && (
                          <div style={{ paddingLeft: "1.875rem", paddingTop: "2px", paddingBottom: "4px", marginLeft: "1.25rem", borderLeft: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: "1px" }}>
                            {item.children.map((child, ci) => {
                              const isActive = pathname === child.href;
                              return (
                                <Link key={ci} href={child.href} onClick={onClose} style={{
                                  display: "block", padding: "0.425rem 0.75rem",
                                  borderRadius: "0.5rem", fontSize: "0.73rem",
                                  textDecoration: "none",
                                  background: isActive ? "rgba(99,102,241,0.2)" : "transparent",
                                  color: isActive ? "#a5b4fc" : "#64748b",
                                  border: isActive ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                                  transition: "background 0.15s, color 0.15s",
                                }}
                                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#cbd5e1"; }}}
                                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}}
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
                    <Link key={ii} href={item.href || "#"} onClick={onClose}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "0.5rem 0.75rem", borderRadius: "0.625rem",
                        fontSize: "0.76rem", textDecoration: "none",
                        ...(isActive
                          ? { background: "linear-gradient(135deg, #4f46e5, #6366f1)", color: "#fff", boxShadow: "0 2px 8px rgba(99,102,241,0.35)" }
                          : { color: "#94a3b8" }),
                        transition: "background 0.15s, color 0.15s",
                      }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#e2e8f0"; }}}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                        <span style={{ color: isActive ? "rgba(255,255,255,0.8)" : "#64748b" }}>{item.icon}</span>
                        <span>{item.title}</span>
                      </span>
                      {item.badge && (
                        <span className="adm-badge adm-badge-green" style={{ fontSize: "0.55rem" }}>{item.badge}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer user */}
        <div style={{
          padding: "0.875rem 1.25rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: "0.625rem",
          background: "rgba(0,0,0,0.15)",
        }}>
          <div style={{
            width: "2rem", height: "2rem", borderRadius: "0.5rem",
            background: "linear-gradient(135deg, #4f46e5, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.6rem", color: "#fff", flexShrink: 0,
          }}>BP</div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "0.75rem", color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Beka Papiashvili</p>
            <p style={{ fontSize: "0.65rem", color: "#64748b" }}>Super Admin</p>
          </div>
        </div>
      </aside>
    </>
  );
};
