"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  DollarSign, 
  Package, 
  Layers, 
  Settings, 
  Search,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Star,
  RefreshCw
} from "lucide-react";
import { Category, SubCategory, DeepCategoryItem, SpecGroup, ProductVariant, Product } from "@/types";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { CustomSelect, CustomSelectOption } from "@/components/admin/ui/CustomSelect";
import { CustomToggle } from "@/components/admin/ui/CustomToggle";
import { CustomCheckbox } from "@/components/admin/ui/CustomCheckbox";
import { geoToLat } from "@/lib/transliteration";
import ProductCard from "@/components/ProductCard";

interface ProductFormProps {
  initialProduct?: Partial<Product>;
  isEdit?: boolean;
}

// Preset spec templates for rapid entry
const SPEC_PRESETS: Record<string, { label: string; specs: SpecGroup[] }> = {
  phone: {
    label: "📱 სმარტფონი / პლანშეტი",
    specs: [
      {
        title: "ეკრანი & კორპუსი",
        items: [
          { label: "დიაგონალი", value: '6.7"' },
          { label: "რეზოლუცია", value: "2796 x 1290" },
          { label: "განახლების სიხშირე", value: "120Hz ProMotion" },
        ],
      },
      {
        title: "პროცესორი & მეხსიერება",
        items: [
          { label: "პროცესორი", value: "A18 Pro Bionic" },
          { label: "ოპერატიული მეხსიერება (RAM)", value: "8 GB" },
          { label: "შიდა მეხსიერება", value: "256 GB" },
        ],
      },
      {
        title: "კამერა",
        items: [
          { label: "ძირითადი კამერა", value: "48 MP + 48 MP + 12 MP" },
          { label: "წინა კამერა", value: "12 MP" },
          { label: "ვიდეო გადაღება", value: "4K 120 fps" },
        ],
      },
      {
        title: "ელემენტი & კავშირი",
        items: [
          { label: "ელემენტის მოცულობა", value: "4685 mAh" },
          { label: "SIM ბარათი", value: "Dual SIM (Nano-SIM + eSIM)" },
          { label: "ქსელი", value: "5G" },
        ],
      },
    ],
  },
  laptop: {
    label: "💻 ლეპტოპი / კომპიუტერი",
    specs: [
      {
        title: "ეკრანი & გრაფიკა",
        items: [
          { label: "ეკრანის ზომა", value: '16.2"' },
          { label: "მატრიცის ტიპი", value: "Liquid Retina XDR" },
          { label: "ვიდეობარათი", value: "Apple M3 Pro (18-core GPU)" },
        ],
      },
      {
        title: "სისტემური მონაცემები",
        items: [
          { label: "პროცესორი", value: "Apple M3 Pro (12-core)" },
          { label: "ოპერატიული მეხსიერება", value: "18 GB Unified" },
          { label: "მყარი დისკი (SSD)", value: "512 GB NVMe" },
          { label: "ოპერაციული სისტემა", value: "macOS Sonoma" },
        ],
      },
    ],
  },
  general: {
    label: "🛠️ ზოგადი ტექნიკა & ხელსაწყოები",
    specs: [
      {
        title: "ძირითადი პარამეტრები",
        items: [
          { label: "სიმძლავრე", value: "1500 W" },
          { label: "წონა", value: "3.5 კგ" },
          { label: "კვების წყარო", value: "220V / 50Hz" },
          { label: "წარმოშობის ქვეყანა", value: "გერმანია" },
        ],
      },
    ],
  },
};

