"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ChevronRight, 
  Trash2, 
  Plus, 
  X, 
  Search, 
  GitCompare, 
  Share2, 
  Check,
  Tag
} from "lucide-react";
import { useStore } from "@/store/useStore";

interface ComparisonProduct {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  specs: {
    brand: string;
    releaseYear: string;
    // Display
    screenProtection: string;
    screenSize: string;
    refreshRate: string;
    brightness: string;
    resolution: string;
    panelType: string;
    // Technical Specs
    bodyMaterial: string;
    stereoSpeaker: string;
    eSim: string;
    fiveG: string;
    bluetooth: string;
    chipset: string;
    simCard: string;
    os: string;
    ipProtection: string;
    // Battery
    wirelessCharging: string;
    fastCharging: string;
    batteryType: string;
    // Camera
    frontCamera: string;
    mainCamera: string;
    videoRecording: string;
    // Storage
    storageStandard: string;
    internalStorage: string;
    microSdSlot: string;
    // Ports
    jack35mm: string;
    chargingPort: string;
    // Weight & Color
    weight: string;
    color: string;
  };
}

const COMPARISON_DATABASE: Record<string, ComparisonProduct> = {
  "dji-neo": {
    id: "dji-neo",
    title: "დრონი DJI Neo Drone Gray",
    price: 699,
    image: "https://veli.store/media-cdn/__sized__/product/DJI_Neo_Drone-1-thumbnail-200x200-95.jpeg",
    category: "დრონები",
    specs: {
      brand: "DJI",
      releaseYear: "2024",
      screenProtection: "-",
      screenSize: "-",
      refreshRate: "-",
      brightness: "-",
      resolution: "4K UHD (3840x2160)",
      panelType: "-",
      bodyMaterial: "ულტრა-მსუბუქი პოლიმერი",
      stereoSpeaker: "არა",
      eSim: "არა",
      fiveG: "Wi-Fi 6",
      bluetooth: "5.1",
      chipset: "DJI Custom Flight SoC",
      simCard: "-",
      os: "DJI Fly OS",
      ipProtection: "-",
      wirelessCharging: "არა",
      fastCharging: "PD Fast Charge",
      batteryType: "Li-Po 2S",
      frontCamera: "-",
      mainCamera: "12 MP 1/2-inch Sensor",
      videoRecording: "4K 30fps",
      storageStandard: "Internal Flash",
      internalStorage: "22 GB",
      microSdSlot: "არა",
      jack35mm: "არა",
      chargingPort: "Type-C",
      weight: "135 g",
      color: "ნაცრისფერი",
    },
  },
  "dji-mini-4": {
    id: "dji-mini-4",
    title: "დრონი DJI Mini 4 Pro Fly More Combo",
    price: 3299,
    image: "https://veli.store/media-cdn/__sized__/product/DJI-ZM700_20250710210650-thumbnail-200x200-95.jpg",
    category: "დრონები",
    specs: {
      brand: "DJI",
      releaseYear: "2023",
      screenProtection: "-",
      screenSize: "5.5 ინჩი (FHD პულტი)",
      refreshRate: "60 Hz",
      brightness: "700 nits",
      resolution: "4K HDR 60fps",
      panelType: "IPS LCD Remote Screen",
      bodyMaterial: "კომპოზიტური კორპუსი",
      stereoSpeaker: "არა",
      eSim: "არა",
      fiveG: "O4 Video Transmission",
      bluetooth: "5.2",
      chipset: "DJI O4 System",
      simCard: "-",
      os: "DJI Fly",
      ipProtection: "-",
      wirelessCharging: "არა",
      fastCharging: "30W",
      batteryType: "Li-Po 3S",
      frontCamera: "-",
      mainCamera: "48 MP 1/1.3-inch CMOS",
      videoRecording: "4K 100fps",
      storageStandard: "MicroSD",
      internalStorage: "2 GB + MicroSD",
      microSdSlot: "დიახ (512GB-მდე)",
      jack35mm: "არა",
      chargingPort: "Type-C",
      weight: "249 g",
      color: "ნაცრისფერი",
    },
  },
  "iphone-17-pro": {
    id: "iphone-17-pro",
    title: "Apple iPhone 17 Pro Max | 2TB Cosmic Orange",
    price: 7069,
    image: "https://veli.store/media-cdn/__sized__/product/DJI-ZM700_20250710210650-thumbnail-200x200-95.jpg",
    category: "სმარტფონები",
    specs: {
      brand: "Apple",
      releaseYear: "2025",
      screenProtection: "Ceramic Shield 2",
      screenSize: "6.90 ინჩი",
      refreshRate: "120 Hz",
      brightness: "3000 nits",
      resolution: "2868 x 1320",
      panelType: "LTPO Super Retina XDR OLED",
      bodyMaterial: "ტიტანის ჩარჩო, შუშის უკანა პანელი",
      stereoSpeaker: "დიახ",
      eSim: "დიახ",
      fiveG: "დიახ",
      bluetooth: "5.3",
      chipset: "Apple A19 Pro",
      simCard: "Single SIM + eSIM",
      os: "iOS 19",
      ipProtection: "IP68",
      wirelessCharging: "დიახ (25W MagSafe)",
      fastCharging: "25W",
      batteryType: "Li-Ion",
      frontCamera: "18 MP, f/1.9",
      mainCamera: "48 MP, f/1.78",
      videoRecording: "4K 120fps-მდე",
      storageStandard: "NVMe",
      internalStorage: "2 TB",
      microSdSlot: "არა",
      jack35mm: "არა",
      chargingPort: "Type-C",
      weight: "233 g",
      color: "ნარინჯისფერი",
    },
  },
  "pixel-9-pro": {
    id: "pixel-9-pro",
    title: "Google Pixel 9 Pro XL 16/256GB Hazel",
    price: 2699,
    image: "https://veli.store/media-cdn/__sized__/product/DJI_Neo_Drone-1-thumbnail-200x200-95.jpeg",
    category: "სმარტფონები",
    specs: {
      brand: "Google",
      releaseYear: "2024",
      screenProtection: "Corning Gorilla Glass Victus 2",
      screenSize: "6.80 ინჩი",
      refreshRate: "120 Hz",
      brightness: "3000 nits",
      resolution: "QHD+",
      panelType: "LTPO OLED",
      bodyMaterial: "ალუმინის ჩარჩო, შუშის უკანა პანელი",
      stereoSpeaker: "დიახ",
      eSim: "დიახ",
      fiveG: "დიახ",
      bluetooth: "5.3",
      chipset: "Google Tensor G4",
      simCard: "Single SIM + eSIM",
      os: "Android 15",
      ipProtection: "IP68",
      wirelessCharging: "დიახ (23W)",
      fastCharging: "37W",
      batteryType: "Li-Ion",
      frontCamera: "42 MP, f/2.2",
      mainCamera: "50 MP, f/1.68",
      videoRecording: "8K 30fps-მდე",
      storageStandard: "UFS 3.1",
      internalStorage: "256 GB",
      microSdSlot: "არა",
      jack35mm: "არა",
      chargingPort: "Type-C",
      weight: "221 g",
      color: "ნაცრისფერი",
    },
  },
  "samsung-s24-ultra": {
    id: "samsung-s24-ultra",
    title: "Samsung Galaxy S24 Ultra 512GB Titanium Black",
    price: 3899,
    image: "https://veli.store/media-cdn/__sized__/product/DJI-ZPK300-C1-8_20250710160051-thumbnail-200x200-95.jpg",
    category: "სმარტფონები",
    specs: {
      brand: "Samsung",
      releaseYear: "2024",
      screenProtection: "Corning Gorilla Armor",
      screenSize: "6.80 ინჩი",
      refreshRate: "120 Hz",
      brightness: "2600 nits",
      resolution: "3120 x 1440",
      panelType: "Dynamic AMOLED 2X",
      bodyMaterial: "ტიტანის ჩარჩო, შუშის უკანა პანელი",
      stereoSpeaker: "დიახ",
      eSim: "დიახ",
      fiveG: "დიახ",
      bluetooth: "5.3",
      chipset: "Snapdragon 8 Gen 3",
      simCard: "Dual SIM + eSIM",
      os: "Android 14 (One UI 6.1)",
      ipProtection: "IP68",
      wirelessCharging: "დიახ (15W)",
      fastCharging: "45W",
      batteryType: "Li-Ion 5000 mAh",
      frontCamera: "12 MP, f/2.2",
      mainCamera: "200 MP, f/1.7",
      videoRecording: "8K 30fps-მდე",
      storageStandard: "UFS 4.0",
      internalStorage: "512 GB",
      microSdSlot: "არა",
      jack35mm: "არა",
      chargingPort: "Type-C",
      weight: "232 g",
      color: "შავი",
    },
  },
};

