"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  LogOut,
  Package,
  User as UserIcon,
  Menu,
  X,
  Phone,
  Mail,
  Info,
  Truck,
  Heart,
  ShoppingBag,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SearchModal } from "./SearchModal";
import { MegaMenu } from "./MegaMenu";
import AddAddressModal from "./AddAddressModal";

/* =========================================================================
   CUSTOM PIXEL-PERFECT SVG ICONS (Exact matches to reference screenshot)
   ========================================================================= */

function LocationPinIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21.2C15.8 17.5 19 13.7 19 9.8A7 7 0 0 0 5 9.8c0 3.9 3.2 7.7 7 11.4z" />
      <circle cx="12" cy="9.8" r="2.8" />
    </svg>
  );
}

function CustomSearchIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <line x1="16" y1="16" x2="21" y2="21" />
    </svg>
  );
}

function CustomHeartIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
    </svg>
  );
}

function CustomCartIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M3 3.5h2.2l2.4 11.2a1.8 1.8 0 0 0 1.8 1.4h8.8a1.8 1.8 0 0 0 1.8-1.4l1.5-7.2H6.2" />
    </svg>
  );
}

function CustomUserIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7.2" r="3.8" />
      <path d="M5.5 20.5a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function CategoriesGridIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div className={`${className} rounded-lg bg-[#FF5238] text-white flex items-center justify-center p-1 shadow-2xs shrink-0`}>
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
        <rect x="2" y="2" width="4.5" height="4.5" rx="1.2" />
        <rect x="9.5" y="2" width="4.5" height="4.5" rx="1.2" />
        <rect x="2" y="9.5" width="4.5" height="4.5" rx="1.2" />
        <rect x="9.5" y="9.5" width="4.5" height="4.5" rx="1.2" />
      </svg>
    </div>
  );
}

function DiscountsBadgeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div className={`${className} rounded-full bg-[#FFF5F2] text-[#FF5238] border border-[#FED7CC] flex items-center justify-center shrink-0`}>
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="5" x2="5" y2="19" />
        <circle cx="6.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    </div>
  );
}

function BrandsBadgeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div className={`${className} rounded-full bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] flex items-center justify-center shrink-0`}>
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    </div>
  );
}

function PickupPointBadgeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div className={`${className} rounded-full bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] flex items-center justify-center shrink-0`}>
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    </div>
  );
}

function CompareBadgeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div className={`${className} rounded-full bg-[#FFF5F2] text-[#FF5238] border border-[#FED7CC] flex items-center justify-center shrink-0`}>
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    </div>
  );
}

/* =========================================================================
   MAIN HEADER COMPONENT
   ========================================================================= */

