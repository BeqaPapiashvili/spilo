"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  ShoppingBag, 
  User, 
  ArrowRight, 
  Sparkles, 
  Trash2, 
  Plus, 
  Minus 
} from "lucide-react";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const SEARCH_PRODUCTS = [
  { 
    id: "dji-neo", 
    sku: "172122",
    code: "180697",
    title: "დრონი DJI Neo Drone Gray", 
    price: 699, 
    cat: "დრონები",
    image: "https://veli.store/media-cdn/__sized__/product/DJI_Neo_Drone-1-thumbnail-200x200-95.jpeg" 
  },
  { 
    id: "dji-mini-4", 
    sku: "172123",
    code: "180698",
    title: "დრონი DJI Mini 4 Pro Fly More Combo", 
    price: 3299, 
    cat: "დრონები",
    image: "https://veli.store/media-cdn/__sized__/product/DJI-ZM700_20250710210650-thumbnail-200x200-95.jpg" 
  },
  { 
    id: "dji-pocket-3", 
    sku: "172124",
    code: "180699",
    title: "სტაბილიზატორი DJI Osmo Pocket 3 Creator Combo", 
    price: 2199, 
    cat: "სტაბილიზატორები",
    image: "https://veli.store/media-cdn/__sized__/product/DJI-ZPK300-C1-8_20250710160051-thumbnail-200x200-95.jpg" 
  },
  { 
    id: "dji-osmo-6", 
    sku: "172125",
    code: "180700",
    title: "სმარტფონის სტაბილიზატორი DJI Osmo Mobile 6", 
    price: 499, 
    cat: "სტაბილიზატორები",
    image: "https://veli.store/media-cdn/__sized__/product/DJI_Osmo_Mobile_7P-thumbnail-200x200-95.jpg" 
  },
  { 
    id: "dji-rc-n3", 
    sku: "172126",
    code: "180701",
    title: "დისტანციური მართვის პულტი DJI RC-N3 Remote Controller", 
    price: 379, 
    cat: "აქსესუარები",
    image: "https://veli.store/media-cdn/__sized__/product/DJI_RC-N3-1-thumbnail-200x200-95.jpg" 
  },
];