const SPEC_SECTIONS = [
  {
    title: "ბრენდი & ძირითადი",
    rows: [
      { key: "brand", label: "ბრენდი" },
      { key: "releaseYear", label: "გამოშვების თარიღი" },
    ],
  },
  {
    title: "ეკრანი",
    rows: [
      { key: "screenProtection", label: "ეკრანის დაცვა" },
      { key: "screenSize", label: "ეკრანის ზომა" },
      { key: "refreshRate", label: "განახლების სიხშირე" },
      { key: "brightness", label: "ეკრანის სიკაშკაშე" },
      { key: "resolution", label: "რეზოლუცია" },
      { key: "panelType", label: "ეკრანის ტიპი" },
    ],
  },
  {
    title: "ტექნიკური მახასიათებლები",
    rows: [
      { key: "bodyMaterial", label: "კორპუსი" },
      { key: "stereoSpeaker", label: "სტერეო სპიკერი" },
      { key: "eSim", label: "E-SIM" },
      { key: "fiveG", label: "5G" },
      { key: "bluetooth", label: "Bluetooth" },
      { key: "chipset", label: "ჩიპსეტი" },
      { key: "simCard", label: "SIM ბარათი" },
      { key: "os", label: "ოპერაციული სისტემა" },
      { key: "ipProtection", label: "IP დაცვა" },
    ],
  },
  {
    title: "ელემენტი & დატენვა",
    rows: [
      { key: "wirelessCharging", label: "უსადენო დატენვა" },
      { key: "fastCharging", label: "სწრაფი დატენვა" },
      { key: "batteryType", label: "ელემენტის ტიპი" },
    ],
  },
  {
    title: "კამერა & ვიდეო",
    rows: [
      { key: "frontCamera", label: "წინა კამერა" },
      { key: "mainCamera", label: "ძირითადი კამერა" },
      { key: "videoRecording", label: "ვიდეო ჩაწერა" },
    ],
  },
  {
    title: "მეხსიერება",
    rows: [
      { key: "storageStandard", label: "მეხსიერების სტანდარტი" },
      { key: "internalStorage", label: "შიდა მეხსიერება" },
      { key: "microSdSlot", label: "Micro SD სლოტი" },
    ],
  },
  {
    title: "პორტები & ზომები",
    rows: [
      { key: "jack35mm", label: "3.5mm აუდიო ჯეკი" },
      { key: "chargingPort", label: "დასატენი პორტი" },
      { key: "weight", label: "წონა" },
      { key: "color", label: "ფერი" },
    ],
  },
];