export default function Header() {
  const router = useRouter();
  const {
    cart,
    wishlist,
    compareList,
    updateQuantity,
    removeFromCart,
    user,
    setUser,
    adminUser,
    toggleAuthModal,
    logout,
    addToast
  } = useStore();

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [lang, setLang] = useState<"GE" | "EN">("GE");

  const isAdmin = !!user && (!!adminUser || ["SUPER_ADMIN", "STORE_MANAGER", "SUPPORT_AGENT", "CATALOG_MANAGER", "ADMIN", "MODERATOR", "MANAGER"].includes(user.role || ""));

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0);

  const handleSaveAddress = async (newAddress: string) => {
    setSelectedAddress(newAddress);
    if (user) {
      setUser({ ...user, address: newAddress });
    }
    setIsAddressModalOpen(false);
  };

  return (
    <>
      {/* Top Micro Announcement Bar */}
      <div className="bg-[#1D1D1F] text-white text-xs py-1.5 px-4 flex justify-end items-center gap-4">
        <div className="w-full max-w-[1560px] mx-auto flex justify-end items-center gap-4 px-4 lg:px-6">
          <span className="text-gray-300">უფასო მიწოდება მთელ საქართველოში</span>
          <button
            onClick={() => setLang(lang === "GE" ? "EN" : "GE")}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-xs"
          >
            <span>{lang}</span>
            <div className="w-7 h-4 bg-white/20 rounded-full relative p-0.5 border border-white/20">
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${lang === "EN" ? "translate-x-3" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Main Header Container */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200/70 shadow-2xs">
        
        {/* Tier 1: Main Header Bar (Height 88px, Expanded to 1560px max width) */}
        <div className="w-full max-w-[1560px] mx-auto px-4 lg:px-6 h-[72px] sm:h-[88px] flex items-center justify-between gap-3 sm:gap-4 lg:gap-8 relative z-50">

          {/* Left Side: Hamburger (Mobile) + Brand Logo & Address Button */}
          <div className="flex items-center gap-2.5 sm:gap-5 lg:gap-8 shrink-0">
            {/* Mobile Hamburger Menu Button (lg:hidden) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-11 h-11 rounded-full bg-[#F4F5F7] hover:bg-[#EAECEF] flex items-center justify-center text-gray-800 transition-colors shrink-0 cursor-pointer"
              aria-label="მენიუს გახსნა"
              title="მენიუ"
            >
              <Menu className="w-5 h-5 text-gray-800" />
            </button>

            {/* Logo (120x42) */}
            <Link href="/" className="w-[100px] sm:w-[120px] h-[36px] sm:h-[42px] text-2xl md:text-3xl text-gray-900 tracking-tighter shrink-0 flex items-center gap-0.5">
              <span>spilo</span>
              <span className="text-[#1D1D1F]">.</span>
            </Link>

            {/* Address Selector Pill Button (Icon 48x48) */}
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(true)}
              className="hidden sm:flex items-center gap-2.5 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer text-[13px] group"
              title="მიწოდების მისამართის არჩევა"
            >
              <div className="w-12 h-12 rounded-full bg-[#F2F3F5] group-hover:bg-[#E5E7EB] flex items-center justify-center text-[#212121] shrink-0 transition-colors">
                <LocationPinIcon className="w-5 h-5 text-gray-800" />
              </div>
              <span className="max-w-[140px] lg:max-w-[200px] truncate text-gray-700 group-hover:text-gray-900">
                {selectedAddress || user?.address || "მისამართის დამატება"}
              </span>
            </button>
          </div>

          {/* Center Search Input (Desktop/Tablet Only) */}
          <div className="flex-1 max-w-[800px] w-full min-w-0 hidden sm:flex">
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="w-full h-11 sm:h-12 px-3 sm:px-5 rounded-full border-2 border-gray-200 hover:border-gray-400 focus:border-[#1D1D1F] bg-white text-gray-400 text-xs md:text-[14px] flex items-center gap-2 sm:gap-3.5 shadow-2xs transition-all cursor-pointer group"
            >
              <CustomSearchIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#1D1D1F] group-hover:scale-105 transition-all shrink-0" />
              <span className="truncate text-[#6B7280]">მოძებნე რაც გაგიხარდება</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0">

            {/* Mobile Search Button (sm:hidden - circular icon button matching Cart) */}
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="sm:hidden w-11 h-11 rounded-full bg-[#F4F5F7] hover:bg-[#EAECEF] flex items-center justify-center text-[#212121] hover:text-[#FF5238] transition-colors cursor-pointer"
              title="ძიება"
              aria-label="ძიება"
            >
              <CustomSearchIcon className="w-5 h-5 text-[#212121]" />
            </button>

            {/* Wishlist Button (48x48) - visible from sm: */}
            <Link
              href="/wishlist"
              className="hidden sm:flex w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#F4F5F7] hover:bg-[#EAECEF] items-center justify-center text-[#212121] hover:text-[#FF5238] transition-colors relative cursor-pointer"
              title="სურვილების სია"
            >
              <CustomHeartIcon className="w-5 h-5 text-[#212121]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF5238] text-white text-[10px] rounded-full min-w-4.5 h-4.5 px-1 flex items-center justify-center shadow-xs font-mono">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Button (48x48 with Hover Dropdown) */}
            <div
              className="relative"
              onMouseEnter={() => setIsCartHovered(true)}
              onMouseLeave={() => setIsCartHovered(false)}
            >
              <Link
                href="/cart"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#F4F5F7] hover:bg-[#EAECEF] flex items-center justify-center text-[#212121] hover:text-[#FF5238] transition-colors relative cursor-pointer"
                title="კალათა"
              >
                <CustomCartIcon className="w-5 h-5 text-[#212121]" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FF5238] text-white text-[10px] rounded-full min-w-4.5 h-4.5 px-1 flex items-center justify-center shadow-xs font-mono">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {/* Hover Cart Preview Card Dropdown (Desktop Only) */}
              <AnimatePresence>
                {isCartHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="hidden sm:block absolute right-0 top-full mt-2 w-[380px] bg-white rounded-[28px] shadow-2xl border border-gray-100 p-5 text-gray-900 z-50 space-y-4"
                  >
                    {/* Dropdown Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h4 className="text-sm text-gray-900">კალათა</h4>
                      <span className="text-xs text-gray-500">{cartItemsCount} პროდუქტი</span>
                    </div>

                    {/* Cart Items List or Empty State */}
                    {cart.length === 0 ? (
                      <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="relative w-20 h-20 bg-[#FFF5F2] rounded-full flex items-center justify-center text-[#FF5238]">
                          <CustomCartIcon className="w-10 h-10 text-[#FF5238]" />
                          <span className="absolute top-0 left-0 bg-[#FF5238] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-mono">
                            0
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-gray-100 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-12 h-12 object-contain bg-white p-1 rounded-xl shrink-0"
                              />
                              <div className="min-w-0 flex-1 space-y-1">
                                <p className="text-gray-900 truncate">{item.title}</p>
                                <p className="text-gray-900 font-mono">
                                  {((item.discountPrice || item.price) * item.quantity).toFixed(2)} ₾
                                </p>
                              </div>
                            </div>

                            {/* Actions Right Side */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromCart(item.id);
                                }}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                                title="წაშლა"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              {/* Quantity Control Pill */}
                              <div className="flex items-center gap-2 bg-[#FF5238] text-white px-2.5 py-1 rounded-full text-xs">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(item.id, Math.max(1, item.quantity - 1));
                                  }}
                                  className="hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="font-mono px-1">{item.quantity}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(item.id, item.quantity + 1);
                                  }}
                                  className="hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Subtotal Line */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                      <span className="text-gray-600">ჯამური ფასი:</span>
                      <span className="text-sm text-gray-900 font-mono">
                        {cartSubtotal.toFixed(2)} ₾
                      </span>
                    </div>

                    {/* Action Button: კალათის გახსნა */}
                    <Link
                      href="/cart"
                      onClick={() => setIsCartHovered(false)}
                      className="w-full h-12 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-2xl text-xs sm:text-sm flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                    >
                      <span>კალათის გახსნა</span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Auth / Profile Pill Button (hidden on mobile, visible from md:) */}
            {user ? (
              <Link
                href="/profile"
                className="hidden md:flex items-center gap-2.5 bg-white text-gray-800 hover:text-gray-950 hover:bg-gray-50/80 px-4 lg:px-5 h-11 sm:h-12 rounded-full border border-gray-200 hover:border-gray-300 transition-all cursor-pointer text-xs md:text-[14px]"
              >
                <span className="max-w-[80px] sm:max-w-[120px] truncate text-gray-800">
                  {user.firstName || user.name || "პროფილი"}
                </span>
                <CustomUserIcon className="w-5 h-5 text-gray-800 shrink-0" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => toggleAuthModal(true)}
                className="hidden md:flex items-center gap-2.5 bg-white text-gray-800 hover:text-gray-950 hover:bg-gray-50/80 px-4 lg:px-5 h-11 sm:h-12 rounded-full border border-gray-200 hover:border-gray-300 transition-all cursor-pointer text-xs md:text-[14px]"
              >
                <span className="text-gray-800">შესვლა</span>
                <CustomUserIcon className="w-5 h-5 text-gray-800 shrink-0" />
              </button>
            )}

            {/* Admin Shortcut (Height 48px) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden xl:flex items-center gap-1.5 bg-[#0F172A] hover:bg-slate-800 text-white px-4 h-12 rounded-full border border-slate-700/60 shadow-2xs transition-colors cursor-pointer text-xs shrink-0"
                title="ადმინპანელში გადასვლა"
              >
                <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                <span>ადმინი</span>
              </Link>
            )}

          </div>

        </div>

        {/* Tier 2: Sub-Navigation Bar (Height 64px, Expanded to 1560px max width) */}
        <div className="border-t border-[#F0F0F2] h-[52px] sm:h-[64px] flex items-center">
          <div className="w-full max-w-[1560px] mx-auto px-4 lg:px-6 h-full flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-3.5 sm:gap-5 overflow-x-auto no-scrollbar py-0.5 w-full">
              
              {/* Categories Trigger Button */}
              <button
                type="button"
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                className={`flex items-center gap-2 transition-colors cursor-pointer text-[13px] shrink-0 py-0.5 ${
                  isMegaMenuOpen ? "text-[#FF5238]" : "text-[#1F2937] hover:text-[#FF5238]"
                }`}
              >
                <CategoriesGridIcon className="w-6 h-6" />
                <span>კატეგორიები</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isMegaMenuOpen ? "rotate-180 text-[#FF5238]" : ""}`} />
              </button>

              {/* Vertical Separator */}
              <div className="h-4 w-px bg-[#E5E7EB] shrink-0 mx-1 sm:mx-2" />

              {/* Fast Link 1: Discounts */}
              <Link
                href="/catalog"
                className="flex items-center gap-2 text-[13px] text-[#374151] hover:text-[#FF5238] transition-colors shrink-0 py-0.5"
              >
                <DiscountsBadgeIcon className="w-6 h-6" />
                <span>ფასდაკლებები</span>
              </Link>

              {/* Fast Link 2: Brands */}
              <Link
                href="/catalog"
                className="flex items-center gap-2 text-[13px] text-[#374151] hover:text-[#FF5238] transition-colors shrink-0 py-0.5"
              >
                <BrandsBadgeIcon className="w-6 h-6" />
                <span>ბრენდები</span>
              </Link>

              {/* Fast Link 3: Pick-up Point */}
              <Link
                href="/catalog"
                className="flex items-center gap-2 text-[13px] text-[#374151] hover:text-[#FF5238] transition-colors shrink-0 py-0.5"
              >
                <PickupPointBadgeIcon className="w-6 h-6" />
                <span>გატანის წერტილი</span>
              </Link>

              {/* Fast Link 4: Compare */}
              <Link
                href="/compare"
                className="flex items-center gap-2 text-[13px] text-[#374151] hover:text-[#FF5238] transition-colors shrink-0 py-0.5"
              >
                <CompareBadgeIcon className="w-6 h-6" />
                <span>შედარება</span>
                {compareList.length > 0 && (
                  <span className="bg-[#FFF5F2] text-[#FF5238] border border-[#FED7CC] text-[10px] rounded-full px-1.5 py-0.2 font-mono">
                    {compareList.length}
                  </span>
                )}
              </Link>

            </div>

          </div>
        </div>

        {/* MegaMenu Dropdown */}
        <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
      </header>

      {/* Mobile Drawer Menu (lg:hidden) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Slide-over Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative w-full max-w-[320px] sm:max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden z-10"
            >
              {/* Drawer Top Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl text-gray-900 tracking-tighter flex items-center gap-0.5"
                >
                  <span>spilo</span>
                  <span className="text-[#FF5238]">.</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="დახურვა"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* User Account Card */}
                {user ? (
                  <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center shrink-0">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-900 truncate">
                          {user.firstName || user.name || "მომხმარებელი"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email || user.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 py-2 text-center text-xs bg-white hover:bg-gray-50 text-gray-800 rounded-xl border border-gray-200 transition-colors"
                      >
                        პროფილი
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="px-3 py-2 text-xs bg-[#0F172A] text-white rounded-xl flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span>Admin</span>
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-xl border border-gray-200 bg-white transition-colors"
                        title="გასვლა"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#FFF5F2] rounded-2xl p-4 border border-[#FED7CC] space-y-2.5">
                    <p className="text-xs text-gray-700">ავტორიზაცია ან რეგისტრაცია</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        toggleAuthModal(true);
                      }}
                      className="w-full py-2.5 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>შესვლა / რეგისტრაცია</span>
                    </button>
                  </div>
                )}

                {/* Delivery Address Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAddressModalOpen(true);
                  }}
                  className="w-full p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 flex items-center gap-3 text-left transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-gray-700 shrink-0 shadow-2xs">
                    <LocationPinIcon className="w-4 h-4 text-gray-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-gray-400 block">მიწოდების მისამართი</span>
                    <span className="text-xs text-gray-800 truncate block">
                      {selectedAddress || user?.address || "მისამართის დამატება"}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </button>

                {/* Primary Navigation Section */}
                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-gray-400 px-2 block mb-1">
                    ნავიგაცია
                  </span>

                  <Link
                    href="/categories"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl text-xs text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CategoriesGridIcon className="w-5 h-5" />
                      <span>ყველა კატეგორია</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link
                    href="/catalog"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl text-xs text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <DiscountsBadgeIcon className="w-5 h-5" />
                      <span>ფასდაკლებები</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link
                    href="/catalog"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl text-xs text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BrandsBadgeIcon className="w-5 h-5" />
                      <span>ბრენდები</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link
                    href="/catalog"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl text-xs text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <PickupPointBadgeIcon className="w-5 h-5" />
                      <span>გატანის წერტილი</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link
                    href="/compare"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl text-xs text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CompareBadgeIcon className="w-5 h-5" />
                      <span>შედარება</span>
                    </div>
                    {compareList.length > 0 && (
                      <span className="bg-[#FFF5F2] text-[#FF5238] border border-[#FED7CC] text-[10px] rounded-full px-2 py-0.5 font-mono">
                        {compareList.length}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl text-xs text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                        <Heart className="w-3.5 h-3.5" />
                      </div>
                      <span>სურვილების სია</span>
                    </div>
                    {wishlist.length > 0 && (
                      <span className="bg-[#FF5238] text-white text-[10px] rounded-full px-2 py-0.5 font-mono">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl text-xs text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-orange-50 text-[#FF5238] flex items-center justify-center">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                      <span>კალათა</span>
                    </div>
                    {cartItemsCount > 0 && (
                      <span className="bg-[#FF5238] text-white text-[10px] rounded-full px-2 py-0.5 font-mono">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Info Links Section */}
                <div className="space-y-1 pt-2 border-t border-gray-100">
                  <span className="text-[11px] uppercase tracking-wider text-gray-400 px-2 block mb-1">
                    ინფორმაცია
                  </span>
                  <Link
                    href="/page/about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block p-2 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    ჩვენ შესახებ
                  </Link>
                  <Link
                    href="/page/delivery"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block p-2 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    მიწოდების პირობები
                  </Link>
                  <Link
                    href="/page/privacy"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block p-2 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    კონფიდენციალურობა
                  </Link>
                  <Link
                    href="/page/terms"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block p-2 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    წესები და პირობები
                  </Link>
                </div>
              </div>

              {/* Drawer Bottom Footer: Contact & Language */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/70 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-500" />
                    <span>+995 32 2 00 00 00</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLang(lang === "GE" ? "EN" : "GE")}
                    className="px-2.5 py-1 bg-white rounded-lg border border-gray-200 text-xs text-gray-800 cursor-pointer"
                  >
                    {lang === "GE" ? "ქართული (GE)" : "English (EN)"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Search Modal */}
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />

      {/* Address Selection Modal */}
      <AddAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        initialAddress={selectedAddress || user?.address || ""}
        onSaveAddress={handleSaveAddress}
      />
    </>
  );
}

