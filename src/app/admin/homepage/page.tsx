"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  LayoutTemplate, 
  MoveUp, 
  MoveDown, 
  Eye, 
  Save, 
  Check, 
  Layers, 
  Loader2, 
  Settings, 
  X, 
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Sliders,
  Sparkles,
  ShoppingBag,
  Grid,
  Image as ImageIcon,
  Flame,
  Tag,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Gift,
  Truck,
  ShieldCheck,
  CreditCard,
  Headphones,
  RotateCcw,
  Award,
  Clock,
  HelpCircle,
  Info,
  Smartphone,
  Laptop,
  Watch,
  Gamepad2,
  Tv,
  Camera,
  Home as HomeIcon
} from "lucide-react";
import Link from "next/link";
import { Category, Brand, Product } from "@/types";
import { 
  PromoCardItem, 
  PromoStyleConfig, 
  TrustItem, 
  HeroSlideItem, 
  DEFAULT_PROMO_CARDS, 
  DEFAULT_TRUST_ITEMS, 
  DEFAULT_HERO_SLIDES 
} from "@/types/storefront";
import ImageUploadField from "@/components/admin/ImageUploadField";
import PastelPromoCard from "@/components/sections/PastelPromoCard";
import TrustStripSection from "@/components/home/TrustStripSection";

interface StorefrontSection {
  id: string;
  key?: string | null;
  type: string;
  title?: string | null;
  subtitle?: string | null;
  isEnabled: boolean;
  sortOrder: number;
  config?: any;
}

const SECTION_TYPES = [
  { 
    id: "HERO_BANNER", 
    label: "მთავარი სლაიდერი (Hero Slider)", 
    icon: Sparkles, 
    color: "#2563eb", 
    desc: "საიტის ყველაზე მთავარი ფლაგმანური ბლოკი საიტის თავში. მოიცავს ზედა მრგვალი კატეგორიების ზოლსა და დიდ ბანერს მცურავი საჩუქრის ბარათით.",
    storefrontPosition: "საიტის ყველაზე ზედა ნაწილი (Header-ის ქვემოთ)"
  },
  { 
    id: "PROMO_CAROUSEL", 
    label: "პასტელური პრომო ბარათები (Pastel Cards)", 
    icon: Tag, 
    color: "#ea580c", 
    desc: "თანამედროვე პასტელური სარეკლამო ბარათები (ვარდისფერი, იასამნისფერი, ატმისფერი...) ფასდაკლების პილულითა და გამჭვირვალე PNG პროდუქტებით.",
    storefrontPosition: "სარეკლამო პრომო ზოლი (ჰორიზონტალური სლაიდერი)"
  },
  { 
    id: "PRODUCT_CAROUSEL", 
    label: "პროდუქტების კარუსელი (Carousel)", 
    icon: ShoppingBag, 
    color: "#059669", 
    desc: "პროდუქტების ჰორიზონტალური სენსორული სლაიდერი (მაგ: DJI ტექნიკა, სმარტფონები, Flash Deals). მხარს უჭერს ბრენდით, კატეგორიით ან ხელით ფილტრაციას.",
    storefrontPosition: "პროდუქტების დინამიური სექცია (სლაიდერი)"
  },
  { 
    id: "PRODUCT_GRID", 
    label: "პროდუქტების ბადე (Grid)", 
    icon: Grid, 
    color: "#0284c7", 
    desc: "პროდუქტების რესპონსიული ბადე (2, 3, 4 ან 6 სვეტი). იდეალურია დიდი კატალოგების ან რჩეული პროდუქტების სრული ბადით გამოსატანად.",
    storefrontPosition: "პროდუქტების ბადე (სვეტები)"
  },
  { 
    id: "PROMO_BANNER_GRID", 
    label: "პრომო ბანერების ბადე (Banner Grid)", 
    icon: ImageIcon, 
    color: "#d97706", 
    desc: "1, 2 ან 3 სარეკლამო ბანერი გვერდიგვერდ (მაგ: PS5 Slim, AirPods Max, Tech Deals) ფოტოთი, სათაურითა და ღილაკით.",
    storefrontPosition: "სარეკლამო ბანერების ბადე"
  },
  { 
    id: "BANNER", 
    label: "სრული ბანერი (Full Banner)", 
    icon: ImageIcon, 
    color: "#4f46e5", 
    desc: "სრული სიგანის დიდი ფლაგმანური სარეკლამო ბლოკი (მაგ: Apple iPhone 16 Pro ბანერი, DJI Ecosystem).",
    storefrontPosition: "სრული სიგანის ბანერი"
  },
  { 
    id: "CATEGORY_GRID", 
    label: "კატეგორიების ბლოკი (Categories)", 
    icon: Grid, 
    color: "#9333ea", 
    desc: "სწრაფი ნავიგაციის კატეგორიების ვიზუალური ბარათები (სმარტფონები, ლეპტოპები, გეიმინგი, აუდიო...).",
    storefrontPosition: "კატეგორიების ვიტრინა"
  },
  { 
    id: "BRAND_GRID", 
    label: "ბრენდების ზოლი (Brands)", 
    icon: Flame, 
    color: "#0d9488", 
    desc: "ოფიციალური პარტნიორი ბრენდების ლოგოების ზოლი (Apple, Samsung, DJI, Sony, JBL, Marshall...).",
    storefrontPosition: "ოფიციალური ბრენდების ზოლი"
  },
  { 
    id: "TRUST_STRIP", 
    label: "გარანტიები & სერვისები (Trust Strip)", 
    icon: Sparkles, 
    color: "#2563eb", 
    desc: "მაღაზიის სანდოობის 4 მთავარი ბარათი: სწრაფი მიწოდება, 0% განვადება, ოფიციალური გარანტია და 24/7 მხარდაჭერა.",
    storefrontPosition: "სანდოობის ზოლი"
  },
  { 
    id: "RECENTLY_VIEWED", 
    label: "ბოლოს ნანახი (Recently Viewed)", 
    icon: Layers, 
    color: "#475569", 
    desc: "მომხმარებლის მიერ ბოლოს დათვალიერებული პროდუქტების პერსონალიზებული სექცია.",
    storefrontPosition: "პერსონალური ისტორია"
  },
];

const BADGE_PRESETS = [
  { text: "40%-მდე", color: "bg-orange-500 text-white" },
  { text: "30%-მდე", color: "bg-red-500 text-white" },
  { text: "50%-მდე", color: "bg-rose-600 text-white" },
  { text: "TOP ფასი", color: "bg-emerald-500 text-white" },
  { text: "HOT DEAL", color: "bg-red-500 text-white" },
  { text: "NEW", color: "bg-blue-500 text-white" },
  { text: "სპეციალური შეთავაზება", color: "bg-blue-600 text-white" },
  { text: "Next-Gen Gaming", color: "bg-purple-600 text-white" },
  { text: "Apple Official", color: "bg-slate-900 text-white" },
];

const PASTEL_COLOR_PRESETS = [
  { name: "ვარდისფერი (Pink)", color: "#FFC5E3" },
  { name: "იასამნისფერი (Lavender)", color: "#E2D9FF" },
  { name: "ატმისფერი (Peach)", color: "#FFE6C7" },
  { name: "ცისფერი (Sky Blue)", color: "#C8F2FF" },
  { name: "პიტნისფერი (Mint)", color: "#D0F4DE" },
  { name: "ყვითელი (Lemon)", color: "#FFF1C5" },
];

const TRUST_ICON_OPTIONS: { id: TrustItem["icon"]; label: string; icon: any }[] = [
  { id: "Truck", label: "მიწოდება", icon: Truck },
  { id: "ShieldCheck", label: "გარანტია", icon: ShieldCheck },
  { id: "CreditCard", label: "განვადება", icon: CreditCard },
  { id: "Headphones", label: "მხარდაჭერა", icon: Headphones },
  { id: "RotateCcw", label: "დაბრუნება", icon: RotateCcw },
  { id: "Sparkles", label: "საჩუქარი", icon: Sparkles },
  { id: "Award", label: "პრემიუმი", icon: Award },
  { id: "Clock", label: "სისწრაფე", icon: Clock },
];

const TRUST_COLOR_PRESETS = [
  { name: "ლურჯი (Blue)", color: "#2563eb" },
  { name: "მწვანე (Green)", color: "#16a34a" },
  { name: "ნარინჯისფერი (Amber)", color: "#d97706" },
  { name: "იასამნისფერი (Purple)", color: "#9333ea" },
  { name: "ვარდისფერი (Rose)", color: "#e11d48" },
  { name: "ცისფერი (Cyan)", color: "#0891b2" },
];

const CATEGORY_ICON_MAP: Record<string, any> = {
  Smartphone,
  Laptop,
  Watch,
  Headphones,
  Gamepad2,
  Tv,
  Camera,
  Home: HomeIcon,
  Sparkles,
};

// --- Custom Form Controls ---

