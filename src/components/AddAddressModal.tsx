"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, MapPin, Loader2 } from "lucide-react";

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-[750px] overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 pb-4 text-center relative border-b border-gray-100/60">
          <h3 className="text-xl text-gray-900 tracking-tight">
            მისამართის დამატება
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#111111] hover:bg-black text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Address Title / Search Input */}
          <div className="relative" ref={dropdownRef}>
            <div className="relative flex items-center">
              <input
                type="text"
                value={addressTitle}
                onChange={handleInputChange}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="მისამართის დასახელება"
                className="w-full h-14 pl-4 pr-10 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              />
              <div className="absolute right-4 text-gray-400 pointer-events-none">
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </div>
            </div>

            {/* Dropdown Suggestions matching Google Places Layout */}
            {isDropdownOpen && (suggestions.length > 0 || isSearching) && (
              <div className="absolute z-30 left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-200/80 shadow-2xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-gray-100">
                {isSearching && suggestions.length === 0 && (
                  <div className="p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Google Maps-ზე ძებნა...</span>
                  </div>
                )}

                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-4 py-3 hover:bg-[#F8FAFC] text-xs transition-colors flex items-center gap-3 cursor-pointer group"
                  >
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-blue-600 transition-colors" />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-gray-900">{item.mainText}</span>
                      <span className="text-gray-500 text-[11px]">{item.secondaryText}</span>
                    </div>
                  </button>
                ))}

                {/* Powered by Google Footer Watermark */}
                <div className="px-3 py-2 bg-[#F8FAFC] border-t border-gray-100 flex justify-end items-center text-[10px] text-gray-400 gap-1 select-none">
                  <span>powered by</span>
                  <span className="tracking-tight font-sans text-[11px]">
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Additional Comment Input */}
          <div>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="დამატებითი კომენტარი"
              className="w-full h-14 px-4 bg-[#F1F3F6] rounded-2xl text-xs md:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>

          {/* Authentic Google Maps Embed View */}
          <div className="w-full h-64 md:h-72 rounded-2xl overflow-hidden border border-gray-200/80 relative shadow-inner bg-gray-100">
            <iframe
              title="Google Maps Location"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={googleMapsUrl}
              className="w-full h-full border-none"
            />
          </div>

          {/* Modal Footer / Save Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving || !addressTitle.trim()}
              className="px-8 h-13 bg-[#111111] hover:bg-black disabled:opacity-50 text-white rounded-2xl text-xs md:text-sm cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ინახება...</span>
                </>
              ) : (
                <span>მისამართის დამატება</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