export const ProductForm: React.FC<ProductFormProps> = ({ initialProduct, isEdit = false }) => {
  const router = useRouter();

  // Live Metadata
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Active Section Tab
  const [activeTab, setActiveTab] = useState<"general" | "media" | "pricing" | "category" | "specs" | "variants" | "seo">("general");

  // Form Fields
  const [title, setTitle] = useState(initialProduct?.title || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [isAutoSlug, setIsAutoSlug] = useState(!isEdit);
  const [description, setDescription] = useState(initialProduct?.description || "");
  
  // Pricing & Stock
  const [price, setPrice] = useState<number | "">(initialProduct?.price ?? "");
  const [discountPrice, setDiscountPrice] = useState<number | "">(initialProduct?.discountPrice ?? "");
  const [stock, setStock] = useState<number | "">(initialProduct?.stock ?? 10);
  const [sku, setSku] = useState(initialProduct?.sku || `SP-${Math.floor(100000 + Math.random() * 900000)}`);
  const [code, setCode] = useState(initialProduct?.code || `${Math.floor(100000 + Math.random() * 900000)}`);
  const [warrantyMonths, setWarrantyMonths] = useState<string>(String(initialProduct?.warrantyMonths || "12"));
  
  // Flags
  const [isFeatured, setIsFeatured] = useState(Boolean(initialProduct?.isFeatured));
  const [isFlashDeal, setIsFlashDeal] = useState(Boolean((initialProduct as any)?.isFlashDeal));
  const [freeShipping, setFreeShipping] = useState(initialProduct?.freeShipping ?? true);
  const [isActiveStatus, setIsActiveStatus] = useState(true);

  // 3-Tier Category Hierarchy
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId || "");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [level3Id, setLevel3Id] = useState("");
  const [brandId, setBrandId] = useState(initialProduct?.brandId || "");

  // Media Gallery
  const [images, setImages] = useState<string[]>(
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images
      : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"]
  );

  // Technical Specifications
  const [specs, setSpecs] = useState<SpecGroup[]>(
    initialProduct?.specs || [
      {
        title: "ძირითადი მახასიათებლები",
        items: [
          { label: "ტიპი", value: "ორიგინალი" },
          { label: "გარანტია", value: "1 წელი" },
        ],
      },
    ]
  );

  // Variants State
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialProduct?.variants || [
      {
        id: "var-color",
        name: "ფერი",
        type: "color",
        options: [
          { label: "შავი", value: "#111111", colorHex: "#111111", inStock: true },
          { label: "თეთრი", value: "#F8FAFC", colorHex: "#F8FAFC", inStock: true },
        ],
      },
    ]
  );

  // New variant option inputs
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#FF5238");

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState(initialProduct?.title || "");
  const [metaDescription, setMetaDescription] = useState(initialProduct?.description || "");

  // Fetch live categories & brands
  useEffect(() => {
    let isMounted = true;
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/brands"),
        ]);
        const [catJson, brandJson] = await Promise.all([
          catRes.json(),
          brandRes.json(),
        ]);

        if (isMounted) {
          const loadedCats: Category[] = catJson.success && Array.isArray(catJson.data) ? catJson.data : [];
          const loadedBrands = brandJson.success && Array.isArray(brandJson.data) ? brandJson.data : [];
          
          setCategories(loadedCats);
          setBrands(loadedBrands);

          if (!categoryId && loadedCats.length > 0) {
            setCategoryId(loadedCats[0].id);
          }
          if (!brandId && loadedBrands.length > 0) {
            setBrandId(loadedBrands[0].id);
          }
        }
      } catch (err) {
        console.error("ProductForm: Failed to load metadata:", err);
      } finally {
        if (isMounted) setIsLoadingMetadata(false);
      }
    };

    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, [categoryId, brandId]);

  // Derived Category and Subcategory Items
  const activeCategory = categories.find((c) => c.id === categoryId || c.slug === categoryId);
  const availableSubcategories: SubCategory[] = activeCategory?.children || [];
  const activeSubcategory = availableSubcategories.find((s) => s.id === subcategoryId || s.slug === subcategoryId);
  const availableLevel3Items: DeepCategoryItem[] = activeSubcategory?.items || [];

  // Transform options for CustomSelect
  const categoryOptions: CustomSelectOption[] = useMemo(() => {
    return categories.map((c) => ({
      value: c.id,
      label: c.name,
      subLabel: `${c.children?.length || 0} ქვეკატეგორია`,
    }));
  }, [categories]);

  const subcategoryOptions: CustomSelectOption[] = useMemo(() => {
    return availableSubcategories.map((s) => ({
      value: s.id,
      label: s.name,
      subLabel: `${s.items?.length || 0} მოდელი/ჯგუფი`,
    }));
  }, [availableSubcategories]);

  const level3Options: CustomSelectOption[] = useMemo(() => {
    return availableLevel3Items.map((item) => ({
      value: item.id,
      label: item.name,
    }));
  }, [availableLevel3Items]);

  const brandOptions: CustomSelectOption[] = useMemo(() => {
    return brands.map((b) => ({
      value: b.id,
      label: b.name,
    }));
  }, [brands]);

  const warrantyOptions: CustomSelectOption[] = [
    { value: "0", label: "საგარანტიო ვადის გარეშე" },
    { value: "3", label: "3 თვე" },
    { value: "6", label: "6 თვე" },
    { value: "12", label: "1 წელი (12 თვე)", badge: "პოპულარული" },
    { value: "24", label: "2 წელი (24 თვე)" },
    { value: "36", label: "3 წელი (36 თვე)" },
  ];

  // Auto-generate clean Latin slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isAutoSlug) {
      const latin = geoToLat(val.toLowerCase());
      const cleanSlug = latin
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setSlug(cleanSlug);
      setSeoTitle(val);
    }
  };

  // Live discount calculations
  const numPrice = Number(price) || 0;
  const numDiscountPrice = Number(discountPrice) || 0;
  const discountPercent = numPrice > 0 && numDiscountPrice > 0 && numDiscountPrice < numPrice
    ? Math.round(((numPrice - numDiscountPrice) / numPrice) * 100)
    : 0;

  // Spec handlers
  const handleApplyPreset = (presetKey: string) => {
    const preset = SPEC_PRESETS[presetKey];
    if (preset) {
      setSpecs(JSON.parse(JSON.stringify(preset.specs)));
    }
  };

  const handleAddSpecGroup = () => {
    setSpecs([...specs, { title: "ახალი ჯგუფი", items: [{ label: "", value: "" }] }]);
  };

  const handleRemoveSpecGroup = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleAddSpecItem = (groupIndex: number) => {
    const updated = [...specs];
    updated[groupIndex].items.push({ label: "", value: "" });
    setSpecs(updated);
  };

  const handleSpecItemChange = (groupIndex: number, itemIndex: number, field: "label" | "value", val: string) => {
    const updated = [...specs];
    updated[groupIndex].items[itemIndex][field] = val;
    setSpecs(updated);
  };

  const handleRemoveSpecItem = (groupIndex: number, itemIndex: number) => {
    const updated = [...specs];
    updated[groupIndex].items = updated[groupIndex].items.filter((_, i) => i !== itemIndex);
    setSpecs(updated);
  };

  // Add Color Variant
  const handleAddColorOption = () => {
    if (!newColorName.trim()) return;
    const updated = [...variants];
    const colorVar = updated.find((v) => v.type === "color") || updated[0];
    if (colorVar) {
      colorVar.options.push({
        label: newColorName.trim(),
        value: newColorHex,
        colorHex: newColorHex,
        inStock: true,
      });
      setVariants([...updated]);
      setNewColorName("");
    }
  };

  const handleRemoveVariantOption = (varIndex: number, optIndex: number) => {
    const updated = [...variants];
    updated[varIndex].options = updated[varIndex].options.filter((_, i) => i !== optIndex);
    setVariants(updated);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || price === "" || Number(price) <= 0) {
      alert("გთხოვთ მიუთითოთ პროდუქტის სახელი და სწორი ფასი");
      return;
    }

    if (!categoryId || !brandId) {
      alert("გთხოვთ აირჩიოთ კატეგორია და ბრენდი");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || geoToLat(title.toLowerCase()).replace(/\s+/g, "-"),
        description,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        stock: Number(stock || 0),
        sku,
        code,
        categoryId,
        brandId,
        images,
        specs,
        variants,
        warrantyMonths: Number(warrantyMonths) || 12,
        freeShipping,
        isFeatured,
        isFlashDeal,
      };

      let res;
      if (isEdit && initialProduct?.id) {
        res = await fetch(`/api/products/${encodeURIComponent(initialProduct.id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "პროდუქტის შენახვა ვერ მოხერხდა");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error("ProductForm error:", err);
      alert(err.message || "შეცდომა პროდუქტის შენახვისას");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      
      {/* 1. Sticky Header Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2.5 text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
            title="უკან დაბრუნება"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-400">პროდუქტების მართვა</span>
              <ChevronRight className="w-3 h-3 text-zinc-300" />
              <span className="text-[11px] text-[#FF5238]">{isEdit ? "რედაქტირება" : "ახალი პროდუქტი"}</span>
            </div>
            <h1 className="text-lg sm:text-xl text-zinc-900 tracking-tight leading-snug">
              {isEdit ? `რედაქტირება: ${initialProduct?.title || ""}` : "ახალი პროდუქტის დამატება"}
            </h1>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="px-3.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ლაივ გადახედვა</span>
          </button>

          <Link
            href="/admin/products"
            className="px-4 py-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl text-xs transition-colors cursor-pointer"
          >
            გაუქმება
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#FF5238] hover:bg-[#EA3A20] disabled:opacity-50 text-white rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>ინახება...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEdit ? "შენახვა" : "გამოქვეყნება"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "general", label: "ძირითადი", icon: Package },
          { id: "media", label: `მედია (${images.length})`, icon: ImageIcon },
          { id: "pricing", label: "ფასი & მარაგი", icon: DollarSign },
          { id: "category", label: "კატეგორია & ბრენდი", icon: Layers },
          { id: "specs", label: "მახასიათებლები", icon: Settings },
          { id: "variants", label: "ვარიაციები (ფერები)", icon: Sparkles },
          { id: "seo", label: "SEO ოპტიმიზაცია", icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer select-none ${
                isActive
                  ? "bg-[#FF5238] text-white shadow-xs"
                  : "bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200/80 hover:text-zinc-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. 2-Column Responsive Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Form Content Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TAB 1: GENERAL INFORMATION */}
          {activeTab === "general" && (
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div>
                  <h3 className="text-sm text-zinc-900">ძირითადი ინფორმაცია</h3>
                  <p className="text-[11px] text-zinc-400">მიუთითეთ პროდუქტის სახელი, იდენტიფიკატორები და აღწერა</p>
                </div>
                <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-md">ID: {initialProduct?.id || "ახალი"}</span>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-xs text-zinc-800">
                  პროდუქტის დასახელება <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="მაგ: Apple iPhone 16 Pro Max 256GB Black Titanium"
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:border-[#FF5238] focus:ring-2 focus:ring-[#FF5238]/15 focus:outline-none transition-all"
                  required
                />
              </div>

              {/* URL Slug Generator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs text-zinc-800">URL მისამართი (Slug)</label>
                  <button
                    type="button"
                    onClick={() => setIsAutoSlug(!isAutoSlug)}
                    className="text-[11px] text-[#FF5238] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{isAutoSlug ? "ავტომატური (აქტიური)" : "ხელით რედაქტირება"}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 bg-zinc-50 border border-zinc-200 px-3 h-11 rounded-xl flex items-center shrink-0">
                    /product/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setIsAutoSlug(false);
                      setSlug(e.target.value);
                    }}
                    placeholder="iphone-16-pro-max-256gb-black"
                    className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 font-mono focus:border-[#FF5238] focus:ring-2 focus:ring-[#FF5238]/15 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs text-zinc-800">პროდუქტის სრული აღწერა</label>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ჩაწერეთ პროდუქტის დეტალური აღწერა, უპირატესობები და მახასიათებლები..."
                  className="w-full p-3.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:border-[#FF5238] focus:ring-2 focus:ring-[#FF5238]/15 focus:outline-none transition-all resize-y"
                />
              </div>

              {/* SKU & Barcode Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
                <div className="space-y-1.5">
                  <label className="block text-xs text-zinc-800">SKU კოდი (არტიკული)</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 font-mono focus:border-[#FF5238] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs text-zinc-800">შიდა კოდი / შტრიხკოდი</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 font-mono focus:border-[#FF5238] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA GALLERY */}
          {activeTab === "media" && (
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div>
                  <h3 className="text-sm text-zinc-900">ფოტო გალერეა & მედია</h3>
                  <p className="text-[11px] text-zinc-400">ატვირთეთ ფოტოები ან ჩასვით პირდაპირი ბმულები (მაქს. 10MB)</p>
                </div>
                <span className="text-[11px] text-[#FF5238] bg-[#FFF5F2] px-2.5 py-1 rounded-full">
                  {images.length} სურათი
                </span>
              </div>

              <ImageUploader
                images={images}
                onChange={setImages}
                multiple={true}
                label="პროდუქტის სურათები"
                helperText="პირველი სურათი ავტომატურად გამოჩნდება ბარათის მთავარ ფოტოდ"
              />
            </div>
          )}

          {/* TAB 3: PRICING & INVENTORY */}
          {activeTab === "pricing" && (
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-6">
              <div className="pb-3 border-b border-zinc-100">
                <h3 className="text-sm text-zinc-900">ფასი & მარაგების მართვა</h3>
                <p className="text-[11px] text-zinc-400">დააყენეთ ძირითადი ფასი, აქციები და ხელმისაწვდომი რაოდენობა</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Base Price */}
                <div className="space-y-1.5">
                  <label className="block text-xs text-zinc-800">
                    ძირითადი ფასი (₾) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                      placeholder="2999"
                      className="w-full h-11 pl-3.5 pr-8 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:border-[#FF5238] focus:ring-2 focus:ring-[#FF5238]/15 focus:outline-none"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 pointer-events-none">₾</span>
                  </div>
                </div>

                {/* Discount Price */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs text-zinc-800">ფასდაკლებული ფასი (₾)</label>
                    {discountPercent > 0 && (
                      <span className="text-[10px] bg-[#10B981] text-white px-2 py-0.5 rounded-md">
                        -{discountPercent}% ფასდაკლება
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : "")}
                      placeholder="2699"
                      className="w-full h-11 pl-3.5 pr-8 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:border-[#FF5238] focus:ring-2 focus:ring-[#FF5238]/15 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 pointer-events-none">₾</span>
                  </div>
                </div>

                {/* Stock Quantity */}
                <div className="space-y-1.5">
                  <label className="block text-xs text-zinc-800">
                    მარაგის რაოდენობა (ნაშთი) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value ? Number(e.target.value) : "")}
                    placeholder="10"
                    className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:border-[#FF5238] focus:ring-2 focus:ring-[#FF5238]/15 focus:outline-none"
                    required
                  />
                </div>

                {/* Warranty Select */}
                <CustomSelect
                  label="საგარანტიო ვადა"
                  options={warrantyOptions}
                  value={warrantyMonths}
                  onChange={setWarrantyMonths}
                />
              </div>

              {/* Toggles Row */}
              <div className="pt-3 border-t border-zinc-100 space-y-3">
                <CustomToggle
                  checked={freeShipping}
                  onChange={setFreeShipping}
                  label="უფასო მიწოდება მთელ საქართველოში"
                  description="პროდუქტის ბარათზე და კალათაში გამოჩნდება უფასო მიწოდების ბეიჯი"
                  badge="მიწოდება"
                />
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORY & BRAND */}
          {activeTab === "category" && (
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-5">
              <div className="pb-3 border-b border-zinc-100">
                <h3 className="text-sm text-zinc-900">კატეგორია & ბრენდის მიბმა</h3>
                <p className="text-[11px] text-zinc-400">3-დონიანი იერარქია საიტის ნავიგაციისა და ფილტრაციისთვის</p>
              </div>

              <div className="space-y-4">
                {/* Level 1: Category */}
                <CustomSelect
                  label="მთავარი კატეგორია (დონე 1)"
                  placeholder="აირჩიეთ მთავარი კატეგორია..."
                  options={categoryOptions}
                  value={categoryId}
                  onChange={(val) => {
                    setCategoryId(val);
                    setSubcategoryId("");
                    setLevel3Id("");
                  }}
                  required
                />

                {/* Level 2: Subcategory */}
                <CustomSelect
                  label="ქვეკატეგორია (დონე 2)"
                  placeholder={availableSubcategories.length > 0 ? "აირჩიეთ ქვეკატეგორია..." : "ქვეკატეგორია არ მოიძებნა"}
                  options={subcategoryOptions}
                  value={subcategoryId}
                  onChange={(val) => {
                    setSubcategoryId(val);
                    setLevel3Id("");
                  }}
                  disabled={availableSubcategories.length === 0}
                  clearable
                />

                {/* Level 3: Deep Item */}
                {availableLevel3Items.length > 0 && (
                  <CustomSelect
                    label="დეტალური მოდელი / ჯგუფი (დონე 3)"
                    placeholder="აირჩიეთ ჯგუფი..."
                    options={level3Options}
                    value={level3Id}
                    onChange={setLevel3Id}
                    clearable
                  />
                )}

                {/* Brand */}
                <div className="pt-2">
                  <CustomSelect
                    label="მწარმოებელი ბრენდი"
                    placeholder="აირჩიეთ ბრენდი..."
                    options={brandOptions}
                    value={brandId}
                    onChange={setBrandId}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SPECS & ATTRIBUTES */}
          {activeTab === "specs" && (
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                <div>
                  <h3 className="text-sm text-zinc-900">ტექნიკური მახასიათებლები</h3>
                  <p className="text-[11px] text-zinc-400">შეადარეთ და დააჯგუფეთ პროდუქტის სპეციფიკაციები</p>
                </div>
                
                {/* Preset Templates */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-zinc-400 mr-1">შაბლონი:</span>
                  {Object.entries(SPEC_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleApplyPreset(key)}
                      className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-[11px] transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spec Groups List */}
              <div className="space-y-4">
                {specs.map((group, gIndex) => (
                  <div key={gIndex} className="p-4 bg-zinc-50/70 border border-zinc-200/70 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        value={group.title}
                        onChange={(e) => {
                          const updated = [...specs];
                          updated[gIndex].title = e.target.value;
                          setSpecs(updated);
                        }}
                        placeholder="ჯგუფის სათაური (მაგ: ეკრანი)"
                        className="flex-1 bg-white h-9 px-3 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:border-[#FF5238] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecGroup(gIndex)}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="ჯგუფის წაშლა"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Spec Items */}
                    <div className="space-y-2 pt-1">
                      {group.items.map((item, iIndex) => (
                        <div key={iIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => handleSpecItemChange(gIndex, iIndex, "label", e.target.value)}
                            placeholder="მახასიათებელი (მაგ: დიაგონალი)"
                            className="flex-1 bg-white h-9 px-3 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:border-[#FF5238] focus:outline-none"
                          />
                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) => handleSpecItemChange(gIndex, iIndex, "value", e.target.value)}
                            placeholder='მნიშვნელობა (მაგ: 6.7")'
                            className="flex-1 bg-white h-9 px-3 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:border-[#FF5238] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecItem(gIndex, iIndex)}
                            className="p-2 text-zinc-300 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="წაშლა"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => handleAddSpecItem(gIndex)}
                        className="text-xs text-[#FF5238] hover:underline pt-1 cursor-pointer inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ველის დამატება</span>
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddSpecGroup}
                  className="w-full py-3 bg-zinc-50 hover:bg-zinc-100 border border-dashed border-zinc-300 rounded-2xl text-xs text-zinc-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#FF5238]" />
                  <span>ახალი სპეციფიკაციის ჯგუფის დამატება</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: VARIANTS */}
          {activeTab === "variants" && (
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-5">
              <div className="pb-3 border-b border-zinc-100">
                <h3 className="text-sm text-zinc-900">პროდუქტის ვარიაციები (ფერი & მოდიფიკაცია)</h3>
                <p className="text-[11px] text-zinc-400">მომხმარებელს შეეძლება პროდუქტის გვერდზე სასურველი ფერის არჩევა</p>
              </div>

              {/* Color Swatches Editor */}
              <div className="p-4 bg-zinc-50/70 border border-zinc-200/70 rounded-2xl space-y-4">
                <h4 className="text-xs text-zinc-900">ხელმისაწვდომი ფერები</h4>
                
                <div className="flex flex-wrap gap-2.5">
                  {variants[0]?.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-xl shadow-2xs"
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: opt.colorHex || opt.value }}
                      />
                      <span className="text-xs text-zinc-800">{opt.label}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariantOption(0, oIdx)}
                        className="text-zinc-300 hover:text-red-500 ml-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new color row */}
                <div className="flex items-center gap-3 pt-2 border-t border-zinc-200/60">
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="ფერის სახელი (მაგ: Desert Titanium)"
                    className="flex-1 h-9 px-3 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-white focus:outline-none focus:border-[#FF5238]"
                  />
                  <div className="flex items-center gap-2 bg-white border border-zinc-200 px-2.5 h-9 rounded-xl">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-6 h-6 rounded-md border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <span className="text-[11px] font-mono text-zinc-600">{newColorHex}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddColorOption}
                    className="px-4 h-9 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-xl text-xs cursor-pointer transition-colors shrink-0"
                  >
                    დამატება
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SEO */}
          {activeTab === "seo" && (
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-5">
              <div className="pb-3 border-b border-zinc-100">
                <h3 className="text-sm text-zinc-900">SEO & სოციალური ქსელების ოპტიმიზაცია</h3>
                <p className="text-[11px] text-zinc-400">საძიებო სისტემებისთვის (Google, Bing) და სოციალური გაზიარებისთვის</p>
              </div>

              {/* Google Search Simulator */}
              <div className="p-4 bg-[#F8FAFC] border border-zinc-200/80 rounded-2xl space-y-1 font-sans">
                <span className="text-[11px] text-zinc-400 block mb-1">Google ძიების შედეგის გადახედვა:</span>
                <p className="text-xs text-emerald-700 truncate">spilo.ge › product › {slug || "iphone-16"}</p>
                <h4 className="text-sm text-blue-700 hover:underline cursor-pointer truncate">
                  {seoTitle || title || "პროდუქტის სათაური"} | Spilo.ge
                </h4>
                <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                  {metaDescription || description || "შეიძინეთ საუკეთესო ფასად Spilo.ge-ზე. ოფიციალური გარანტია და სწრაფი მიწოდება მთელ საქართველოში."}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs text-zinc-800">Meta Title (SEO სათაური)</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="პროდუქტის SEO სათაური"
                    className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:border-[#FF5238] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs text-zinc-800">Meta Description (SEO აღწერა)</label>
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="მოკლე აღწერა Google-ის შედეგებისთვის..."
                    className="w-full p-3 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:border-[#FF5238] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Sticky Status & Live Storefront Preview (4 cols) */}
        <div className="lg:col-span-4 space-y-5 sticky top-24">
          
          {/* Status & Quick Toggle Card */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
            <h3 className="text-xs text-zinc-900 border-b border-zinc-100 pb-2.5">
              გამოქვეყნების სტატუსი
            </h3>

            <div className="space-y-2.5">
              <CustomToggle
                checked={isFeatured}
                onChange={setIsFeatured}
                label="Featured პროდუქტი"
                description="გამოჩნდება მთავარი გვერდის პოპულარულ სექციებში"
                badge="მთავარი"
              />

              <CustomToggle
                checked={isFlashDeal}
                onChange={setIsFlashDeal}
                label="Flash Deals აქცია"
                description="ჩაერთვება დღის შეთავაზებებისა და ფასდაკლებების სექციაში"
                badge="აქცია"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#FF5238] hover:bg-[#EA3A20] disabled:opacity-50 text-white rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>მიმდინარეობს შენახვა...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEdit ? "ცვლილების შენახვა" : "პროდუქტის გამოქვეყნება"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Real-time Storefront Card Live Preview */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <span className="text-xs text-zinc-900">ლაივ ბარათის გადახედვა</span>
              <span className="text-[10px] text-zinc-400">რეალურ დროში</span>
            </div>

            <div className="max-w-[260px] mx-auto py-2 pointer-events-none">
              <ProductCard
                id={initialProduct?.id || "preview-id"}
                title={title || "პროდუქტის სათაური"}
                price={Number(price) || 2999}
                discountPrice={discountPrice ? Number(discountPrice) : undefined}
                image={images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"}
                images={images}
                stock={Number(stock) || 10}
              />
            </div>
          </div>

        </div>

      </div>

      {/* 4. Fullscreen Live Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm text-zinc-900">საიტზე გამოჩენის გადახედვა</h3>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-2">
              <ProductCard
                id={initialProduct?.id || "preview-id"}
                title={title || "პროდუქტის სათაური"}
                price={Number(price) || 2999}
                discountPrice={discountPrice ? Number(discountPrice) : undefined}
                image={images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"}
                images={images}
                stock={Number(stock) || 10}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs cursor-pointer transition-colors"
            >
              დახურვა
            </button>
          </div>
        </div>
      )}

    </form>
  );
};
