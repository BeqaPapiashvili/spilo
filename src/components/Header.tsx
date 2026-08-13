"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, User, ArrowRight, Sparkles } from "lucide-react";
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
  const { toggleCart, cart, user, toggleAuthModal, setUser } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [lang, setLang] = useState<"GE" | "EN">("GE");

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

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

    // Check ONLY direct ID or SKU exact match
    const exactIdMatch = SEARCH_PRODUCTS.find(
      (item) =>
        item.id.toLowerCase() === cleanQuery ||
        item.sku.toLowerCase() === cleanQuery ||
        item.code.toLowerCase() === cleanQuery
    );

    if (exactIdMatch) {
      router.push(`/product/${exactIdMatch.id}`);
    } else {
      // If searched by name/word, navigate directly to /search?q=... page!
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

          {/* Search Bar with ID Search & Enter Auto Navigation / Search List */}
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
          <div className="flex items-center gap-3 md:gap-4 shrink-0 text-xs md:text-sm text-white">
            <button
              onClick={toggleCart}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity bg-white/10 px-3.5 py-2 rounded-lg cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">კალათა</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-lg text-xs md:text-sm">
                <User className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">{user.name}</span>
                <button
                  onClick={() => setUser(null)}
                  className="text-[11px] text-gray-400 hover:text-red-400 ml-1 transition-colors cursor-pointer"
                  title="გამოსვლა"
                >
                  (გამოსვლა)
                </button>
              </div>
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
