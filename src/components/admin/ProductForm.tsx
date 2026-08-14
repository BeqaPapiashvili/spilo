"use client";

import React, { useState } from "react";
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
  CheckCircle2
} from "lucide-react";
import { dataService } from "@/services/dataService";
import { Product, SpecGroup, ProductVariant } from "@/types";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface ProductFormProps {
  initialProduct?: Partial<Product>;
  isEdit?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialProduct, isEdit = false }) => {
  const router = useRouter();
  const categories = dataService.getCategories();
  const brands = dataService.getBrands();

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
  
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId || categories[0]?.id || "mobiles");
  const [brandId, setBrandId] = useState(initialProduct?.brandId || brands[0]?.id || "apple");
  
  const [images, setImages] = useState<string[]>(
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images
      : ["https://veli.store/media-cdn/__sized__/product/iphone16pro-thumbnail-200x200-95.jpg"]
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  const [isFeatured, setIsFeatured] = useState(initialProduct?.isFeatured ?? true);
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

  const handleAddSpecItem = (groupIndex: number) => {
    const updated = [...specs];
    updated[groupIndex].items.push({ label: "", value: "" });
    setSpecs(updated);
  };

  const handleSpecChange = (groupIndex: number, itemIndex: number, field: "label" | "value", val: string) => {
    const updated = [...specs];
    updated[groupIndex].items[itemIndex][field] = val;
    setSpecs(updated);
  };

  const handleRemoveSpecItem = (groupIndex: number, itemIndex: number) => {
    const updated = [...specs];
    updated[groupIndex].items = updated[groupIndex].items.filter((_, i) => i !== itemIndex);
    setSpecs(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) {
      alert("გთხოვთ შეავსოთ პროდუქტის სახელი და ფასი");
      return;
    }

    const selectedCatObj = categories.find((c) => c.id === categoryId);
    const selectedBrandObj = brands.find((b) => b.id === brandId);

    const saved = dataService.saveProduct({
      id: initialProduct?.id,
      title: title.trim(),
      slug: slug.trim() || title.toLowerCase().replace(/\s+/g, "-"),
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: Number(stock || 0),
      sku,
      code,
      categoryId,
      categoryName: selectedCatObj?.name || "მობილურები",
      brandId,
      brandName: selectedBrandObj?.name || "Apple",
      images,
      specs,
      variants,
      isFeatured,
      warrantyMonths,
      freeShipping,
    });

    router.push("/admin/products");
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
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              {isEdit ? `პროდუქტის რედაქტირება: ${initialProduct?.title}` : "ახალი პროდუქტის დამატება"}
            </h1>
            <p className="text-xs text-gray-500">შეავსეთ პროდუქტის დეტალები, ფასები, მარაგები და სპეციფიკაციები</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
          >
            გაუქმება
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{isEdit ? "განახლება" : "შენახვა"}</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-gray-200/80 shadow-xs overflow-x-auto">
        {[
          { id: "general", label: "ძირითადი (General)" },
          { id: "media", label: "მედია & სურათები" },
          { id: "pricing", label: "ფასები & მარაგი" },
          { id: "category", label: "კატეგორია & ბრენდი" },
          { id: "variants", label: "ვარიანტები (Variants)" },
          { id: "specs", label: "სპეციფიკაციები" },
          { id: "seo", label: "SEO მენეჯერი" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Tab Contents */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-6">
        
        {/* TAB 1: GENERAL */}
        {activeTab === "general" && (
          <div className="space-y-4 max-w-3xl">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">პროდუქტის დასახელება *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="მაგ: iPhone 16 Pro Max 256GB Black Titanium"
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">URL Slug (მისამართი)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="iphone-16-pro-max-256gb-black"
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">პროდუქტის სრული აღწერა</label>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ჩაწერეთ პროდუქტის დეტალური აღწერა..."
                className="w-full p-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="isFeatured" className="text-xs font-semibold text-gray-900 cursor-pointer">
                გამოჩნდეს რეკომენდებულ/Featured პროდუქტებში მთავარ გვერდზე
              </label>
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
              <label className="block text-xs font-bold text-gray-900 mb-1.5">ძირითადი ფასი (₾) *</label>
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
              <label className="block text-xs font-bold text-gray-900 mb-1.5">ფასდაკლებული ფასი (₾)</label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : "")}
                placeholder="2799"
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">მარაგის რაოდენობა (Stock) *</label>
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
              <label className="block text-xs font-bold text-gray-900 mb-1.5">SKU კოდი</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB 4: CATEGORY & BRAND */}
        {activeTab === "category" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">კატეგორია *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">ბრენდი *</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">გარანტია (თვეებში)</label>
              <input
                type="number"
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="freeShipping"
                checked={freeShipping}
                onChange={(e) => setFreeShipping(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
              <label htmlFor="freeShipping" className="text-xs font-semibold text-gray-900 cursor-pointer">
                უფასო მიწოდება მთელ საქართველოში
              </label>
            </div>
          </div>
        )}

        {/* TAB 5: VARIANTS */}
        {activeTab === "variants" && (
          <div className="space-y-6 max-w-3xl">
            <p className="text-xs text-gray-500">
              დაამატეთ ვარიანტები (მაგ: ფერები, მეხსიერების მოცულობები), რომლებიც გამოჩნდება პროდუქტის გვერდზე.
            </p>

            {variants.map((v, vIdx) => (
              <div key={v.id} className="p-4 border border-gray-200 rounded-2xl bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900">{v.name} ({v.options.length} ოპცია)</h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {v.options.map((opt, oIdx) => (
                    <div key={oIdx} className="p-2 bg-white border border-gray-200 rounded-xl text-xs flex items-center justify-between">
                      <span>{opt.label}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">მარაგშია</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 6: SPECS */}
        {activeTab === "specs" && (
          <div className="space-y-6 max-w-3xl">
            {specs.map((group, gIdx) => (
              <div key={gIdx} className="p-4 border border-gray-200 rounded-2xl bg-gray-50 space-y-3">
                <h4 className="text-xs font-bold text-gray-900">{group.title}</h4>
                <div className="space-y-2">
                  {group.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex gap-2">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => handleSpecChange(gIdx, iIdx, "label", e.target.value)}
                        placeholder="მახასიათებელი (მაგ: ეკრანი)"
                        className="w-1/3 h-9 px-3 rounded-xl border border-gray-200 text-xs bg-white"
                      />
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => handleSpecChange(gIdx, iIdx, "value", e.target.value)}
                        placeholder="მნიშვნელობა (მაგ: 6.3 OLED)"
                        className="flex-1 h-9 px-3 rounded-xl border border-gray-200 text-xs bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecItem(gIdx, iIdx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleAddSpecItem(gIdx)}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold cursor-pointer pt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ახალი მახასიათებლის დამატება</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 7: SEO */}
        {activeTab === "seo" && (
          <div className="space-y-4 max-w-3xl">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">SEO Title (სათაური)</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">Meta Description (აღწერა საძიებო სისტემებისთვის)</label>
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