export default function ComparePage() {
  const { compareList, addToCompare, removeFromCompare, clearCompare } = useStore();
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");

  const activeProductIds = compareList.length > 0 ? compareList : ["dji-neo", "dji-mini-4"];

  const activeProducts = useMemo(() => {
    return activeProductIds.map((id) => COMPARISON_DATABASE[id] || COMPARISON_DATABASE["dji-neo"]);
  }, [activeProductIds]);

  const primaryCategory = activeProducts[0]?.category || "დრონები";

  const sameCategorySearchResults = useMemo(() => {
    const q = modalSearchQuery.trim().toLowerCase();
    return Object.values(COMPARISON_DATABASE).filter((p) => {
      if (p.category !== primaryCategory) return false;
      if (activeProductIds.includes(p.id)) return false;
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || p.specs.brand.toLowerCase().includes(q);
    });
  }, [modalSearchQuery, activeProductIds, primaryCategory]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans pb-24">
      
      {/* Top Breadcrumb Navigation */}
      <div className="py-3.5 bg-white mb-6">
        <div className="container mx-auto px-4 lg:px-6 max-w-[1600px]">
          <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              მთავარი
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-900">შედარება ({primaryCategory})</span>
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 lg:px-6 max-w-[1600px] space-y-6">
        
        {/* Top Header Controls (Zero Harsh Borders) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl text-gray-900 tracking-tight">
              შედარება
            </h1>
            <span className="bg-blue-50 text-blue-700 text-xs md:text-sm px-3.5 py-1.5 rounded-xl">
              კატეგორია: {primaryCategory}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {activeProducts.length > 0 && (
              <button
                onClick={clearCompare}
                className="flex items-center gap-1.5 text-xs md:text-sm text-gray-600 hover:text-red-600 transition-colors cursor-pointer px-3.5 py-2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.015)]"
              >
                <Trash2 className="w-4 h-4 text-gray-400" />
                <span>გასუფთავება</span>
              </button>
            )}

            <button
              onClick={() => alert("შედარების ბმული დაკოპირდა!")}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>გაზიარება</span>
            </button>
          </div>
        </div>

        {/* Notice Message */}
        <p className="text-xs md:text-sm text-gray-500">
          შედარების დასაწყებად გთხოვთ დაამატოთ იმავე კატეგორიის ({primaryCategory}) პროდუქტები!
        </p>

        {/* Modern Borderless Comparison Stage with Faint Shadows */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden p-5 md:p-6 space-y-6">
          
          {/* Header Row: Product Slots + Differences Checkbox */}
          <div className="grid grid-cols-12 gap-4 items-center bg-[#F8FAFD] rounded-2xl p-4">
            
            {/* Left Slot: Differences Toggle Checkbox */}
            <div className="col-span-3 flex items-center gap-2">
              <label
                onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
                className="flex items-center gap-2.5 cursor-pointer text-xs md:text-sm text-gray-800 select-none group"
              >
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                    showOnlyDifferences
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white border border-gray-200 group-hover:border-blue-400"
                  }`}
                >
                  {showOnlyDifferences && <Check className="w-3.5 h-3.5" />}
                </div>
                <span>განსხვავებები</span>
              </label>
            </div>

            {/* Product Slots Columns (Up to 4 Slots) */}
            <div className="col-span-9 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              
              {/* Active Products Slots */}
              {activeProducts.map((product) => (
                <div
                  key={product.id}
                  className="relative bg-white rounded-xl p-3 flex items-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.015)] group"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCompare(product.id)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    title="წაშლა"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Product Thumbnail */}
                  <div className="w-13 h-13 shrink-0 bg-[#F8FAFD] rounded-lg p-1 flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 pr-4">
                    <h3 className="text-xs md:text-sm text-gray-900 leading-snug line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-xs md:text-sm text-blue-600 mt-1">
                      {product.price} ₾
                    </p>
                  </div>
                </div>
              ))}

              {/* Empty Product Slots (Add Button) */}
              {activeProducts.length < 4 && (
                <div
                  onClick={() => setIsSearchModalOpen(true)}
                  className="bg-white hover:bg-[#F1F5F9] rounded-xl p-4 flex items-center justify-center gap-2 text-xs md:text-sm text-blue-600 cursor-pointer transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.015)] min-h-[76px]"
                >
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>დაამატეთ</span>
                </div>
              )}

            </div>

          </div>

          {/* Borderless Modern Spec Table Sections */}
          <div className="space-y-6 text-xs md:text-sm">
            {SPEC_SECTIONS.map((section, secIdx) => {
              
              const visibleRows = section.rows.filter((row) => {
                if (!showOnlyDifferences) return true;
                if (activeProducts.length < 2) return true;

                const firstVal = activeProducts[0].specs[row.key as keyof typeof activeProducts[0]["specs"]];
                return activeProducts.some(
                  (p) => p.specs[row.key as keyof typeof p["specs"]] !== firstVal
                );
              });

              if (visibleRows.length === 0) return null;

              return (
                <div key={secIdx} className="space-y-2">
                  
                  {/* Floating Soft Section Header */}
                  <div className="bg-[#F8FAFD] px-5 py-3 rounded-xl text-xs md:text-sm text-gray-900">
                    <span>{section.title}</span>
                  </div>

                  {/* Spec Rows (Soft Alternating Rows, Zero Harsh Grid Lines) */}
                  <div className="space-y-1">
                    {visibleRows.map((row, rowIdx) => (
                      <div
                        key={row.key}
                        className={`grid grid-cols-12 px-5 py-3 rounded-xl items-center gap-4 ${
                          rowIdx % 2 === 0 ? "bg-white" : "bg-[#F8FAFD]/50"
                        }`}
                      >
                        {/* Row Label (Left Column) */}
                        <div className="col-span-3 text-xs md:text-sm text-gray-500">
                          {row.label}
                        </div>

                        {/* Product Values (Right Columns) */}
                        <div className="col-span-9 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs md:text-sm text-gray-900 text-center md:text-left leading-relaxed">
                          {activeProducts.map((product) => (
                            <div key={product.id} className="px-1">
                              {product.specs[row.key as keyof typeof product["specs"]] || "-"}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </main>

      {/* Product Selection Modal (Borderless Soft Styling) */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header: Search Box + Close Button side-by-side */}
            <div className="flex items-center gap-3 pt-1">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  placeholder="მოძებნეთ დასახელებით..."
                  className="w-full bg-[#F8FAFD] rounded-full py-3.5 pl-11 pr-4 text-xs md:text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all"
                  autoFocus
                />
              </div>

              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-xs"
                title="დახურვა"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Product List */}
            <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
              {sameCategorySearchResults.length > 0 ? (
                sameCategorySearchResults.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFD] hover:bg-[#F1F5F9] transition-colors group cursor-pointer"
                    onClick={() => {
                      addToCompare(product.id);
                      setIsSearchModalOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-11 h-11 object-contain rounded-lg shrink-0 bg-white p-1"
                      />
                      <div>
                        <h4 className="text-xs md:text-sm text-gray-900 leading-tight">
                          {product.title}
                        </h4>
                        <p className="text-xs md:text-sm text-blue-600 mt-0.5">
                          {product.price} ₾
                        </p>
                      </div>
                    </div>

                    <button
                      className="w-9 h-9 rounded-xl bg-blue-900 hover:bg-blue-800 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-colors"
                    >
                      <GitCompare className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs md:text-sm text-gray-500">
                  {primaryCategory} კატეგორიაში სხვა შესადარებელი ნივთი ვერ მოიძებნა
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
