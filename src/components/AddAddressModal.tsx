"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, MapPin, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAddress?: string;
  onSaveAddress: (address: string) => Promise<void> | void;
}

interface AddressSuggestion {
  mainText: string;
  secondaryText: string;
  fullAddress: string;
  lat?: number;
  lon?: number;
}

export default function AddAddressModal({
  isOpen,
  onClose,
  initialAddress = "",
  onSaveAddress,
}: AddAddressModalProps) {
  const [addressTitle, setAddressTitle] = useState(initialAddress);
  const [comment, setComment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial address when modal opens
  useEffect(() => {
    if (isOpen) {
      setAddressTitle(initialAddress);
      setComment("");
      setSearchQuery(initialAddress);
      setSuggestions([]);
      setIsDropdownOpen(false);
    }
  }, [isOpen, initialAddress]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Georgian Latin to Georgian script transliteration dictionary
  const transliterateKa = (text: string): string => {
    const geoMap: Record<string, string> = {
      iloris: "ილორის",
      ilori: "ილორის",
      chavchavadzis: "ჭავჭავაძის",
      chavchavadze: "ჭავჭავაძის",
      rustavelis: "რუსთაველის",
      rustaveli: "რუსთაველის",
      pekini: "პეკინის",
      pekinis: "პეკინის",
      tbilisi: "თბილისი",
      batumi: "ბათუმი",
      kutaisi: "ქუთაისი",
      rustavi: "რუსთავი",
      gldani: "გლდანი",
      vake: "ვაკე",
      saburtalo: "საბურთალო",
      street: "ქუჩა",
      st: "ქუჩა",
      ave: "გამზირი",
      avenue: "გამზირი",
    };

    let result = text;
    Object.keys(geoMap).forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      result = result.replace(regex, geoMap[word]);
    });

    return result;
  };

  // Perform OpenStreetMap Nominatim Geocoding Search
  const fetchAddressSuggestions = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const formattedQuery = transliterateKa(query);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        formattedQuery
      )}&countrycodes=ge&addressdetails=1&limit=5&accept-language=ka`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "SpiloApp/1.0",
        },
      });

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const formatted: AddressSuggestion[] = data.map((item: any) => {
          const addr = item.address || {};

          const houseNum = addr.house_number || query.match(/\d+/)?.[0] || "";

          let streetName =
            addr.road ||
            addr.pedestrian ||
            addr.suburb ||
            addr.neighbourhood ||
            item.display_name.split(",")[0];

          if (!streetName.includes("ქუჩა") && !streetName.includes("გამზირი")) {
            streetName = `${streetName} ქუჩა`;
          }

          const mainText = houseNum ? `${houseNum} ${streetName}` : streetName;

          const city = addr.city || addr.town || addr.village || addr.state || "Tbilisi";
          const country = addr.country || "Georgia";
          const secondaryText = `${city}, ${country}`;

          return {
            mainText,
            secondaryText,
            fullAddress: `${mainText}, ${secondaryText}`,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
          };
        });

        setSuggestions(formatted);
      } else {
        // Smart Fallback Format matching Google Places
        const houseNumber = query.match(/\d+/)?.[0] || "";
        const cleanQuery = transliterateKa(query.replace(/\d+/g, "").trim());
        const mainText = houseNumber
          ? `${houseNumber} ${cleanQuery} ქუჩა`
          : `${cleanQuery} ქუჩა`;

        setSuggestions([
          {
            mainText: mainText.trim(),
            secondaryText: "Tbilisi, Georgia",
            fullAddress: `${mainText.trim()}, Tbilisi, Georgia`,
          },
        ]);
      }
    } catch (error) {
      console.warn("Geocoding fetch failed, fallback:", error);
      const houseNumber = query.match(/\d+/)?.[0] || "";
      const cleanQuery = transliterateKa(query.replace(/\d+/g, "").trim());
      const mainText = houseNumber
        ? `${houseNumber} ${cleanQuery} ქუჩა`
        : `${cleanQuery} ქუჩა`;

      setSuggestions([
        {
          mainText: mainText.trim(),
          secondaryText: "Tbilisi, Georgia",
          fullAddress: `${mainText.trim()}, Tbilisi, Georgia`,
        },
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced input handler for live map search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddressTitle(val);
    setSearchQuery(val);
    setIsDropdownOpen(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchAddressSuggestions(val);
    }, 350);
  };

  const handleSelectSuggestion = (item: AddressSuggestion) => {
    setAddressTitle(item.fullAddress);
    setSearchQuery(item.fullAddress);
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressTitle.trim()) return;

    setIsSaving(true);
    try {
      const fullAddress = comment.trim()
        ? `${addressTitle.trim()}, (კომენტარი: ${comment.trim()})`
        : addressTitle.trim();
      await onSaveAddress(fullAddress);
      onClose();
    } catch (err) {
      console.error("Save address error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Construct embedded Google Maps iframe URL
  const googleMapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    searchQuery || addressTitle || "Tbilisi, Georgia"
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-6">
          <motion.button
            type="button"
            aria-label="დახურვა"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/45"
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 340, mass: 0.85 }}
            className="relative z-10 w-full sm:max-w-[720px] bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl flex flex-col h-[96dvh] sm:h-[min(88vh,820px)] overflow-hidden"
          >
            <div className="sm:hidden flex justify-center pt-3 shrink-0">
              <span className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="px-5 pt-3 pb-4 sm:p-6 sm:pb-4 flex items-center justify-between border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-full bg-[#F4F5F7] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#1D1D1F]" strokeWidth={1.7} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[17px] text-[#1D1D1F] leading-tight">
                    მისამართის დამატება
                  </h3>
                  <p className="text-[12px] text-gray-400 mt-0.5 truncate">
                    აირჩიე მისამართი რუკაზე ან მოძებნე
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                type="button"
                className="w-9 h-9 rounded-full bg-[#F4F5F7] text-gray-700 hover:bg-[#EAECEF] flex items-center justify-center cursor-pointer transition-colors shrink-0"
                aria-label="დახურვა"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-4 sm:p-6 flex flex-col gap-3.5 flex-1 min-h-0">
              <div className="relative shrink-0" ref={dropdownRef}>
                <label className="text-[11px] text-gray-500 block px-1 mb-1.5">მისამართი</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={addressTitle}
                    onChange={handleInputChange}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="მაგ: ჭავჭავაძის გამზირი 17"
                    className="w-full h-12 pl-4 pr-11 bg-[#F4F5F7] rounded-2xl text-[14px] md:text-sm text-[#1D1D1F] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5238] transition-all"
                  />
                  <div className="absolute right-3.5 text-gray-400 pointer-events-none">
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#FF5238]" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {isDropdownOpen && (suggestions.length > 0 || isSearching) && (
                  <div className="absolute z-30 left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                    {isSearching && suggestions.length === 0 && (
                      <div className="p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#FF5238]" />
                        <span>მისამართის ძებნა...</span>
                      </div>
                    )}

                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full text-left px-4 py-3 hover:bg-[#F4F5F7] text-[13px] transition-colors flex items-start gap-3 cursor-pointer group border-b border-gray-50 last:border-0"
                      >
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5 group-hover:text-[#FF5238] transition-colors" />
                        <div className="min-w-0">
                          <p className="text-[#1D1D1F] leading-snug">{item.mainText}</p>
                          {item.secondaryText ? (
                            <p className="text-gray-400 text-[11px] mt-0.5">{item.secondaryText}</p>
                          ) : null}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="shrink-0">
                <label className="text-[11px] text-gray-500 block px-1 mb-1.5">დამატებითი კომენტარი</label>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="სადარბაზო, სართული, კოდი..."
                  className="w-full h-12 px-4 bg-[#F4F5F7] rounded-2xl text-[14px] md:text-sm text-[#1D1D1F] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5238] transition-all"
                />
              </div>

              <div className="w-full flex-1 min-h-[240px] rounded-2xl overflow-hidden bg-[#F4F5F7] relative">
                <iframe
                  title="რუკა"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={googleMapsUrl}
                  className="absolute inset-0 w-full h-full border-none"
                />
              </div>

              <div className="pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] shrink-0">
                <button
                  type="submit"
                  disabled={isSaving || !addressTitle.trim()}
                  className="w-full h-12 bg-[#FF5238] hover:bg-[#EA3A20] disabled:opacity-50 text-white rounded-2xl text-[15px] cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>ინახება...</span>
                    </>
                  ) : (
                    <span>მისამართის შენახვა</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