export default function Header() {
  const router = useRouter();
  const { toggleCart, cart, updateQuantity, removeFromCart, user, toggleAuthModal } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [lang, setLang] = useState<"GE" | "EN">("GE");

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0);

  const cleanQuery = searchQuery.trim().toLowerCase();

  const filteredResults = SEARCH_PRODUCTS.filter((item) =>
    item.title.toLowerCase().includes(cleanQuery) ||
    item.id.toLowerCase().includes(cleanQuery) ||
    item.sku.toLowerCase().includes(cleanQuery) ||
    item.code.toLowerCase().includes(cleanQuery)
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanQuery) return;

    const exactIdMatch = SEARCH_PRODUCTS.find(
      (item) =>
        item.id.toLowerCase() === cleanQuery ||
        item.sku.toLowerCase() === cleanQuery ||
        item.code.toLowerCase() === cleanQuery
    );

    if (exactIdMatch) {
      router.push(`/product/${exactIdMatch.id}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(cleanQuery)}`);
    }

    setIsSearchFocused(false);
  };

  const handleSelectProduct = (productId: string) => {
    router.push(`/product/${productId}`);
    setIsSearchFocused(false);
  };

  return (
    <>
      {/* Top micro bar */}
      <div className="bg-[#0A0A0A] text-white text-xs py-1.5 px-4 flex justify-end items-center gap-4">
        <div className="container mx-auto flex justify-end items-center gap-4 px-4 lg:px-8">
          <span className="text-gray-400">უფასო მიწოდება მთელ საქართველოში</span>
          <button 
            onClick={() => setLang(lang === "GE" ? "EN" : "GE")}
            className="flex items-center gap-1.5 hover:text-blue-400 transition-colors cursor-pointer"
          >
            <span>{lang}</span>
            <div className="w-7 h-4 bg-gray-800 rounded-full relative p-0.5 border border-gray-700">
              <div className={`w-3 h-3 rounded-full bg-blue-500 transition-transform ${lang === "EN" ? "translate-x-3" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 w-full bg-[#111111] h-16 flex items-center shadow-xs">
        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between gap-4 md:gap-6">
          
          {/* Logo */}
          <Link href="/" className="text-2xl md:text-3xl text-white tracking-tighter shrink-0 flex items-center gap-1">
            <span>spilo</span>
            <span className="text-blue-500">.</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                placeholder="ჩაწერეთ ნივთის დასახელება ან ID (მაგ: 172122, dji-neo)..."
                className="w-full h-10 pl-10 pr-10 rounded-xl border-none focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs md:text-sm bg-white text-gray-900 shadow-2xs placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="absolute left-3 p-0.5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Live Search Results Modal Dropdown */}
            <AnimatePresence>
              {isSearchFocused && searchQuery.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 z-50 p-2 text-gray-900"
                >
                  {filteredResults.length > 0 ? (
                    <div className="flex flex-col">
                      <div className="px-3 py-2 text-[11px] text-gray-500 uppercase tracking-wider flex justify-between items-center border-b border-gray-100 pb-2 mb-1">
                        <span>მოიძებნა ({filteredResults.length}) ნივთი</span>
                        <span className="text-blue-600 text-[10px]">აირჩიეთ ნივთი</span>
                      </div>
                      {filteredResults.map((item) => (
                        <div
                          key={item.id}
                          onMouseDown={() => handleSelectProduct(item.id)}
                          className="flex items-center justify-between px-3 py-2.5 hover:bg-blue-50/60 rounded-lg cursor-pointer transition-colors gap-3 group"
                        >
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt={item.title} className="w-10 h-10 object-contain shrink-0 mix-blend-multiply bg-gray-50 p-1 rounded-md" />
                            <div>
                              <div className="text-gray-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors">{item.title}</div>
                              <div className="text-[11px] text-gray-400">ID: <span className="text-gray-600">{item.sku}</span> • {item.cat}</div>
                            </div>
                          </div>
                          <span className="text-gray-900 text-xs sm:text-sm shrink-0">{item.price} ₾</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 py-6 text-center text-gray-500 text-xs sm:text-sm">
                      შედეგი არ მოიძებნა ID/დასახელებით &quot;{searchQuery}&quot;
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0 text-xs md:text-sm text-white">

            {/* Cart Button Container with Hover Dropdown Popup */}
            <div 
              className="relative"
              onMouseEnter={() => setIsCartHovered(true)}
              onMouseLeave={() => setIsCartHovered(false)}
            >
              <button
                onClick={toggleCart}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity bg-white/10 px-3.5 py-2 rounded-lg cursor-pointer"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 text-blue-400" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">კალათა</span>
              </button>

              {/* Hover Cart Preview Card Dropdown (Matching Screenshot Layout) */}
              <AnimatePresence>
                {isCartHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] bg-white rounded-[28px] shadow-2xl border border-gray-100 p-5 text-gray-900 z-50 space-y-4"
                  >
                    {/* Dropdown Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h4 className="text-sm text-gray-900">კალათა</h4>
                      <span className="text-xs text-gray-500">{cartItemsCount} პროდუქტი</span>
                    </div>

                    {/* Cart Items List or Empty State */}
                    {cart.length === 0 ? (
                      /* Empty Cart View (Matching Screenshot 1) */
                      <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="relative w-20 h-20 bg-[#F1F3F6] rounded-full flex items-center justify-center text-gray-400">
                          <ShoppingBag className="w-10 h-10 text-gray-400" />
                          <span className="absolute top-0 left-0 bg-blue-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-mono">
                            0
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Cart Items List View (Matching Screenshot 2) */
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
                    <button
                      onClick={() => {
                        setIsCartHovered(false);
                        toggleCart();
                      }}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                    >
                      <span>კალათის გახსნა</span>
                    </button>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile / Auth */}
            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-lg text-xs md:text-sm cursor-pointer transition-colors"
              >
                <User className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">პროფილი</span>
              </Link>
            ) : (
              <button
                onClick={() => toggleAuthModal(true)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity bg-white/10 px-3.5 py-2 rounded-lg cursor-pointer text-xs md:text-sm"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">შესვლა</span>
              </button>
            )}
          </div>

        </div>
      </header>
    </>
  );
}