function CustomSwitch({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out ${
          checked ? "bg-blue-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </div>
      {label && <span className="text-xs text-slate-700">{label}</span>}
    </div>
  );
}

function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "აირჩიეთ...",
  searchable = true,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string; icon?: any; color?: string }[];
  placeholder?: string;
  searchable?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!query) return options;
    return options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));
  }, [options, query]);

  const selectedOpt = options.find((o) => o.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-left text-xs text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer shadow-xs"
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOpt ? (
            <>
              {selectedOpt.color && (
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: selectedOpt.color }}
                />
              )}
              <span className="truncate">{selectedOpt.label}</span>
            </>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-60 flex flex-col">
          {searchable && (
            <div className="p-2 border-b border-slate-100">
              <div className="relative flex items-center">
                <Search size={13} className="absolute left-2.5 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ძიება..."
                  className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="overflow-y-auto py-1 max-h-48 divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <div className="px-3 py-2.5 text-xs text-slate-400 text-center">
                ვარიანტი არ მოიძებნა
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.color && (
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: opt.color }}
                        />
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-blue-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Page Component ---

export default function AdminHomepageCMSPage() {
  const [sections, setSections] = useState<StorefrontSection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"BASIC" | "DATA" | "LAYOUT">("BASIC");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State - Tab 1
  const [formType, setFormType] = useState("PRODUCT_CAROUSEL");
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formBadgeText, setFormBadgeText] = useState("");
  const [formTargetLink, setFormTargetLink] = useState("/catalog");

  // Hero Slides State - Tab 2
  const [formHeroSlides, setFormHeroSlides] = useState<HeroSlideItem[]>(DEFAULT_HERO_SLIDES);
  const [selectedHeroSlideIndex, setSelectedHeroSlideIndex] = useState<number>(0);

  // Form State - Tab 2 (Automatic vs Manual Products)
  const [formSourceType, setFormSourceType] = useState<"AUTOMATIC" | "MANUAL">("AUTOMATIC");
  const [formBrand, setFormBrand] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formOrderBy, setFormOrderBy] = useState("createdAt_desc");
  const [formLimit, setFormLimit] = useState(8);
  const [formOnlyDiscounted, setFormOnlyDiscounted] = useState(false);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formManualProductIds, setFormManualProductIds] = useState<string[]>([]);
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  // Category Grid State - Tab 2
  const [formCategoryMode, setFormCategoryMode] = useState<"ALL" | "MANUAL">("ALL");
  const [formSelectedCategoryIds, setFormSelectedCategoryIds] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [formCategoryLimit, setFormCategoryLimit] = useState(12);

  // Brand Grid State - Tab 2
  const [formBrandMode, setFormBrandMode] = useState<"ALL" | "MANUAL">("ALL");
  const [formSelectedBrandIds, setFormSelectedBrandIds] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [formBrandLimit, setFormBrandLimit] = useState(16);

  // Form State - Tab 2 (Promo Cards Repeater & Live Selection)
  const [formPromoCards, setFormPromoCards] = useState<PromoCardItem[]>(DEFAULT_PROMO_CARDS);
  const [selectedPromoCardIndex, setSelectedPromoCardIndex] = useState<number>(0);

  // Form State - Tab 2 (Trust Items Repeater & Live Selection)
  const [formTrustItems, setFormTrustItems] = useState<TrustItem[]>(DEFAULT_TRUST_ITEMS);
  const [selectedTrustItemIndex, setSelectedTrustItemIndex] = useState<number>(0);

  // Form State - Tab 2 (Banner Repeater)
  const [formBanners, setFormBanners] = useState<
    { title: string; subtitle: string; tagText: string; buttonText: string; bannerUrl: string; link: string }[]
  >([
    {
      title: "სპეციალური შეთავაზება",
      subtitle: "შეიძინე ტექნიკა საუკეთესო ფასად",
      tagText: "აქცია",
      buttonText: "ყიდვა",
      bannerUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
      link: "/catalog",
    },
  ]);

  // Form State - Tab 3 (Layout & Visual Shape Config)
  const [formColumns, setFormColumns] = useState(4);
  const [formAutoplay, setFormAutoplay] = useState(true);

  const fetchSections = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/homepage");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSections(data.data);
      } else {
        setErrorMsg(data.message || "სექციების ჩატვირთვა ვერ მოხერხდა");
      }
    } catch (err: any) {
      console.error("Error fetching homepage sections:", err);
      setErrorMsg(err.message || "კავშირის შეცდომა");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();

    Promise.all([
      fetch("/api/categories").then((r) => r.json()).catch(() => ({ success: false })),
      fetch("/api/brands").then((r) => r.json()).catch(() => ({ success: false })),
      fetch("/api/products").then((r) => r.json()).catch(() => ({ success: false })),
    ]).then(([cRes, bRes, pRes]) => {
      if (cRes.success && Array.isArray(cRes.data)) setCategories(cRes.data);
      if (bRes.success && Array.isArray(bRes.data)) setBrands(bRes.data);
      if (pRes.success && Array.isArray(pRes.data)) setAllProducts(pRes.data);
    }).catch((err) => console.error("Error loading categories/brands/products:", err));
  }, []);

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isEnabled: !s.isEnabled } : s))
    );
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const newSections = [...sections];
    const temp = newSections[idx - 1];
    newSections[idx - 1] = newSections[idx];
    newSections[idx] = temp;
    newSections.forEach((s, i) => {
      s.sortOrder = i;
    });
    setSections(newSections);
  };

  const moveDown = (idx: number) => {
    if (idx === sections.length - 1) return;
    const newSections = [...sections];
    const temp = newSections[idx + 1];
    newSections[idx + 1] = newSections[idx];
    newSections[idx] = temp;
    newSections.forEach((s, i) => {
      s.sortOrder = i;
    });
    setSections(newSections);
  };

  const handleDuplicate = (sec: StorefrontSection, idx: number) => {
    const copy: StorefrontSection = {
      ...sec,
      id: `copy_${Date.now()}`,
      key: `${sec.key || "sec"}_copy_${Date.now().toString().slice(-4)}`,
      title: `${sec.title || "სექცია"} (ასლი)`,
      sortOrder: idx + 1,
    };
    const updated = [...sections];
    updated.splice(idx + 1, 0, copy);
    updated.forEach((s, i) => {
      s.sortOrder = i;
    });
    setSections(updated);
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setEditingId(null);
    setActiveTab("BASIC");
    setFormType("PRODUCT_CAROUSEL");
    setFormTitle("ახალი სექცია");
    setFormSubtitle("");
    setFormBadgeText("");
    setFormTargetLink("/catalog");
    setFormHeroSlides(DEFAULT_HERO_SLIDES);
    setSelectedHeroSlideIndex(0);
    setFormSourceType("AUTOMATIC");
    setFormBrand("");
    setFormCategory("");
    setFormOrderBy("createdAt_desc");
    setFormLimit(8);
    setFormOnlyDiscounted(false);
    setFormIsFeatured(false);
    setFormManualProductIds([]);
    setFormCategoryMode("ALL");
    setFormSelectedCategoryIds([]);
    setCategorySearch("");
    setFormCategoryLimit(12);
    setFormBrandMode("ALL");
    setFormSelectedBrandIds([]);
    setBrandSearch("");
    setFormBrandLimit(16);
    setFormPromoCards(DEFAULT_PROMO_CARDS);
    setSelectedPromoCardIndex(0);
    setFormTrustItems(DEFAULT_TRUST_ITEMS);
    setSelectedTrustItemIndex(0);
    setFormBanners([
      {
        title: "სპეციალური შეთავაზება",
        subtitle: "შეიძინე ტექნიკა საუკეთესო ფასად",
        tagText: "აქცია",
        buttonText: "ყიდვა",
        bannerUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
        link: "/catalog",
      },
    ]);
    setFormColumns(4);
    setFormAutoplay(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sec: StorefrontSection) => {
    setIsEditMode(true);
    setEditingId(sec.id);
    setActiveTab("BASIC");
    setFormType(sec.type || "PRODUCT_CAROUSEL");
    setFormTitle(sec.title || "");
    setFormSubtitle(sec.subtitle || "");
    setFormBadgeText(sec.config?.badgeText || sec.config?.tagText || "");
    setFormTargetLink(sec.config?.targetLink || sec.config?.link || "/catalog");
    
    // Hero Slides Config
    if (Array.isArray(sec.config?.heroSlides) && sec.config.heroSlides.length > 0) {
      setFormHeroSlides(sec.config.heroSlides);
    } else if (sec.config?.bannerUrl || sec.title) {
      setFormHeroSlides([
        {
          id: "slide-1",
          image: sec.config?.bannerUrl || "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1400&q=80",
          badge: sec.config?.tagText || sec.config?.badgeText || "სპეციალური შეთავაზება",
          title: sec.config?.title || sec.title || "იპოვე იდეალური საჩუქარი ყველასთვის",
          subtitle: sec.config?.subtitle || sec.subtitle || "შეარჩიე, შეფუთე, გაუგზავნე საჩუქარი მარტივად spilo-თი",
          buttonText: sec.config?.buttonText || "შეარჩიე საჩუქარი",
          link: sec.config?.link || sec.config?.targetLink || "/catalog",
        },
      ]);
    } else {
      setFormHeroSlides(DEFAULT_HERO_SLIDES);
    }
    setSelectedHeroSlideIndex(0);

    setFormSourceType(sec.config?.sourceType === "MANUAL" ? "MANUAL" : "AUTOMATIC");
    setFormBrand(sec.config?.brand || "");
    setFormCategory(sec.config?.categoryId || "");
    setFormOrderBy(sec.config?.orderBy || "createdAt_desc");
    setFormLimit(Number(sec.config?.limit) || 8);
    setFormOnlyDiscounted(Boolean(sec.config?.onlyDiscounted || sec.config?.isFlash));
    setFormIsFeatured(Boolean(sec.config?.isFeatured));
    setFormManualProductIds(Array.isArray(sec.config?.manualProductIds) ? sec.config.manualProductIds : []);

    // Category Grid Config
    setFormCategoryMode(sec.config?.categoryMode === "MANUAL" ? "MANUAL" : "ALL");
    setFormSelectedCategoryIds(Array.isArray(sec.config?.selectedCategoryIds) ? sec.config.selectedCategoryIds : []);
    setCategorySearch("");
    setFormCategoryLimit(Number(sec.config?.limit) || 12);

    // Brand Grid Config
    setFormBrandMode(sec.config?.brandMode === "MANUAL" ? "MANUAL" : "ALL");
    setFormSelectedBrandIds(Array.isArray(sec.config?.selectedBrandIds) ? sec.config.selectedBrandIds : []);
    setBrandSearch("");
    setFormBrandLimit(Number(sec.config?.limit) || 16);

    // Promo Cards
    if (Array.isArray(sec.config?.promoCards) && sec.config.promoCards.length > 0) {
      setFormPromoCards(sec.config.promoCards);
    } else {
      setFormPromoCards(DEFAULT_PROMO_CARDS);
    }
    setSelectedPromoCardIndex(0);

    // Trust Items
    if (Array.isArray(sec.config?.trustItems) && sec.config.trustItems.length > 0) {
      setFormTrustItems(sec.config.trustItems);
    } else {
      setFormTrustItems(DEFAULT_TRUST_ITEMS);
    }
    setSelectedTrustItemIndex(0);

    // Banners
    if (Array.isArray(sec.config?.bannerData) && sec.config.bannerData.length > 0) {
      setFormBanners(sec.config.bannerData);
    } else if (sec.config?.bannerUrl) {
      setFormBanners([
        {
          title: sec.title || "",
          subtitle: sec.subtitle || "",
          tagText: sec.config?.tagText || "",
          buttonText: sec.config?.buttonText || "ყიდვა",
          bannerUrl: sec.config?.bannerUrl || "",
          link: sec.config?.link || "/catalog",
        },
      ]);
    }

    setFormColumns(Number(sec.config?.columns) || 4);
    setFormAutoplay(sec.config?.autoplay !== false);

    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    const configData: any = {
      sourceType: formSourceType,
      brand: formBrand,
      categoryId: formCategory,
      orderBy: formOrderBy,
      limit: Number(formLimit) || 8,
      onlyDiscounted: formOnlyDiscounted,
      isFlash: formOnlyDiscounted,
      isFeatured: formIsFeatured,
      targetLink: formTargetLink,
      link: formTargetLink,
      columns: Number(formColumns) || 4,
      autoplay: formAutoplay,
      badgeText: formBadgeText,
    };

    if (formType === "HERO_BANNER") {
      configData.heroSlides = formHeroSlides;
      if (formHeroSlides.length > 0) {
        configData.bannerUrl = formHeroSlides[0].image;
        configData.title = formHeroSlides[0].title;
        configData.subtitle = formHeroSlides[0].subtitle;
        configData.tagText = formHeroSlides[0].badge;
        configData.buttonText = formHeroSlides[0].buttonText;
        configData.link = formHeroSlides[0].link;
      }
    }

    if (formSourceType === "MANUAL") {
      configData.manualProductIds = formManualProductIds;
    }

    if (formType === "CATEGORY_GRID" || formType === "CATEGORY_CIRCLE_LIST") {
      configData.categoryMode = formCategoryMode;
      configData.selectedCategoryIds = formSelectedCategoryIds;
      configData.limit = formCategoryLimit;
    }

    if (formType === "BRAND_GRID" || formType === "BRAND_MARQUEE") {
      configData.brandMode = formBrandMode;
      configData.selectedBrandIds = formSelectedBrandIds;
      configData.limit = formBrandLimit;
    }

    if (formType === "PROMO_CAROUSEL" || formType === "PROMO_CARDS" || formType === "PASTEL_PROMO_CARDS") {
      configData.promoCards = formPromoCards;
    }

    if (formType === "TRUST_STRIP") {
      configData.trustItems = formTrustItems;
    }

    if (formType === "PROMO_BANNER_GRID" || formType === "BANNER") {
      configData.bannerData = formBanners;
      if (formBanners.length > 0) {
        configData.bannerUrl = formBanners[0].bannerUrl;
        configData.tagText = formBanners[0].tagText;
        configData.buttonText = formBanners[0].buttonText;
      }
    }

    const savedTitle = formType === "HERO_BANNER" ? (formHeroSlides[0]?.title || formTitle) : formTitle;
    const savedSubtitle = formType === "HERO_BANNER" ? (formHeroSlides[0]?.subtitle || formSubtitle) : formSubtitle;

    if (isEditMode && editingId) {
      setSections((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s,
                type: formType,
                title: savedTitle,
                subtitle: savedSubtitle,
                config: configData,
              }
            : s
        )
      );
    } else {
      const newSec: StorefrontSection = {
        id: `sec_${Date.now()}`,
        key: `custom_${Date.now()}`,
        type: formType,
        title: savedTitle,
        subtitle: savedSubtitle,
        isEnabled: true,
        sortOrder: sections.length,
        config: configData,
      };
      setSections((prev) => [...prev, newSec]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteSection = async (id: string, name: string) => {
    if (!confirm(`ნამდვილად გსურთ სექციის წაშლა: "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/homepage?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSections(data.data);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setSections((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      setSections((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: sections.map((s, idx) => ({
            id: s.id,
            key: s.key,
            type: s.type,
            title: s.title,
            subtitle: s.subtitle,
            isEnabled: Boolean(s.isEnabled),
            sortOrder: idx,
            config: s.config,
          })),
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSections(data.data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErrorMsg(data.message || "შენახვისას დაფიქსირდა შეცდომა");
      }
    } catch (err: any) {
      console.error("Save homepage sections error:", err);
      setErrorMsg(err.message || "კავშირის შეცდომა");
    } finally {
      setSaving(false);
    }
  };

  // Hero Slides Repeater Handlers
  const handleAddHeroSlide = () => {
    const newSlide: HeroSlideItem = {
      id: `hero-${Date.now()}`,
      image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1400&q=80",
      badge: "სპეციალური შეთავაზება",
      title: "ახალი მთავარი სლაიდერი",
      subtitle: "აღმოაჩინე ექსკლუზიური შეთავაზებები და ფასდაკლებები",
      buttonText: "შეარჩიე საჩუქარი",
      link: "/catalog",
    };
    setFormHeroSlides([...formHeroSlides, newSlide]);
    setSelectedHeroSlideIndex(formHeroSlides.length);
  };

  const handleRemoveHeroSlide = (index: number) => {
    if (formHeroSlides.length <= 1) return;
    const updated = formHeroSlides.filter((_, i) => i !== index);
    setFormHeroSlides(updated);
    setSelectedHeroSlideIndex(Math.max(0, index - 1));
  };

  const handleUpdateHeroSlide = (index: number, field: keyof HeroSlideItem, val: string) => {
    setFormHeroSlides(
      formHeroSlides.map((s, i) => (i === index ? { ...s, [field]: val } : s))
    );
  };

  const handleMoveHeroSlide = (index: number, direction: "UP" | "DOWN") => {
    if (direction === "UP" && index === 0) return;
    if (direction === "DOWN" && index === formHeroSlides.length - 1) return;
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    const updated = [...formHeroSlides];
    const temp = updated[targetIdx];
    updated[targetIdx] = updated[index];
    updated[index] = temp;
    setFormHeroSlides(updated);
    setSelectedHeroSlideIndex(targetIdx);
  };

  // Promo Cards Repeater Handlers
  const handleAddPromoCard = () => {
    const newCard: PromoCardItem = {
      id: `pc-${Date.now()}`,
      title: "ახალი შეთავაზება",
      badge: "40%-მდე",
      bgColor: "#FFC5E3",
      bgImageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
      link: "/catalog",
    };
    setFormPromoCards([...formPromoCards, newCard]);
    setSelectedPromoCardIndex(formPromoCards.length);
  };

  const handleRemovePromoCard = (index: number) => {
    if (formPromoCards.length <= 1) return;
    const updated = formPromoCards.filter((_, i) => i !== index);
    setFormPromoCards(updated);
    setSelectedPromoCardIndex(Math.max(0, index - 1));
  };

  const handleUpdatePromoCard = (index: number, field: keyof PromoCardItem, val: string) => {
    setFormPromoCards(
      formPromoCards.map((c, i) => (i === index ? { ...c, [field]: val } : c))
    );
  };

  const handleMovePromoCard = (index: number, direction: "UP" | "DOWN") => {
    if (direction === "UP" && index === 0) return;
    if (direction === "DOWN" && index === formPromoCards.length - 1) return;
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    const updated = [...formPromoCards];
    const temp = updated[targetIdx];
    updated[targetIdx] = updated[index];
    updated[index] = temp;
    setFormPromoCards(updated);
    setSelectedPromoCardIndex(targetIdx);
  };

  // Trust Items Repeater Handlers
  const handleAddTrustItem = () => {
    const newItem: TrustItem = {
      id: `trust-${Date.now()}`,
      icon: "ShieldCheck",
      title: "ახალი სერვისი",
      subtitle: "მოკლე აღწერა",
      link: "/catalog",
      iconColor: "#2563eb",
    };
    setFormTrustItems([...formTrustItems, newItem]);
    setSelectedTrustItemIndex(formTrustItems.length);
  };

  const handleRemoveTrustItem = (index: number) => {
    if (formTrustItems.length <= 1) return;
    const updated = formTrustItems.filter((_, i) => i !== index);
    setFormTrustItems(updated);
    setSelectedTrustItemIndex(Math.max(0, index - 1));
  };

  const handleUpdateTrustItem = (index: number, field: keyof TrustItem, val: string) => {
    setFormTrustItems(
      formTrustItems.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const handleMoveTrustItem = (index: number, direction: "UP" | "DOWN") => {
    if (direction === "UP" && index === 0) return;
    if (direction === "DOWN" && index === formTrustItems.length - 1) return;
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    const updated = [...formTrustItems];
    const temp = updated[targetIdx];
    updated[targetIdx] = updated[index];
    updated[index] = temp;
    setFormTrustItems(updated);
    setSelectedTrustItemIndex(targetIdx);
  };

  // Category Selection Handlers
  const toggleCategorySelection = (catId: string) => {
    if (formSelectedCategoryIds.includes(catId)) {
      setFormSelectedCategoryIds(formSelectedCategoryIds.filter((id) => id !== catId));
    } else {
      setFormSelectedCategoryIds([...formSelectedCategoryIds, catId]);
    }
  };

  // Brand Selection Handlers
  const toggleBrandSelection = (brandId: string) => {
    if (formSelectedBrandIds.includes(brandId)) {
      setFormSelectedBrandIds(formSelectedBrandIds.filter((id) => id !== brandId));
    } else {
      setFormSelectedBrandIds([...formSelectedBrandIds, brandId]);
    }
  };

  const handleMoveSelectedBrand = (index: number, direction: "UP" | "DOWN") => {
    if (direction === "UP" && index === 0) return;
    if (direction === "DOWN" && index === formSelectedBrandIds.length - 1) return;
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    const updated = [...formSelectedBrandIds];
    const temp = updated[targetIdx];
    updated[targetIdx] = updated[index];
    updated[index] = temp;
    setFormSelectedBrandIds(updated);
  };

  // Active Items for Live Preview
  const activeHeroSlide = formHeroSlides[selectedHeroSlideIndex] || formHeroSlides[0] || DEFAULT_HERO_SLIDES[0];
  const prevHeroSlideIndex = (selectedHeroSlideIndex - 1 + formHeroSlides.length) % (formHeroSlides.length || 1);
  const nextHeroSlideIndex = (selectedHeroSlideIndex + 1) % (formHeroSlides.length || 1);
  const prevHeroSlide = formHeroSlides[prevHeroSlideIndex] || activeHeroSlide;
  const nextHeroSlide = formHeroSlides[nextHeroSlideIndex] || activeHeroSlide;
  const activePromoCard = formPromoCards[selectedPromoCardIndex] || formPromoCards[0] || DEFAULT_PROMO_CARDS[0];
  const activeTrustItem = formTrustItems[selectedTrustItemIndex] || formTrustItems[0] || DEFAULT_TRUST_ITEMS[0];

  // Banner Repeater Handlers
  const handleAddBanner = () => {
    if (formBanners.length >= 3) return;
    setFormBanners([
      ...formBanners,
      {
        title: "ახალი აქცია",
        subtitle: "სპეციალური ფასდაკლება",
        tagText: "HOT",
        buttonText: "ყიდვა",
        bannerUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80",
        link: "/catalog",
      },
    ]);
  };

  const handleRemoveBanner = (index: number) => {
    if (formBanners.length <= 1) return;
    setFormBanners(formBanners.filter((_, i) => i !== index));
  };

  const handleUpdateBanner = (index: number, field: string, val: string) => {
    setFormBanners(
      formBanners.map((b, i) => (i === index ? { ...b, [field]: val } : b))
    );
  };

  // Live Filtered Categories for Live Preview Studio
  const liveFilteredCategories = useMemo(() => {
    if (formCategoryMode === "MANUAL") {
      if (formSelectedCategoryIds.length === 0) return [];
      const orderMap = new Map(formSelectedCategoryIds.map((id, idx) => [id, idx]));
      return categories
        .filter((c) => formSelectedCategoryIds.includes(c.id) || formSelectedCategoryIds.includes(c.slug))
        .sort((a, b) => {
          const idxA = orderMap.has(a.id) ? orderMap.get(a.id)! : (orderMap.get(a.slug) ?? 999);
          const idxB = orderMap.has(b.id) ? orderMap.get(b.id)! : (orderMap.get(b.slug) ?? 999);
          return idxA - idxB;
        });
    }
    return categories.slice(0, formCategoryLimit || 12);
  }, [categories, formCategoryMode, formSelectedCategoryIds, formCategoryLimit]);

  // Live Filtered Brands for Live Preview Studio
  const liveFilteredBrands = useMemo(() => {
    if (formBrandMode === "MANUAL") {
      if (formSelectedBrandIds.length === 0) return [];
      const orderMap = new Map(formSelectedBrandIds.map((id, idx) => [id, idx]));
      return brands
        .filter((b) => formSelectedBrandIds.includes(b.id) || formSelectedBrandIds.includes(b.slug))
        .sort((a, b) => {
          const idxA = orderMap.has(a.id) ? orderMap.get(a.id)! : (orderMap.get(a.slug) ?? 999);
          const idxB = orderMap.has(b.id) ? orderMap.get(b.id)! : (orderMap.get(b.slug) ?? 999);
          return idxA - idxB;
        });
    }
    return brands.slice(0, formBrandLimit || 16);
  }, [brands, formBrandMode, formSelectedBrandIds, formBrandLimit]);

  // Search Filtered Categories for Picker
  const searchFilteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [categories, categorySearch]);

  // Search Filtered Brands for Picker
  const searchFilteredBrands = useMemo(() => {
    if (!brandSearch) return brands;
    return brands.filter((b) => b.name.toLowerCase().includes(brandSearch.toLowerCase()));
  }, [brands, brandSearch]);

  // Live Filtered Products for Live Preview Studio
  const liveFilteredProducts = useMemo(() => {
    if (formSourceType === "MANUAL") {
      return allProducts.filter((p) => formManualProductIds.includes(p.id));
    }
    let prods = [...allProducts];
    if (formBrand) {
      prods = prods.filter(
        (p) =>
          p.brandId?.toLowerCase() === formBrand.toLowerCase() ||
          p.brandName?.toLowerCase() === formBrand.toLowerCase()
      );
    }
    if (formCategory) {
      prods = prods.filter(
        (p) =>
          p.categoryId?.toLowerCase() === formCategory.toLowerCase() ||
          p.categoryName?.toLowerCase() === formCategory.toLowerCase()
      );
    }
    if (formOnlyDiscounted) {
      prods = prods.filter(
        (p) =>
          (p.discountPrice !== undefined && p.discountPrice > 0) ||
          (p.discountPercentage !== undefined && p.discountPercentage > 0)
      );
    }
    if (formIsFeatured) {
      prods = prods.filter((p) => p.isFeatured || (p.rating && p.rating >= 4.5));
    }
    if (formOrderBy === "price_asc") prods.sort((a, b) => a.price - b.price);
    if (formOrderBy === "price_desc") prods.sort((a, b) => b.price - a.price);
    return prods.slice(0, formLimit || 8);
  }, [allProducts, formSourceType, formManualProductIds, formBrand, formCategory, formOnlyDiscounted, formIsFeatured, formOrderBy, formLimit]);

  // Filtered Products for Manual Picker
  const pickerFilteredProducts = useMemo(() => {
    if (!pickerSearch) return allProducts;
    return allProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        p.sku?.toLowerCase().includes(pickerSearch.toLowerCase())
    );
  }, [allProducts, pickerSearch]);

  const toggleManualProduct = (id: string) => {
    if (formManualProductIds.includes(id)) {
      setFormManualProductIds(formManualProductIds.filter((pId) => pId !== id));
    } else {
      setFormManualProductIds([...formManualProductIds, id]);
    }
  };

  const currentTypeMeta = SECTION_TYPES.find((t) => t.id === formType) || SECTION_TYPES[0];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="adm-card p-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="adm-eyebrow mb-1.5 flex items-center gap-1.5">
            <LayoutTemplate size={13} />
            <span>Storefront Dynamic Builder</span>
          </div>
          <h1 className="adm-page-title text-xl md:text-2xl text-slate-900">
            მთავარი გვერდის სექციების მართვა
          </h1>
          <p className="adm-page-desc text-xs md:text-sm text-slate-500 mt-1">
            შექმენით, შეცვალეთ და დაალაგეთ პროდუქტების კარუსელები, პასტელური ბარათები, ბადეები, ბანერები და გარანტიები 1:1 Live Preview-ით.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs transition-all shadow-xs cursor-pointer"
          >
            <Plus size={15} />
            <span>ახალი სექციის დამატება</span>
          </button>

          <button
            type="button"
            onClick={fetchSections}
            disabled={loading}
            className="adm-btn-secondary"
            title="მონაცემების განახლება"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>განახლება</span>
          </button>

          <Link href="/" target="_blank" className="adm-btn-secondary">
            <Eye size={14} />
            <span>Storefront ნახვა</span>
          </Link>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving || loading}
            className={saved ? "adm-btn-secondary" : "adm-btn-primary"}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>ინახება...</span>
              </>
            ) : saved ? (
              <>
                <Check size={14} className="text-green-600" />
                <span className="text-green-600">შენახულია ბაზაში!</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>ცვლილებების შენახვა</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Toast */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
          {errorMsg}
        </div>
      )}

      {/* Sections List */}
      <div className="adm-card p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-sm text-slate-900">აქტიური & ინდივიდუალური ვიჯეტები</h3>
            <p className="text-xs text-slate-400">
              გათიშეთ ან ჩართეთ კონკრეტული ბლოკები. გათიშული ბლოკი მყისიერად გაქრება ვიტრინიდან.
            </p>
          </div>
          <span className="text-xs text-slate-500">სულ: {sections.length} სექცია</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-xs">სექციები იტვირთება MySQL ბაზიდან...</p>
          </div>
        ) : sections.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Layers size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs">სექციები არ მოიძებნა. დააჭირეთ „ახალი სექციის დამატება“-ს.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sections.map((sec, idx) => {
              const typeMeta = SECTION_TYPES.find((t) => t.id === sec.type) || {
                id: sec.type,
                label: sec.type || "სექცია",
                icon: Layers,
                color: "#64748b",
                desc: "დინამიური ვიჯეტი",
                storefrontPosition: "ვიტრინა",
              };
              const IconComp = typeMeta.icon;

              return (
                <div
                  key={sec.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    sec.isEnabled
                      ? "bg-white border-slate-200/80 shadow-xs"
                      : "bg-slate-50/70 border-slate-200/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-mono shrink-0">
                      #{idx + 1}
                    </div>

                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${typeMeta.color}15`, color: typeMeta.color }}
                    >
                      <IconComp size={18} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs md:text-sm text-slate-900 truncate">
                          {sec.title || typeMeta.label}
                        </h4>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: `${typeMeta.color}15`, color: typeMeta.color }}
                        >
                          {typeMeta.label.split(" (")[0]}
                        </span>
                        {sec.config?.heroSlides && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                            {sec.config.heroSlides.length} სლაიდი
                          </span>
                        )}
                        {sec.config?.selectedCategoryIds && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                            {sec.config.selectedCategoryIds.length} კატეგორია
                          </span>
                        )}
                        {sec.config?.selectedBrandIds && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-100">
                            {sec.config.selectedBrandIds.length} ბრენდი
                          </span>
                        )}
                        {sec.config?.brand && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                            ბრენდი: {sec.config.brand.toUpperCase()}
                          </span>
                        )}
                        {sec.config?.categoryId && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                            კატეგორია: {sec.config.categoryId}
                          </span>
                        )}
                        {sec.config?.promoCards && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                            {sec.config.promoCards.length} პასტელური ბარათი
                          </span>
                        )}
                        {sec.config?.trustItems && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                            {sec.config.trustItems.length} გარანტია
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {sec.subtitle || typeMeta.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className={`p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all ${
                        idx === 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                      }`}
                      title="ზემოთ აწევა"
                    >
                      <MoveUp size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => moveDown(idx)}
                      disabled={idx === sections.length - 1}
                      className={`p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all ${
                        idx === sections.length - 1 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                      }`}
                      title="ქვემოთ ჩამოწევა"
                    >
                      <MoveDown size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(sec, idx)}
                      className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer"
                      title="დუბლირება"
                    >
                      <Copy size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(sec)}
                      className="p-2 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-600 transition-all cursor-pointer"
                      title="რედაქტირება & Live Preview"
                    >
                      <Settings size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSection(sec.id, sec.title || typeMeta.label)}
                      className="p-2 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 transition-all cursor-pointer"
                      title="წაშლა"
                    >
                      <Trash2 size={13} />
                    </button>

                    <div className="ml-2">
                      <CustomSwitch
                        checked={sec.isEnabled}
                        onChange={() => toggleSection(sec.id)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Advanced Section Builder Modal (Create & Edit with Universal 1:1 Live Preview) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] transition-all">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${currentTypeMeta.color}15`, color: currentTypeMeta.color }}
                >
                  <Sliders size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base text-slate-900 leading-tight">
                      {isEditMode ? `სექციის რედაქტირება: ${formTitle || currentTypeMeta.label}` : "ახალი სექციის კონსტრუქტორი"}
                    </h3>
                    <span 
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${currentTypeMeta.color}15`, color: currentTypeMeta.color }}
                    >
                      {currentTypeMeta.label.split(" (")[0]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentTypeMeta.desc}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Section Explanation Ribbon */}
            <div className="bg-blue-50/70 border-b border-blue-100 px-6 py-2.5 flex items-center justify-between text-xs text-blue-900 shrink-0">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-blue-600 shrink-0" />
                <span><strong>სად გამოჩნდება:</strong> {currentTypeMeta.storefrontPosition}</span>
              </div>
              <span className="text-[11px] text-blue-600 bg-white/80 px-2.5 py-0.5 rounded-full border border-blue-200">
                1:1 Live Preview ჩართულია
              </span>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-100 px-6 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("BASIC")}
                className={`py-3 px-4 text-xs border-b-2 transition-all cursor-pointer ${
                  activeTab === "BASIC"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                1. სექციის ტიპი & სათაური (Type & Info)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("DATA")}
                className={`py-3 px-4 text-xs border-b-2 transition-all cursor-pointer ${
                  activeTab === "DATA"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                2. მონაცემები & 1:1 Live Preview (Data & Studio)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("LAYOUT")}
                className={`py-3 px-4 text-xs border-b-2 transition-all cursor-pointer ${
                  activeTab === "LAYOUT"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                3. განლაგება & პარამეტრები (Layout)
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* TAB 1: BASIC INFO & TYPE SELECTOR */}
              {activeTab === "BASIC" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs text-slate-700 mb-2">
                      აირჩიეთ სექციის ტიპი (Widget Type)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {SECTION_TYPES.map((t) => {
                        const isSelected = formType === t.id;
                        const Icon = t.icon;
                        return (
                          <div
                            key={t.id}
                            onClick={() => setFormType(t.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                              isSelected
                                ? "border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-500"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${t.color}15`, color: t.color }}
                              >
                                <Icon size={16} />
                              </div>
                              {isSelected && (
                                <CheckCircle2 size={16} className="text-blue-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-xs text-slate-900 leading-snug">
                                {t.label.split(" (")[0]}
                              </h4>
                              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {t.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs text-slate-700 mb-1.5">
                        სექციის სათაური (Storefront Title)
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="მაგ: DJI ტექნიკა & აქსესუარები"
                        className="adm-input w-full text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-700 mb-1.5">
                        სექციის ქვესათაური (Storefront Subtitle)
                      </label>
                      <input
                        type="text"
                        value={formSubtitle}
                        onChange={(e) => setFormSubtitle(e.target.value)}
                        placeholder="მაგ: ოფიციალური გარანტია და 0% განვადება"
                        className="adm-input w-full text-xs"
                      />
                    </div>
                  </div>

                  {formType !== "HERO_BANNER" && (
                    <div>
                      <label className="block text-xs text-slate-700 mb-1.5">
                        ბეიჯის ტექსტი (Badge Tag)
                      </label>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {BADGE_PRESETS.map((b) => (
                          <button
                            key={b.text}
                            type="button"
                            onClick={() => setFormBadgeText(formBadgeText === b.text ? "" : b.text)}
                            className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                              formBadgeText === b.text
                                ? `${b.color} shadow-xs`
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {b.text}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={formBadgeText}
                        onChange={(e) => setFormBadgeText(e.target.value)}
                        placeholder="ან ჩაწერეთ საკუთარი ბეიჯი (მაგ: TOP DEAL)"
                        className="adm-input w-full text-xs"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-slate-700 mb-1.5">
                      „სრულად ნახვა“ ლინკი (View All Destination URL)
                    </label>
                    <input
                      type="text"
                      value={formTargetLink}
                      onChange={(e) => setFormTargetLink(e.target.value)}
                      placeholder="/catalog"
                      className="adm-input w-full text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: DATA SOURCE & UNIVERSAL 1:1 INTERACTIVE LIVE PREVIEW */}
              {activeTab === "DATA" && (
                <div className="space-y-6">
                  
                  {/* 1. HERO BANNER MULTI-SLIDE MANAGER & 1:1 LIVE STUDIO */}
                  {formType === "HERO_BANNER" && (
                    <div className="space-y-4">
                      {/* Top Bar: Slide Tabs & Slide Controls */}
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 gap-2 flex-wrap bg-slate-50/60 p-3 rounded-2xl">
                        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                          {formHeroSlides.map((slide, idx) => (
                            <button
                              key={slide.id || idx}
                              type="button"
                              onClick={() => setSelectedHeroSlideIndex(idx)}
                              className={`px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer ${
                                selectedHeroSlideIndex === idx
                                  ? "bg-[#111111] text-white shadow-xs"
                                  : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              <Sparkles size={12} className={selectedHeroSlideIndex === idx ? "text-[#FF5238]" : "text-slate-400"} />
                              <span className="truncate max-w-[130px] font-sans">{slide.title || `სლაიდი #${idx + 1}`}</span>
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={handleAddHeroSlide}
                            className="px-3 py-2 bg-[#FFF5F2] hover:bg-[#FFEAE5] text-[#FF5238] border border-[#FED7CC] rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                          >
                            <Plus size={13} />
                            <span>სლაიდის დამატება</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMoveHeroSlide(selectedHeroSlideIndex, "UP")}
                            disabled={selectedHeroSlideIndex === 0}
                            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs disabled:opacity-30 cursor-pointer"
                            title="ზემოთ გადატანა"
                          >
                            <MoveUp size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMoveHeroSlide(selectedHeroSlideIndex, "DOWN")}
                            disabled={selectedHeroSlideIndex === formHeroSlides.length - 1}
                            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs disabled:opacity-30 cursor-pointer"
                            title="ქვემოთ გადატანა"
                          >
                            <MoveDown size={13} />
                          </button>

                          {formHeroSlides.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveHeroSlide(selectedHeroSlideIndex)}
                              className="p-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs cursor-pointer ml-1"
                              title="მიმდინარე სლაიდის წაშლა"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Split 2-Column */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* Left: Active Slide Controls */}
                        <div className="lg:col-span-5 space-y-3.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h4 className="text-xs text-[#FF5238]">სლაიდი #{selectedHeroSlideIndex + 1}-ის რედაქტირება</h4>
                            <span className="text-[11px] text-slate-400">რეალური დროის ცვლილება</span>
                          </div>

                          <ImageUploadField
                            value={activeHeroSlide.image}
                            onChange={(url) => handleUpdateHeroSlide(selectedHeroSlideIndex, "image", url)}
                            label="დესკტოპის ფონის სურათი (Desktop Background)"
                            placeholder="https://... ან ატვირთეთ ფოტო"
                          />

                          <ImageUploadField
                            value={activeHeroSlide.mobileImage || ""}
                            onChange={(url) => handleUpdateHeroSlide(selectedHeroSlideIndex, "mobileImage", url)}
                            label="მობილურის ფონის სურათი (Mobile Background, არასავალდებულო)"
                            placeholder="https://... ან ატვირთეთ მობილურის ვერსია"
                          />

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">ბეიჯის ტექსტი (Badge)</label>
                            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                              {["სპეციალური შეთავაზება", "Next-Gen Gaming", "Apple Official", "HOT DEAL", "NEW"].map((b) => (
                                <button
                                  key={b}
                                  type="button"
                                  onClick={() => handleUpdateHeroSlide(selectedHeroSlideIndex, "badge", b)}
                                  className={`px-2 py-0.5 rounded-full text-[10px] transition-all cursor-pointer ${
                                    activeHeroSlide.badge === b
                                      ? "bg-[#FF5238] text-white shadow-2xs"
                                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                  }`}
                                >
                                  {b}
                                </button>
                              ))}
                            </div>
                            <input
                              type="text"
                              value={activeHeroSlide.badge || ""}
                              onChange={(e) => handleUpdateHeroSlide(selectedHeroSlideIndex, "badge", e.target.value)}
                              placeholder="სპეციალური შეთავაზება"
                              className="adm-input w-full text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">დიდი სათაური (Main Title)</label>
                            <input
                              type="text"
                              value={activeHeroSlide.title}
                              onChange={(e) => handleUpdateHeroSlide(selectedHeroSlideIndex, "title", e.target.value)}
                              placeholder="იპოვე იდეალური საჩუქარი ყველასთვის"
                              className="adm-input w-full text-xs font-sans"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">ქვესათაური (Subtitle Description)</label>
                            <textarea
                              rows={2}
                              value={activeHeroSlide.subtitle || ""}
                              onChange={(e) => handleUpdateHeroSlide(selectedHeroSlideIndex, "subtitle", e.target.value)}
                              placeholder="შეარჩიე, შეფუთე, გაუგზავნე საჩუქარი მარტივად Spilo-თი"
                              className="adm-input w-full text-xs resize-none font-sans"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] text-slate-600 mb-1">ღილაკის ტექსტი</label>
                              <input
                                type="text"
                                value={activeHeroSlide.buttonText || ""}
                                onChange={(e) => handleUpdateHeroSlide(selectedHeroSlideIndex, "buttonText", e.target.value)}
                                placeholder="შეარჩიე საჩუქარი"
                                className="adm-input w-full text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-600 mb-1">გადასასვლელი ლინკი</label>
                              <input
                                type="text"
                                value={activeHeroSlide.link || ""}
                                onChange={(e) => handleUpdateHeroSlide(selectedHeroSlideIndex, "link", e.target.value)}
                                placeholder="/catalog"
                                className="adm-input w-full text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Right: 1:1 Triple Showcase Carousel Live Preview */}
                        <div className="lg:col-span-7 space-y-3">
                          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Eye size={14} className="text-[#FF5238]" />
                                <h4 className="text-xs text-slate-900">Triple Showcase კარუსელის 1:1 Live Preview (სლაიდი #{selectedHeroSlideIndex + 1})</h4>
                              </div>
                              <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                                მყისიერად აისახება
                              </span>
                            </div>

                            {/* 1:1 Triple Showcase Stage Preview */}
                            <div className="relative flex items-center justify-center gap-2 select-none overflow-hidden py-1">
                              
                              {/* Left Preview Snippet */}
                              {formHeroSlides.length > 1 && (
                                <div
                                  onClick={() => setSelectedHeroSlideIndex(prevHeroSlideIndex)}
                                  className="w-[70px] sm:w-[90px] h-[260px] rounded-2xl overflow-hidden relative opacity-60 hover:opacity-100 transition-all cursor-pointer shrink-0 bg-[#111111]"
                                >
                                  <img
                                    src={prevHeroSlide.image || "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&q=80"}
                                    alt={prevHeroSlide.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                                  <div className="absolute bottom-2 left-2 right-2 text-white text-[9px] truncate">
                                    {prevHeroSlide.title}
                                  </div>
                                </div>
                              )}

                              {/* Center Active Spotlight Card */}
                              <div className="flex-1 h-[260px] rounded-[24px] overflow-hidden relative shadow-lg bg-[#111111] group">
                                <img
                                  src={activeHeroSlide.image || "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1400&q=80"}
                                  alt={activeHeroSlide.title}
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                                {/* Foreground Content */}
                                <div className="relative z-10 h-full flex flex-col justify-between p-4 sm:p-5 text-white">
                                  
                                  {/* Top Row: Badge & Slide Index */}
                                  <div className="flex items-center justify-between">
                                    <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md border border-white/25 px-2.5 py-0.5 rounded-full text-[10px] text-white">
                                      <Sparkles className="w-3 h-3 text-[#FF5238]" />
                                      <span>{activeHeroSlide.badge || "სპეციალური შეთავაზება"}</span>
                                    </div>
                                    <div className="text-[10px] text-white/80 font-mono bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                                      0{selectedHeroSlideIndex + 1} / 0{formHeroSlides.length}
                                    </div>
                                  </div>

                                  {/* Center: Title & Subtitle */}
                                  <div className="space-y-1.5 my-auto max-w-[280px]">
                                    <h3 className="text-base sm:text-lg text-white leading-tight font-sans line-clamp-2">
                                      {activeHeroSlide.title || "იპოვე იდეალური საჩუქარი ყველასთვის"}
                                    </h3>
                                    <p className="text-white/80 text-[11px] leading-snug line-clamp-2 font-sans">
                                      {activeHeroSlide.subtitle || "შეარჩიე, შეფუთე, გაუგზავნე საჩუქარი მარტივად Spilo-თი"}
                                    </p>
                                    <div className="pt-1">
                                      <span className="inline-flex items-center gap-1 bg-[#FF5238] text-white px-3.5 py-1.5 rounded-xl text-[11px] shadow-sm">
                                        <span>{activeHeroSlide.buttonText || "შეარჩიე საჩუქარი"}</span>
                                        <ArrowRight className="w-3 h-3" />
                                      </span>
                                    </div>
                                  </div>

                                  {/* Bottom Progress Bars */}
                                  {formHeroSlides.length > 1 && (
                                    <div className="flex items-center gap-1.5 pt-1">
                                      {formHeroSlides.map((_, dotIdx) => (
                                        <button
                                          key={dotIdx}
                                          type="button"
                                          onClick={() => setSelectedHeroSlideIndex(dotIdx)}
                                          className={`h-1 rounded-full transition-all cursor-pointer ${
                                            dotIdx === selectedHeroSlideIndex ? "w-6 bg-[#FF5238]" : "w-2 bg-white/40"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  )}

                                </div>
                              </div>

                              {/* Right Preview Snippet */}
                              {formHeroSlides.length > 1 && (
                                <div
                                  onClick={() => setSelectedHeroSlideIndex(nextHeroSlideIndex)}
                                  className="w-[70px] sm:w-[90px] h-[260px] rounded-2xl overflow-hidden relative opacity-60 hover:opacity-100 transition-all cursor-pointer shrink-0 bg-[#111111]"
                                >
                                  <img
                                    src={nextHeroSlide.image || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80"}
                                    alt={nextHeroSlide.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                                  <div className="absolute bottom-2 left-2 right-2 text-white text-[9px] truncate">
                                    {nextHeroSlide.title}
                                  </div>
                                </div>
                              )}

                            </div>

                            {/* Slide Switcher Ribbon */}
                            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs">
                              <span className="text-slate-600">სულ სლაიდერი მოიცავს {formHeroSlides.length} სლაიდს</span>
                              <div className="flex items-center gap-1">
                                {formHeroSlides.map((_, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setSelectedHeroSlideIndex(i)}
                                    className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-all ${
                                      selectedHeroSlideIndex === i ? "bg-[#FF5238] text-white shadow-2xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                  >
                                    #{i + 1}
                                  </button>
                                ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* 2. PROMO CAROUSEL / PASTEL CARDS LIVE STUDIO */}
                  {(formType === "PROMO_CAROUSEL" || formType === "PROMO_CARDS" || formType === "PASTEL_PROMO_CARDS") && (
                    <div className="space-y-4">
                      {/* Top Bar: Card Selection Tabs & Actions */}
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 gap-2 flex-wrap bg-slate-50/60 p-3 rounded-2xl">
                        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                          {formPromoCards.map((c, idx) => (
                            <button
                              key={c.id || idx}
                              type="button"
                              onClick={() => setSelectedPromoCardIndex(idx)}
                              className={`px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer ${
                                selectedPromoCardIndex === idx
                                  ? "bg-slate-900 text-white shadow-xs"
                                  : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              <div
                                className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: c.bgColor || "#FFC5E3" }}
                              />
                              <span className="truncate max-w-[120px]">{c.title || `ბარათი #${idx + 1}`}</span>
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={handleAddPromoCard}
                            className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Plus size={13} />
                            <span>ბარათის დამატება</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMovePromoCard(selectedPromoCardIndex, "UP")}
                            disabled={selectedPromoCardIndex === 0}
                            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs disabled:opacity-30 cursor-pointer"
                            title="ზემოთ გადატანა"
                          >
                            <MoveUp size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMovePromoCard(selectedPromoCardIndex, "DOWN")}
                            disabled={selectedPromoCardIndex === formPromoCards.length - 1}
                            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs disabled:opacity-30 cursor-pointer"
                            title="ქვემოთ გადატანა"
                          >
                            <MoveDown size={13} />
                          </button>

                          {formPromoCards.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePromoCard(selectedPromoCardIndex)}
                              className="p-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs cursor-pointer ml-1"
                              title="მიმდინარე ბარათის წაშლა"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Split 2-Column */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* Left: Active Card Controls */}
                        <div className="lg:col-span-6 space-y-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs text-blue-600">
                              ბარათი #{selectedPromoCardIndex + 1}-ის რედაქტირება
                            </span>
                            <span className="text-[11px] text-slate-400">რეალური დროის ცვლილება</span>
                          </div>

                          {/* Background Pastel Presets */}
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1.5">
                              ბარათის ფონი (Pastel Background Color)
                            </label>
                            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                              {PASTEL_COLOR_PRESETS.map((p) => {
                                const isSelected = (activePromoCard.bgColor || "#FFC5E3").toLowerCase() === p.color.toLowerCase();
                                return (
                                  <button
                                    key={p.color}
                                    type="button"
                                    onClick={() => handleUpdatePromoCard(selectedPromoCardIndex, "bgColor", p.color)}
                                    className={`px-2 py-1.5 rounded-xl text-[10px] flex items-center gap-1.5 border transition-all cursor-pointer ${
                                      isSelected
                                        ? "ring-2 ring-blue-600 border-transparent shadow-xs bg-slate-50"
                                        : "border-slate-200 hover:border-slate-300 bg-white"
                                    }`}
                                  >
                                    <div
                                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                                      style={{ backgroundColor: p.color }}
                                    />
                                    <span className="truncate text-slate-700">{p.name.split(" (")[0]}</span>
                                  </button>
                                );
                              })}
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={activePromoCard.bgColor || "#FFC5E3"}
                                onChange={(e) => handleUpdatePromoCard(selectedPromoCardIndex, "bgColor", e.target.value)}
                                className="w-8 h-8 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white shrink-0"
                              />
                              <input
                                type="text"
                                value={activePromoCard.bgColor || "#FFC5E3"}
                                onChange={(e) => handleUpdatePromoCard(selectedPromoCardIndex, "bgColor", e.target.value)}
                                placeholder="#FFC5E3"
                                className="adm-input w-full text-xs font-mono"
                              />
                            </div>
                          </div>

                          {/* Title & Badge */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[11px] text-slate-600 mb-1">სათაური (Title)</label>
                              <input
                                type="text"
                                value={activePromoCard.title}
                                onChange={(e) => handleUpdatePromoCard(selectedPromoCardIndex, "title", e.target.value)}
                                placeholder="მაგ: ტანსაცმელი & ფეხსაცმელი"
                                className="adm-input w-full text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-600 mb-1">ბეიჯის ტექსტი (Badge)</label>
                              <input
                                type="text"
                                value={activePromoCard.badge || ""}
                                onChange={(e) => handleUpdatePromoCard(selectedPromoCardIndex, "badge", e.target.value)}
                                placeholder="მაგ: 40%-მდე"
                                className="adm-input w-full text-xs"
                              />
                            </div>
                          </div>

                          <ImageUploadField
                            value={activePromoCard.bgImageUrl || ""}
                            onChange={(url) => handleUpdatePromoCard(selectedPromoCardIndex, "bgImageUrl", url)}
                            label="გამჭვირვალე PNG ფოტოს ატვირთვა / ბმული"
                            placeholder="https://... ან ატვირთეთ გამჭვირვალე PNG"
                          />

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">გადასასვლელი ლინკი (Link)</label>
                            <input
                              type="text"
                              value={activePromoCard.link || "/catalog"}
                              onChange={(e) => handleUpdatePromoCard(selectedPromoCardIndex, "link", e.target.value)}
                              placeholder="/catalog?category=clothing"
                              className="adm-input w-full text-xs font-mono"
                            />
                          </div>
                        </div>

                        {/* Right: 1:1 Live Preview Studio */}
                        <div className="lg:col-span-6 space-y-4">
                          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Eye size={14} className="text-blue-600" />
                                <h4 className="text-xs text-slate-900">ლაივ გადახედვა (1:1 Live Preview)</h4>
                              </div>
                              <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                                მყისიერად აისახება
                              </span>
                            </div>

                            <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs">
                              <PastelPromoCard card={activePromoCard} asLink={false} />
                            </div>
                            
                            <p className="text-[10px] text-slate-400 text-center">
                              ბარათი ზუსტად ამ ვიზუალით გამოჩნდება მომხმარებლის ეკრანზე.
                            </p>
                          </div>

                          {/* All Cards in Section Preview */}
                          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 space-y-2.5">
                            <h4 className="text-xs text-slate-900">სრული სექციის გადახედვა ({formPromoCards.length} ბარათი)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1">
                              {formPromoCards.map((c, i) => (
                                <div
                                  key={c.id || i}
                                  onClick={() => setSelectedPromoCardIndex(i)}
                                  className={`cursor-pointer transition-all ${
                                    selectedPromoCardIndex === i ? "ring-2 ring-blue-500 rounded-[24px]" : "opacity-80 hover:opacity-100"
                                  }`}
                                >
                                  <PastelPromoCard card={c} asLink={false} />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. PRODUCT CAROUSEL & PRODUCT GRID LIVE STUDIO */}
                  {(formType === "PRODUCT_CAROUSEL" || formType === "PRODUCT_GRID") && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Left: Filter Controls */}
                      <div className="lg:col-span-5 space-y-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h4 className="text-xs text-blue-600">პროდუქტების ფილტრაცია</h4>
                          <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px]">
                            <button
                              type="button"
                              onClick={() => setFormSourceType("AUTOMATIC")}
                              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                                formSourceType === "AUTOMATIC" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                              }`}
                            >
                              ავტომატური
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormSourceType("MANUAL")}
                              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                                formSourceType === "MANUAL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                              }`}
                            >
                              ხელით
                            </button>
                          </div>
                        </div>

                        {formSourceType === "AUTOMATIC" ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[11px] text-slate-600 mb-1">ბრენდის ფილტრი</label>
                              <CustomSelect
                                value={formBrand}
                                onChange={setFormBrand}
                                options={[
                                  { value: "", label: "ყველა ბრენდი" },
                                  ...brands.map((b) => ({ value: b.slug || b.id, label: b.name })),
                                ]}
                                placeholder="ყველა ბრენდი"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-600 mb-1">კატეგორიის ფილტრი</label>
                              <CustomSelect
                                value={formCategory}
                                onChange={setFormCategory}
                                options={[
                                  { value: "", label: "ყველა კატეგორია" },
                                  ...categories.map((c) => ({ value: c.slug || c.id, label: c.name })),
                                ]}
                                placeholder="ყველა კატეგორია"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-600 mb-1">დალაგება</label>
                              <CustomSelect
                                value={formOrderBy}
                                onChange={setFormOrderBy}
                                options={[
                                  { value: "createdAt_desc", label: "უახლესი (Newest First)" },
                                  { value: "price_asc", label: "ფასი: დაბლიდან მაღლა" },
                                  { value: "price_desc", label: "ფასი: მაღლიდან დაბლა" },
                                ]}
                                searchable={false}
                              />
                            </div>

                            <div className="flex items-center gap-4 pt-1">
                              <CustomSwitch
                                checked={formOnlyDiscounted}
                                onChange={setFormOnlyDiscounted}
                                label="ფასდაკლებული"
                              />
                              <CustomSwitch
                                checked={formIsFeatured}
                                onChange={setFormIsFeatured}
                                label="რჩეული"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-600 mb-1">ლიმიტი: {formLimit} პროდუქტი</label>
                              <div className="flex items-center gap-1.5">
                                {[4, 8, 12, 16].map((lim) => (
                                  <button
                                    key={lim}
                                    type="button"
                                    onClick={() => setFormLimit(lim)}
                                    className={`px-3 py-1 rounded-xl text-xs cursor-pointer ${
                                      formLimit === lim ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {lim}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <button
                              type="button"
                              onClick={() => setIsProductPickerOpen(true)}
                              className="w-full py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Plus size={14} />
                              <span>პროდუქტების არჩევა კატალოგიდან ({formManualProductIds.length})</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Right: Real Products 1:1 Live Preview */}
                      <div className="lg:col-span-7 space-y-3">
                        <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Eye size={14} className="text-blue-600" />
                              <h4 className="text-xs text-slate-900">
                                {formType === "PRODUCT_CAROUSEL" ? "პროდუქტების კარუსელის" : "პროდუქტების ბადის"} 1:1 Live Preview
                              </h4>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              მოიძებნა: {liveFilteredProducts.length} პროდუქტი
                            </span>
                          </div>

                          {liveFilteredProducts.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 text-xs">
                              ამ ფილტრით პროდუქტები ვერ მოიძებნა. შეცვალეთ კატეგორია ან ბრენდი.
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1 bg-white rounded-2xl border border-slate-100">
                              {liveFilteredProducts.map((prod) => (
                                <div
                                  key={prod.id}
                                  className="p-2.5 bg-white rounded-xl border border-slate-100 hover:shadow-xs transition-all flex flex-col justify-between"
                                >
                                  <div>
                                    <img
                                      src={prod.image || (prod.images && prod.images[0]) || "/placeholder.png"}
                                      alt={prod.title}
                                      className="w-full h-24 object-contain rounded-lg mb-2 bg-slate-50 p-1"
                                    />
                                    <h5 className="text-[11px] text-slate-900 line-clamp-1">{prod.title}</h5>
                                    <span className="text-[10px] text-slate-400">{prod.brandName || "ბრენდი"}</span>
                                  </div>
                                  <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-xs text-blue-600">₾{prod.price}</span>
                                    {prod.discountPrice && (
                                      <span className="text-[10px] text-emerald-600">-{prod.discountPercentage || 20}%</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. TRUST STRIP FULL ITEM-LEVEL EDITING & 1:1 LIVE STUDIO */}
                  {formType === "TRUST_STRIP" && (
                    <div className="space-y-4">
                      {/* Top Bar: Item Tabs & Add Button */}
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 gap-2 flex-wrap bg-slate-50/60 p-3 rounded-2xl">
                        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                          {formTrustItems.map((item, idx) => (
                            <button
                              key={item.id || idx}
                              type="button"
                              onClick={() => setSelectedTrustItemIndex(idx)}
                              className={`px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer ${
                                selectedTrustItemIndex === idx
                                  ? "bg-slate-900 text-white shadow-xs"
                                  : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: item.iconColor || "#2563eb" }}
                              />
                              <span className="truncate max-w-[120px]">{item.title || `სერვისი #${idx + 1}`}</span>
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={handleAddTrustItem}
                            className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Plus size={13} />
                            <span>ელემენტის დამატება</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMoveTrustItem(selectedTrustItemIndex, "UP")}
                            disabled={selectedTrustItemIndex === 0}
                            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs disabled:opacity-30 cursor-pointer"
                            title="ზემოთ გადატანა"
                          >
                            <MoveUp size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMoveTrustItem(selectedTrustItemIndex, "DOWN")}
                            disabled={selectedTrustItemIndex === formTrustItems.length - 1}
                            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs disabled:opacity-30 cursor-pointer"
                            title="ქვემოთ გადატანა"
                          >
                            <MoveDown size={13} />
                          </button>

                          {formTrustItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTrustItem(selectedTrustItemIndex)}
                              className="p-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs cursor-pointer ml-1"
                              title="მიმდინარე ელემენტის წაშლა"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Split 2-Column */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* Left: Active Item Controls */}
                        <div className="lg:col-span-6 space-y-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs text-blue-600">
                              ელემენტი #{selectedTrustItemIndex + 1}-ის რედაქტირება
                            </span>
                            <span className="text-[11px] text-slate-400">რეალური დროის ცვლილება</span>
                          </div>

                          {/* Lucide Icon Picker Grid */}
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1.5">
                              აიკონის არჩევა (Lucide Icon)
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                              {TRUST_ICON_OPTIONS.map((opt) => {
                                const IconComp = opt.icon;
                                const isSelected = activeTrustItem.icon === opt.id;
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleUpdateTrustItem(selectedTrustItemIndex, "icon", opt.id)}
                                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                                      isSelected
                                        ? "ring-2 ring-blue-600 border-transparent bg-blue-50/50 text-blue-600 shadow-xs"
                                        : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                                    }`}
                                  >
                                    <IconComp className="w-5 h-5" />
                                    <span className="text-[10px] line-clamp-1">{opt.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Icon Color Presets & Hex Picker */}
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1.5">
                              აიკონის ფერი (Icon Color)
                            </label>
                            <div className="flex items-center gap-1.5 flex-wrap mb-2">
                              {TRUST_COLOR_PRESETS.map((p) => {
                                const isSelected = (activeTrustItem.iconColor || "#2563eb").toLowerCase() === p.color.toLowerCase();
                                return (
                                  <button
                                    key={p.color}
                                    type="button"
                                    onClick={() => handleUpdateTrustItem(selectedTrustItemIndex, "iconColor", p.color)}
                                    className={`px-2.5 py-1 rounded-xl text-[10px] flex items-center gap-1.5 border transition-all cursor-pointer ${
                                      isSelected
                                        ? "ring-2 ring-blue-600 border-transparent shadow-xs bg-slate-50"
                                        : "border-slate-200 hover:border-slate-300 bg-white"
                                    }`}
                                  >
                                    <div
                                      className="w-3 h-3 rounded-full shrink-0"
                                      style={{ backgroundColor: p.color }}
                                    />
                                    <span className="text-slate-700">{p.name.split(" (")[0]}</span>
                                  </button>
                                );
                              })}
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={activeTrustItem.iconColor || "#2563eb"}
                                onChange={(e) => handleUpdateTrustItem(selectedTrustItemIndex, "iconColor", e.target.value)}
                                className="w-8 h-8 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white shrink-0"
                              />
                              <input
                                type="text"
                                value={activeTrustItem.iconColor || "#2563eb"}
                                onChange={(e) => handleUpdateTrustItem(selectedTrustItemIndex, "iconColor", e.target.value)}
                                placeholder="#2563eb"
                                className="adm-input w-full text-xs font-mono"
                              />
                            </div>
                          </div>

                          {/* Title & Subtitle */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[11px] text-slate-600 mb-1">სათაური (Title)</label>
                              <input
                                type="text"
                                value={activeTrustItem.title}
                                onChange={(e) => handleUpdateTrustItem(selectedTrustItemIndex, "title", e.target.value)}
                                placeholder="მაგ: სწრაფი მიწოდება"
                                className="adm-input w-full text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-600 mb-1">ქვესათაური (Subtitle)</label>
                              <input
                                type="text"
                                value={activeTrustItem.subtitle || ""}
                                onChange={(e) => handleUpdateTrustItem(selectedTrustItemIndex, "subtitle", e.target.value)}
                                placeholder="მაგ: უფასოდ მთელ საქართველოში"
                                className="adm-input w-full text-xs"
                              />
                            </div>
                          </div>

                          {/* Link */}
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1">გადასასვლელი ლინკი (Link)</label>
                            <input
                              type="text"
                              value={activeTrustItem.link || ""}
                              onChange={(e) => handleUpdateTrustItem(selectedTrustItemIndex, "link", e.target.value)}
                              placeholder="/page/delivery"
                              className="adm-input w-full text-xs font-mono"
                            />
                          </div>
                        </div>

                        {/* Right: 1:1 Live Preview Studio */}
                        <div className="lg:col-span-6 space-y-3">
                          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Eye size={14} className="text-blue-600" />
                                <h4 className="text-xs text-slate-900">სანდოობის ზოლის 1:1 Live Preview</h4>
                              </div>
                              <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                                მყისიერად აისახება
                              </span>
                            </div>

                            {/* Live Interactive TrustStripSection Render */}
                            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
                              <TrustStripSection 
                                title={formTitle}
                                subtitle={formSubtitle}
                                trustItems={formTrustItems}
                              />
                            </div>

                            <p className="text-[10px] text-slate-400 text-center">
                              სანდოობის ზოლი ზუსტად ამ ელემენტებით, აიკონებითა და ბმულებით გამოჩნდება საიტზე.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. PROMO BANNER GRID LIVE STUDIO */}
                  {formType === "PROMO_BANNER_GRID" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs text-slate-900">სარეკლამო ბანერების სია</h4>
                          <p className="text-[11px] text-slate-500">დაამატეთ 1-დან 3-მდე სარეკლამო ბანერი</p>
                        </div>
                        {formBanners.length < 3 && (
                          <button
                            type="button"
                            onClick={handleAddBanner}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Plus size={13} />
                            <span>ბანერის დამატება</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        <div className="lg:col-span-6 space-y-3">
                          {formBanners.map((banner, bIdx) => (
                            <div key={bIdx} className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-blue-600">ბანერი #{bIdx + 1}</span>
                                {formBanners.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveBanner(bIdx)}
                                    className="text-red-500 hover:text-red-700 text-xs p-1 cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                              <ImageUploadField
                                value={banner.bannerUrl}
                                onChange={(url) => handleUpdateBanner(bIdx, "bannerUrl", url)}
                                label="სურათი / ფაილი"
                                placeholder="https://..."
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={banner.title}
                                  onChange={(e) => handleUpdateBanner(bIdx, "title", e.target.value)}
                                  placeholder="სათაური"
                                  className="adm-input w-full text-xs"
                                />
                                <input
                                  type="text"
                                  value={banner.tagText}
                                  onChange={(e) => handleUpdateBanner(bIdx, "tagText", e.target.value)}
                                  placeholder="თეგი (HOT)"
                                  className="adm-input w-full text-xs"
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Live Preview */}
                        <div className="lg:col-span-6">
                          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 space-y-3">
                            <h4 className="text-xs text-slate-900">ბანერების 1:1 Live Preview</h4>
                            <div className="space-y-2.5">
                              {formBanners.map((b, i) => (
                                <div
                                  key={i}
                                  className="relative rounded-2xl overflow-hidden h-28 flex items-center p-4 bg-gradient-to-r from-gray-950 to-black text-white shadow-xs"
                                >
                                  <img
                                    src={b.bannerUrl || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80"}
                                    alt={b.title}
                                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                                  />
                                  <div className="relative z-10 space-y-1">
                                    <span className="text-[9px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30">
                                      {b.tagText || "აქცია"}
                                    </span>
                                    <h5 className="text-xs">{b.title || "სპეციალური შეთავაზება"}</h5>
                                    <span className="text-[10px] bg-white text-black px-2.5 py-1 rounded-lg inline-block mt-1">
                                      {b.buttonText || "ყიდვა"}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 6. FULL BANNER LIVE STUDIO */}
                  {formType === "BANNER" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      <div className="lg:col-span-5 space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                        <ImageUploadField
                          value={formBanners[0]?.bannerUrl || ""}
                          onChange={(url) => handleUpdateBanner(0, "bannerUrl", url)}
                          label="სრული ბანერის სურათი"
                          placeholder="https://..."
                        />
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">სათაური</label>
                          <input
                            type="text"
                            value={formBanners[0]?.title || ""}
                            onChange={(e) => handleUpdateBanner(0, "title", e.target.value)}
                            placeholder="მაგ: Apple iPhone 16 Pro"
                            className="adm-input w-full text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">ქვესათაური</label>
                          <input
                            type="text"
                            value={formBanners[0]?.subtitle || ""}
                            onChange={(e) => handleUpdateBanner(0, "subtitle", e.target.value)}
                            placeholder="ექსკლუზიური შეთავაზება"
                            className="adm-input w-full text-xs"
                          />
                        </div>
                      </div>

                      <div className="lg:col-span-7">
                        <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 space-y-3">
                          <h4 className="text-xs text-slate-900">სრული ბანერის 1:1 Live Preview</h4>
                          <div className="relative rounded-2xl overflow-hidden h-40 flex items-center p-6 bg-gradient-to-r from-gray-950 via-slate-900 to-black text-white shadow-sm">
                            <img
                              src={formBanners[0]?.bannerUrl || "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1400&q=80"}
                              alt="Banner"
                              className="absolute inset-0 w-full h-full object-cover opacity-40"
                            />
                            <div className="relative z-10 space-y-2">
                              <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30">
                                {formBanners[0]?.tagText || "სპეციალური შეთავაზება"}
                              </span>
                              <h3 className="text-lg">{formBanners[0]?.title || "Apple-ის სამყარო"}</h3>
                              <p className="text-xs text-gray-300">{formBanners[0]?.subtitle || "აღმოაჩინე ინოვაციები"}</p>
                              <span className="bg-white text-black px-4 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 mt-1">
                                <span>{formBanners[0]?.buttonText || "ნახვა"}</span>
                                <ArrowRight size={12} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 7. CATEGORY GRID DYNAMIC SELECTOR & 1:1 LIVE STUDIO */}
                  {(formType === "CATEGORY_GRID" || formType === "CATEGORY_CIRCLE_LIST") && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Left: Category Controls */}
                      <div className="lg:col-span-5 space-y-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h4 className="text-xs text-blue-600">კატეგორიების არჩევა</h4>
                          <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px]">
                            <button
                              type="button"
                              onClick={() => setFormCategoryMode("ALL")}
                              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                                formCategoryMode === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                              }`}
                            >
                              ყველა ბაზიდან
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormCategoryMode("MANUAL")}
                              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                                formCategoryMode === "MANUAL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                              }`}
                            >
                              ხელით შერჩევა
                            </button>
                          </div>
                        </div>

                        {formCategoryMode === "ALL" ? (
                          <div className="space-y-3">
                            <p className="text-xs text-slate-500">
                              სისტემა ავტომატურად გამოიტანს ტოპ კატეგორიებს MySQL ბაზიდან.
                            </p>
                            <div>
                              <label className="block text-[11px] text-slate-600 mb-1">
                                კატეგორიების ლიმიტი: {formCategoryLimit}
                              </label>
                              <div className="flex items-center gap-1.5">
                                {[4, 8, 12, 16, 24].map((lim) => (
                                  <button
                                    key={lim}
                                    type="button"
                                    onClick={() => setFormCategoryLimit(lim)}
                                    className={`px-3 py-1 rounded-xl text-xs cursor-pointer ${
                                      formCategoryLimit === lim ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {lim}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-slate-500">
                                არჩეულია: {formSelectedCategoryIds.length} კატეგორია
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setFormSelectedCategoryIds(categories.map((c) => c.id))}
                                  className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                                >
                                  ყველას მონიშვნა
                                </button>
                                <span className="text-slate-300">•</span>
                                <button
                                  type="button"
                                  onClick={() => setFormSelectedCategoryIds([])}
                                  className="text-[10px] text-slate-400 hover:underline cursor-pointer"
                                >
                                  გასუფთავება
                                </button>
                              </div>
                            </div>

                            <div className="relative flex items-center">
                              <Search size={13} className="absolute left-2.5 text-slate-400" />
                              <input
                                type="text"
                                value={categorySearch}
                                onChange={(e) => setCategorySearch(e.target.value)}
                                placeholder="მოძებნეთ კატეგორია..."
                                className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                              />
                            </div>

                            <div className="max-h-64 overflow-y-auto space-y-1 divide-y divide-slate-50 p-1 border border-slate-100 rounded-xl bg-slate-50/50">
                              {searchFilteredCategories.map((cat) => {
                                const isSelected = formSelectedCategoryIds.includes(cat.id) || formSelectedCategoryIds.includes(cat.slug);
                                const IconComp = (cat.icon && CATEGORY_ICON_MAP[cat.icon]) ? CATEGORY_ICON_MAP[cat.icon] : Sparkles;
                                return (
                                  <div
                                    key={cat.id}
                                    onClick={() => toggleCategorySelection(cat.id)}
                                    className={`p-2 rounded-xl flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                                      isSelected ? "bg-purple-50 text-purple-900" : "hover:bg-white text-slate-700"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-purple-600 shadow-2xs shrink-0">
                                        <IconComp size={14} />
                                      </div>
                                      <span className="text-xs truncate">{cat.name}</span>
                                    </div>
                                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                                      isSelected ? "bg-purple-600 border-purple-600 text-white" : "border-slate-300 bg-white"
                                    }`}>
                                      {isSelected && <Check size={11} />}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: 1:1 Category Live Preview */}
                      <div className="lg:col-span-7 space-y-3">
                        <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Eye size={14} className="text-blue-600" />
                              <h4 className="text-xs text-slate-900">კატეგორიების 1:1 Live Preview</h4>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              ნაჩვენებია: {liveFilteredCategories.length} კატეგორია
                            </span>
                          </div>

                          {liveFilteredCategories.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 text-xs">
                              არჩეული კატეგორიები არ არის. მონიშნეთ მარცხენა სიიდან.
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-2xl border border-slate-100 max-h-72 overflow-y-auto">
                              {liveFilteredCategories.map((cat) => {
                                const IconComp = (cat.icon && CATEGORY_ICON_MAP[cat.icon]) ? CATEGORY_ICON_MAP[cat.icon] : Sparkles;
                                return (
                                  <div
                                    key={cat.id}
                                    className="p-3 bg-[#F8FAFC] rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center gap-2 h-24 shadow-2xs hover:bg-white transition-all"
                                  >
                                    <div className="w-8 h-8 rounded-xl bg-white text-purple-600 flex items-center justify-center shadow-2xs">
                                      <IconComp size={16} />
                                    </div>
                                    <span className="text-xs text-slate-800 truncate w-full px-1">
                                      {cat.name}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          <p className="text-[10px] text-slate-400 text-center">
                            კატეგორიების ვიტრინა ზუსტად ამ თანმიმდევრობით გამოჩნდება საიტზე.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 8. BRAND GRID DYNAMIC SELECTOR & 1:1 LIVE STUDIO */}
                  {(formType === "BRAND_GRID" || formType === "BRAND_MARQUEE") && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Left: Brand Controls */}
                      <div className="lg:col-span-5 space-y-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h4 className="text-xs text-blue-600">ბრენდების არჩევა</h4>
                          <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px]">
                            <button
                              type="button"
                              onClick={() => setFormBrandMode("ALL")}
                              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                                formBrandMode === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                              }`}
                            >
                              ყველა ტოპ ბრენდი
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormBrandMode("MANUAL")}
                              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                                formBrandMode === "MANUAL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                              }`}
                            >
                              ხელით შერჩევა
                            </button>
                          </div>
                        </div>

                        {formBrandMode === "ALL" ? (
                          <div className="space-y-3">
                            <p className="text-xs text-slate-500">
                              სისტემა ავტომატურად გამოიტანს წამყვან ოფიციალურ პარტნიორ ბრენდებს.
                            </p>
                            <div>
                              <label className="block text-[11px] text-slate-600 mb-1">
                                ბრენდების ლიმიტი: {formBrandLimit}
                              </label>
                              <div className="flex items-center gap-1.5">
                                {[6, 12, 16, 24].map((lim) => (
                                  <button
                                    key={lim}
                                    type="button"
                                    onClick={() => setFormBrandLimit(lim)}
                                    className={`px-3 py-1 rounded-xl text-xs cursor-pointer ${
                                      formBrandLimit === lim ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {lim}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-slate-500">
                                არჩეულია: {formSelectedBrandIds.length} ბრენდი
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setFormSelectedBrandIds(brands.map((b) => b.id))}
                                  className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                                >
                                  ყველა
                                </button>
                                <span className="text-slate-300">•</span>
                                <button
                                  type="button"
                                  onClick={() => setFormSelectedBrandIds([])}
                                  className="text-[10px] text-slate-400 hover:underline cursor-pointer"
                                >
                                  გასუფთავება
                                </button>
                              </div>
                            </div>

                            <div className="relative flex items-center">
                              <Search size={13} className="absolute left-2.5 text-slate-400" />
                              <input
                                type="text"
                                value={brandSearch}
                                onChange={(e) => setBrandSearch(e.target.value)}
                                placeholder="მოძებნეთ ბრენდი (Apple, DJI, Samsung...)"
                                className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                              />
                            </div>

                            <div className="max-h-56 overflow-y-auto space-y-1 divide-y divide-slate-50 p-1 border border-slate-100 rounded-xl bg-slate-50/50">
                              {searchFilteredBrands.map((brand) => {
                                const isSelected = formSelectedBrandIds.includes(brand.id) || formSelectedBrandIds.includes(brand.slug);
                                return (
                                  <div
                                    key={brand.id}
                                    onClick={() => toggleBrandSelection(brand.id)}
                                    className={`p-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all ${
                                      isSelected ? "bg-teal-50 text-teal-900" : "hover:bg-white text-slate-700"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      {brand.logo ? (
                                        <img src={brand.logo} alt={brand.name} className="w-5 h-5 object-contain shrink-0" />
                                      ) : (
                                        <Flame size={14} className="text-teal-600 shrink-0" />
                                      )}
                                      <span className="text-xs truncate">{brand.name}</span>
                                    </div>
                                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                                      isSelected ? "bg-teal-600 border-teal-600 text-white" : "border-slate-300 bg-white"
                                    }`}>
                                      {isSelected && <Check size={11} />}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Reorder Active Brands */}
                            {formSelectedBrandIds.length > 1 && (
                              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                                <span className="text-[11px] text-slate-500">ბრენდების რიგითობა (Reorder):</span>
                                <div className="max-h-28 overflow-y-auto space-y-1">
                                  {formSelectedBrandIds.map((bId, bIdx) => {
                                    const bObj = brands.find((x) => x.id === bId || x.slug === bId);
                                    return (
                                      <div key={bId} className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg text-xs">
                                        <span className="text-slate-700 truncate">{bObj?.name || bId}</span>
                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => handleMoveSelectedBrand(bIdx, "UP")}
                                            disabled={bIdx === 0}
                                            className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                                          >
                                            <MoveUp size={11} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleMoveSelectedBrand(bIdx, "DOWN")}
                                            disabled={bIdx === formSelectedBrandIds.length - 1}
                                            className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                                          >
                                            <MoveDown size={11} />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: 1:1 Brand Live Preview */}
                      <div className="lg:col-span-7 space-y-3">
                        <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Eye size={14} className="text-blue-600" />
                              <h4 className="text-xs text-slate-900">ბრენდების 1:1 Live Preview</h4>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              ნაჩვენებია: {liveFilteredBrands.length} ბრენდი
                            </span>
                          </div>

                          {liveFilteredBrands.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 text-xs">
                              არჩეული ბრენდები არ არის. მონიშნეთ მარცხენა სიიდან.
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 bg-white p-3 rounded-2xl border border-slate-100 max-h-72 overflow-y-auto">
                              {liveFilteredBrands.map((b) => (
                                <div
                                  key={b.id}
                                  className="p-3 bg-[#F8FAFC] rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center gap-1.5 h-20 shadow-2xs hover:bg-white transition-all"
                                >
                                  {b.logo ? (
                                    <img
                                      src={b.logo}
                                      alt={b.name}
                                      className="max-h-7 max-w-[80%] object-contain"
                                    />
                                  ) : (
                                    <span className="text-xs text-slate-800">{b.name}</span>
                                  )}
                                  <span className="text-[10px] text-slate-400 truncate w-full">
                                    {b.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          <p className="text-[10px] text-slate-400 text-center">
                            ოფიციალური ბრენდების ზოლი ზუსტად ამ ლოგოებითა და რიგითობით გამოჩნდება საიტზე.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: LAYOUT & VISUAL STYLING */}
              {activeTab === "LAYOUT" && (
                <div className="space-y-5">
                  {/* Grid Columns for PRODUCT_GRID */}
                  {formType === "PRODUCT_GRID" && (
                    <div>
                      <label className="block text-xs text-slate-700 mb-2">
                        სვეტების რაოდენობა (Columns Layout)
                      </label>
                      <div className="grid grid-cols-4 gap-2.5">
                        {[2, 3, 4, 6].map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setFormColumns(col)}
                            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                              formColumns === col
                                ? "border-blue-600 bg-blue-50/50 text-blue-600 shadow-xs"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <span className="text-sm block">{col} სვეტი</span>
                            <span className="text-[10px] text-slate-400">
                              {col === 2 ? "დიდი ბარათები" : col === 4 ? "სტანდარტული" : "კომპაქტური"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Autoplay toggle for Carousels */}
                  {(formType === "PRODUCT_CAROUSEL" || formType === "PROMO_CAROUSEL" || formType === "HERO_BANNER") && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs text-slate-900">სლაიდერის ავტო-გადახვევა (Autoplay)</h4>
                        <p className="text-[11px] text-slate-500">
                          სლაიდერი ავტომატურად გადაადგილდება ყოველ 5 წამში
                        </p>
                      </div>
                      <CustomSwitch
                        checked={formAutoplay}
                        onChange={setFormAutoplay}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="adm-btn-secondary"
              >
                გაუქმება
              </button>

              <button
                type="button"
                onClick={handleSaveModal}
                className="adm-btn-primary"
              >
                {isEditMode ? "ცვლილების შენახვა" : "სექციის შექმნა"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Picker Modal */}
      {isProductPickerOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm text-slate-900">პროდუქტების არჩევა კატალოგიდან</h3>
                <p className="text-xs text-slate-400">
                  არჩეულია: {formManualProductIds.length} პროდუქტი
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProductPickerOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-3 border-b border-slate-100 bg-white">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-slate-400" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="მოძებნეთ პროდუქტი სახელით ან SKU-ით..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="p-3 overflow-y-auto space-y-1.5 flex-1 divide-y divide-slate-50">
              {pickerFilteredProducts.map((prod) => {
                const isSelected = formManualProductIds.includes(prod.id);
                return (
                  <div
                    key={prod.id}
                    onClick={() => toggleManualProduct(prod.id)}
                    className={`p-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected ? "bg-blue-50/70 border border-blue-200" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod.image || (prod.images && prod.images[0]) || "/placeholder.png"}
                        alt={prod.title}
                        className="w-10 h-10 rounded-lg object-contain bg-white shrink-0 border border-slate-100 p-0.5"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs text-slate-900 truncate">{prod.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>SKU: {prod.sku || "N/A"}</span>
                          <span>•</span>
                          <span className="text-slate-700">₾{prod.price}</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsProductPickerOpen(false)}
                className="adm-btn-primary"
              >
                მზადაა ({formManualProductIds.length} არჩეული)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
