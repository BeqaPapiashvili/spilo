"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  ShoppingBag, 
  User, 
  Trash2, 
  Plus, 
  Minus,
  LayoutGrid,
  Percent,
  ChevronDown,
  ShieldCheck
} from "lucide-react";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SearchModal } from "./SearchModal";
import { MegaMenu } from "./MegaMenu";

export default function Header() {
  const router = useRouter();
  const { toggleCart, cart, updateQuantity, removeFromCart, user, adminUser, toggleAuthModal } = useStore();
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [lang, setLang] = useState<"GE" | "EN">("GE");

  const isAdmin = !!user && (!!adminUser || ["SUPER_ADMIN", "STORE_MANAGER", "SUPPORT_AGENT", "CATALOG_MANAGER", "ADMIN", "MODERATOR", "MANAGER"].includes(user.role || ""));

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0);

  return (
    <>
      {/* Top micro bar */}
      <div className="bg-[#0A0A0A] text-white text-xs py-1.5 px-4 flex justify-end items-center gap-4">
        <div className="container mx-auto flex justify-end items-center gap-4 px-4 lg:px-8">
          <span className="text-gray-400">უფასო მიწოდება მთელ საქართველოში</span>
          <button 
            onClick={() => setLang(lang === "GE" ? "EN" : "GE")}
            className="flex items-center gap-1.5 hover:text-blue-400 transition-colors cursor-pointer text-xs"
          >
            <span>{lang}</span>
            <div className="w-7 h-4 bg-gray-800 rounded-full relative p-0.5 border border-gray-700">
              <div className={`w-3 h-3 rounded-full bg-blue-500 transition-transform ${lang === "EN" ? "translate-x-3" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Main Header (Solid Light Off-White Background matching Screenshot) */}
      <header className="sticky top-0 z-50 w-full bg-[#F4F4F6] border-b border-gray-200/60 py-2.5 shadow-xs">
        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between gap-3 md:gap-4 relative z-50">
          
          {/* Logo */}
          <Link href="/" className="text-2xl md:text-3xl text-gray-900 tracking-tighter shrink-0 flex items-center gap-0.5">
            <span>spilo</span>
            <span className="text-blue-600">.</span>
          </Link>

          {/* Mega Menu Toggle Button */}
          <div className="relative">
            <button
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className="hidden lg:flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-4 h-11 rounded-2xl border border-gray-200/80 shadow-2xs text-xs transition-colors cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4 text-blue-600" />
              <span>კატეგორიები</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isMegaMenuOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Search Trigger Input (Opens full Search Modal) */}
          <div className="flex-1 max-w-xl relative">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="w-full h-11 pl-11 pr-4 rounded-2xl border border-gray-200/80 bg-white text-gray-400 text-xs md:text-sm flex items-center justify-start text-left shadow-2xs cursor-pointer"
            >
              <Search className="w-4.5 h-4.5 text-blue-600 absolute left-3.5" />
              <span>ძიება: DJI, iPhone 16 Pro, MacBook...</span>
            </button>
          </div>

          {/* Right Action Icons (Matching Screenshot Pill Buttons) */}
          <div className="flex items-center gap-2 shrink-0 text-xs md:text-sm">

            {/* Cart Button Container with Hover Dropdown Popup */}
            <div 
              className="relative"
              onMouseEnter={() => setIsCartHovered(true)}
              onMouseLeave={() => setIsCartHovered(false)}
            >
              <Link
                href="/cart"
                className="flex items-center gap-2.5 bg-white text-gray-900 hover:bg-gray-50 px-4 md:px-5 h-11 rounded-2xl border border-gray-200/80 shadow-2xs transition-colors cursor-pointer relative"
              >
                <div className="relative">
                  <ShoppingBag className="w-4.5 h-4.5 text-gray-900" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2.5 -left-2 bg-blue-600 text-white text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-xs">
                      {cartItemsCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">კალათა</span>
              </Link>

              {/* Hover Cart Preview Card Dropdown */}
              <AnimatePresence>
                {isCartHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute -left-28 sm:-left-44 top-full mt-2 w-[340px] sm:w-[380px] bg-white rounded-[28px] shadow-2xl border border-gray-100 p-5 text-gray-900 z-50 space-y-4"
                  >
                    {/* Dropdown Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h4 className="text-sm text-gray-900">კალათა</h4>
                      <span className="text-xs text-gray-500">{cartItemsCount} პროდუქტი</span>
                    </div>

                    {/* Cart Items List or Empty State */}
                    {cart.length === 0 ? (
                      /* Empty Cart View */
                      <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="relative w-20 h-20 bg-[#F1F3F6] rounded-full flex items-center justify-center text-gray-400">
                          <ShoppingBag className="w-10 h-10 text-gray-400" />
                          <span className="absolute top-0 left-0 bg-blue-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-mono">
                            0
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Cart Items List View */
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
                              <div className="flex items-center gap-2 bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs">
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
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                    >
                      <span>კალათის გახსნა</span>
                    </Link>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile / Auth Button (Pill Shaped) */}
            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-2.5 bg-white text-gray-900 hover:bg-gray-50 px-4 md:px-5 h-11 rounded-2xl border border-gray-200/80 shadow-2xs transition-colors cursor-pointer"
              >
                <User className="w-4.5 h-4.5 text-gray-900" />
                <span className="hidden sm:inline">პროფილი</span>
              </Link>
            ) : (
              <button
                onClick={() => toggleAuthModal(true)}
                className="flex items-center gap-2.5 bg-white text-gray-900 hover:bg-gray-50 px-4 md:px-5 h-11 rounded-2xl border border-gray-200/80 shadow-2xs transition-colors cursor-pointer"
              >
                <User className="w-4.5 h-4.5 text-gray-900" />
                <span className="hidden sm:inline">შესვლა</span>
              </button>
            )}

            {/* Admin Panel Direct Shortcut Button */}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white px-3.5 sm:px-4 h-11 rounded-2xl border border-slate-700/60 shadow-2xs transition-colors cursor-pointer text-xs shrink-0"
                title="ადმინპანელში გადასვლა"
              >
                <ShieldCheck className="w-4.5 h-4.5 text-blue-400" />
                <span className="hidden sm:inline">ადმინპანელი</span>
              </Link>
            )}

            {/* Special Offers % Pill Button */}
            <Link
              href="/catalog"
              className="bg-blue-600 hover:bg-blue-700 text-white w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer transition-colors shadow-2xs"
              title="სპეციალური შეთავაზებები"
            >
              <Percent className="w-5 h-5" />
            </Link>

          </div>

        </div>

        {/* MegaMenu Portal */}
        <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
      </header>

      {/* Full Search Modal */}
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
}
