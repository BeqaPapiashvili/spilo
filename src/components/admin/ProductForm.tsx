"use client";

import React, { useState, useEffect } from "react";
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
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Category, SubCategory, DeepCategoryItem, SpecGroup, ProductVariant, Product } from "@/types";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface ProductFormProps {
  initialProduct?: Partial<Product>;
  isEdit?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialProduct, isEdit = false }) => {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

  const [activeTab, setActiveTab] = useState<"general" | "media" | "pricing" | "category" | "variants" | "specs" | "seo">("general");

  // Form States
  const [title, setTitle] = useState(initialProduct?.title || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [price, setPrice] = useState<number | "">(initialProduct?.price ?? "");
  const [discountPrice, setDiscountPrice] = useState<number | "">(initialProduct?.discountPrice ?? "");
  const [stock, setStock] = useState<number | "">(initialProduct?.stock ?? 10);
  const [sku, setSku] = useState(initialProduct?.sku || `SKU-${Math.floor(100000 + Math.random() * 900000)}`);
  const [code, setCode] = useState(initialProduct?.code || `${Math.floor(100000 + Math.random() * 900000)}`);
  
  // 3-Tier Category Hierarchy States
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId || "");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [level3Id, setLevel3Id] = useState("");

  const [brandId, setBrandId] = useState(initialProduct?.brandId || "");
  
  const [images, setImages] = useState<string[]>(
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images
      : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"]
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  const [isFeatured, setIsFeatured] = useState(Boolean(initialProduct?.isFeatured));
  const [isFlashDeal, setIsFlashDeal] = useState(Boolean((initialProduct as any)?.isFlashDeal));
  const [warrantyMonths, setWarrantyMonths] = useState(initialProduct?.warrantyMonths || 12);
  const [freeShipping, setFreeShipping] = useState(initialProduct?.freeShipping ?? true);

  // Specs Group State
  const [specs, setSpecs] = useState<SpecGroup[]>(
    initialProduct?.specs || [
      {
        title: "ძირითადი მახასიათებლები",
        items: [
          { label: "ეკრანი", value: '6.3" Super Retina XDR OLED' },
          { label: "პროცესორი", value: "A18 Pro chip" },
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
          { label: "Black Titanium", value: "#111111", colorHex: "#111111", inStock: true },
          { label: "White Titanium", value: "#F1F3F6", colorHex: "#F1F3F6", inStock: true },
        ],
      },
    ]
  );

  // SEO State
  const [seoTitle, setSeoTitle] = useState(initialProduct?.title || "");
  const [metaDescription, setMetaDescription] = useState(initialProduct?.description || "");

  // 1. Fetch live categories & brands from database
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
        console.error("ProductForm: Failed to load categories/brands from database:", err);
      } finally {
        if (isMounted) setIsLoadingMetadata(false);
      }
    };

    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, [categoryId, brandId]);

  // Derived subcategories and level-3 items
  const activeCategory = categories.find((c) => c.id === categoryId || c.slug === categoryId);
  const availableSubcategories: SubCategory[] = activeCategory?.children || [];
  const activeSubcategory = availableSubcategories.find((s) => s.id === subcategoryId || s.slug === subcategoryId);
  const availableLevel3Items: DeepCategoryItem[] = activeSubcategory?.items || [];

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9ge]/g, "-").replace(/-+/g, "-"));
      setSeoTitle(val);
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || price === "" || Number(price) <= 0) {
      alert("გთხოვთ შეავსოთ პროდუქტის სახელი და სწორი ფასი");
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
        slug: slug.trim() || title.toLowerCase().replace(/\s+/g, "-"),
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
      console.error("ProductForm: Submit error:", err);
      alert(err.message || "შეცდომა პროდუქტის შენახვისას");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* 1. Header Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl text-gray-900 tracking-tight">
              {isEdit ? `პროდუქტის რედაქტირება: ${initialProduct?.title}` : "ახალი პროდუქტის დამატება"}
            </h1>
            <p className="text-xs text-gray-500">შეავსეთ პროდუქტის დეტალები, ფასები, მარაგები და სპეციფიკაციები</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs transition-colors"
          >
            გაუქმება
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isEdit ? "ცვლილების შენახვა" : "პროდუქტის დამატება"}</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        {[
          { id: "general", label: "ზოგადი ინფორმაცია", icon: Package },
          { id: "media", label: "გალერეა / მედია", icon: ImageIcon },
          { id: "pricing", label: "ფასი & მარაგები", icon: DollarSign },
          { id: "category", label: "კატეგორია & ბრენდი", icon: Layers },
          { id: "variants", label: "ვარიაციები (ფერი/ზომა)", icon: Sparkles },
          { id: "specs", label: "სპეციფიკაციები", icon: Settings },
          { id: "seo", label: "SEO ოპტიმიზაცია", icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        
        {/* TAB 1: GENERAL */}
        {activeTab === "general" && (
          <div className="space-y-4 max-w-3xl">
            <div>
              <label className="block text-xs text-gray-900 mb-1.5">პროდუქტის დასახელება *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="მაგ: Apple iPhone 16 Pro Max 256GB Black"
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-900 mb-1.5">URL Slug (მისამართი)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="iphone-16-pro-max-256gb-black"
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-900 mb-1.5">პროდუქტის სრული აღწერა</label>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ჩაწერეთ პროდუქტის დეტალური აღწერა..."
                className="w-full p-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="isFeatured" className="text-xs text-gray-900 cursor-pointer">
                  გამოჩნდეს Featured პროდუქტებში მთავარ გვერდზე
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isFlashDeal"
                  checked={isFlashDeal}
                  onChange={(e) => setIsFlashDeal(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="isFlashDeal" className="text-xs text-gray-900 cursor-pointer">
                  გამოჩნდეს Flash Deals სექციაში მთავარ გვერდზე
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEDIA */}
        {activeTab === "media" && (
          <div className="space-y-4 max-w-3xl">
            <ImageUploader
              images={images}
              onChange={setImages}
              multiple={true}
              label="პროდუქტის სურათების გალერეა"
              helperText="ატვირთეთ მაღალი რეზოლუციის სურათები (Drag & Drop ან აირჩიეთ ფაილი). პირველი სურათი იქნება მთავარი."
            />
          </div>
        )}

        {/* TAB 3: PRICING & INVENTORY */}
        {activeTab === "pricing" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
            <div>
              <label className="block text-xs text-gray-900 mb-1.5">ძირითადი ფასი (₾) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                placeholder="2999"
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-900 mb-1.5">ფასდაკლებული ფასი (₾)</label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : "")}
                placeholder="2799"
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-900 mb-1.5">მარაგის რაოდენობა (Stock) *</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value ? Number(e.target.value) : "")}
                placeholder="10"
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-900 mb-1.5">SKU კოდი</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB 4: CATEGORY & BRAND (3-Level Cascade) */}
        {activeTab === "category" && (
          <div className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Level 1: Main Category */}
              <div>
                <label className="block text-xs text-gray-900 mb-1.5">მთავარი კატეგორია (დონე 1) *</label>
                {isLoadingMetadata ? (
                  <div className="h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-400 flex items-center">
                    იტვირთება კატეგორიები...
                  </div>
                ) : (
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setSubcategoryId("");
                      setLevel3Id("");
                    }}
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white cursor-pointer"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Level 2: Subcategory */}
              <div>
                <label className="block text-xs text-gray-900 mb-1.5">ქვეკატეგორია (დონე 2)</label>
                <select
                  value={subcategoryId}
                  onChange={(e) => {
                    setSubcategoryId(e.target.value);
                    setLevel3Id("");
                  }}
                  disabled={availableSubcategories.length === 0}
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">
                    {availableSubcategories.length > 0 ? "აირჩიეთ ქვეკატეგორია (არასავალდებულო)" : "ქვეკატეგორია არ არის"}
                  </option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level 3: Deep Item / Specific Model Group (if available) */}
              {availableLevel3Items.length > 0 && (
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-900 mb-1.5">დეტალური ჯგუფი / მოდელი (დონე 3)</label>
                  <select
                    value={level3Id}
                    onChange={(e) => setLevel3Id(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">აირჩიეთ ჯგუფი (არასავალდებულო)</option>
                    {availableLevel3Items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Brand */}
              <div>
                <label className="block text-xs text-gray-900 mb-1.5">ბრენდი *</label>
                {isLoadingMetadata ? (
                  <div className="h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-400 flex items-center">
                    იტვირთება ბრენდები...
                  </div>
                ) : (
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white cursor-pointer"
                    required
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Warranty */}
              <div>
                <label className="block text-xs text-gray-900 mb-1.5">გარანტია (თვეებში)</label>
                <input
                  type="number"
                  value={warrantyMonths}
                  onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="freeShipping"
                checked={freeShipping}
                onChange={(e) => setFreeShipping(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
              <label htmlFor="freeShipping" className="text-xs text-gray-900 cursor-pointer">
                უფასო მიწოდება მთელ საქართველოში
              </label>
            </div>
          </div>
        )}

        {/* TAB 5: VARIANTS */}
        {activeTab === "variants" && (
          <div className="space-y-6 max-w-3xl">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <p className="text-xs text-blue-800 leading-relaxed">
                ვარიაციები საშუალებას გაძლევთ დაამატოთ ფერები და მეხსიერების პარამეტრები.
              </p>
            </div>
            {/* Variants renderer */}
            <div className="space-y-4">
              {variants.map((v, vIndex) => (
                <div key={v.id || vIndex} className="p-4 border border-gray-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-900">{v.name} ({v.type})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt, oIndex) => (
                      <span key={oIndex} className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs text-gray-700">
                        {opt.label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SPECS */}
        {activeTab === "specs" && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">დაამატეთ ტექნიკური მახასიათებლების ჯგუფები და ველები.</p>
              <button
                type="button"
                onClick={handleAddSpecGroup}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ჯგუფის დამატება</span>
              </button>
            </div>

            <div className="space-y-4">
              {specs.map((group, gIndex) => (
                <div key={gIndex} className="p-4 bg-gray-50/50 border border-gray-200/80 rounded-2xl space-y-3">
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
                      className="flex-1 bg-white h-9 px-3 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecGroup(gIndex)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Spec Items */}
                  <div className="space-y-2 pt-2">
                    {group.items.map((item, iIndex) => (
                      <div key={iIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => handleSpecItemChange(gIndex, iIndex, "label", e.target.value)}
                          placeholder="მახასიათებელი (მაგ: დიაგონალი)"
                          className="flex-1 bg-white h-8 px-2.5 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => handleSpecItemChange(gIndex, iIndex, "value", e.target.value)}
                          placeholder='მნიშვნელობა (მაგ: 6.3")'
                          className="flex-1 bg-white h-8 px-2.5 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecItem(gIndex, iIndex)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddSpecItem(gIndex)}
                      className="text-xs text-blue-600 hover:underline pt-1 cursor-pointer"
                    >
                      + ველის დამატება
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: SEO */}
        {activeTab === "seo" && (
          <div className="space-y-4 max-w-3xl">
            <div>
              <label className="block text-xs text-gray-900 mb-1.5">Meta Title (SEO სათაური)</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-900 mb-1.5">Meta Description (SEO აღწერა)</label>
              <textarea
                rows={4}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        )}

      </div>
    </form>
  );
};
