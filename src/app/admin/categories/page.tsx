"use client";

import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Mousewheel } from "swiper/modules";
import { 
  FolderTree, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  X, 
  FolderPlus, 
  Folder, 
  Tag, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Category, SubCategory, DeepCategoryItem } from "@/types";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

type ModalState = 
  | { mode: "ADD_L1" }
  | { mode: "ADD_L2"; parentL1Id: string; parentL1Name: string }
  | { mode: "ADD_L3"; parentL1Id: string; parentL2Id: string; parentPath: string }
  | { mode: "EDIT_L1"; category: Category }
  | { mode: "EDIT_L2"; parentL1Id: string; subCategory: SubCategory }
  | { mode: "EDIT_L3"; parentL1Id: string; parentL2Id: string; item: DeepCategoryItem };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedL1Id, setSelectedL1Id] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const swiperPrevRef = useRef<HTMLButtonElement>(null);
  const swiperNextRef = useRef<HTMLButtonElement>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({ mode: "ADD_L1" });
  const [inputName, setInputName] = useState("");
  const [inputSlug, setInputSlug] = useState("");

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCategories(json.data);
        if (json.data.length > 0 && !selectedL1Id) {
          setSelectedL1Id(json.data[0].id);
        }
      }
    } catch (err) {
      console.error("AdminCategoriesPage: Failed to load categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const activeCategory = categories.find((c) => c.id === selectedL1Id) || categories[0];

  // Search Filtered Categories
  const filteredCategories = categories.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const matchL1 = c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
    const matchL2 = c.children?.some((s) => s.name.toLowerCase().includes(q) || s.items?.some((i) => i.name.toLowerCase().includes(q)));
    return matchL1 || matchL2;
  });

  // --- Open Modal Handlers ---
  const handleOpenAddL1 = () => {
    setModalState({ mode: "ADD_L1" });
    setInputName("");
    setInputSlug("");
    setIsModalOpen(true);
  };

  const handleOpenAddL2 = () => {
    if (!activeCategory) return;
    setModalState({ mode: "ADD_L2", parentL1Id: activeCategory.id, parentL1Name: activeCategory.name });
    setInputName("");
    setInputSlug("");
    setIsModalOpen(true);
  };

  const handleOpenAddL3 = (l2: SubCategory) => {
    if (!activeCategory) return;
    setModalState({ 
      mode: "ADD_L3", 
      parentL1Id: activeCategory.id, 
      parentL2Id: l2.id, 
      parentPath: `${activeCategory.name} > ${l2.name}` 
    });
    setInputName("");
    setInputSlug("");
    setIsModalOpen(true);
  };

  const handleOpenEditL1 = (l1: Category) => {
    setModalState({ mode: "EDIT_L1", category: l1 });
    setInputName(l1.name);
    setInputSlug(l1.slug);
    setIsModalOpen(true);
  };

  const handleOpenEditL2 = (l2: SubCategory) => {
    if (!activeCategory) return;
    setModalState({ mode: "EDIT_L2", parentL1Id: activeCategory.id, subCategory: l2 });
    setInputName(l2.name);
    setInputSlug(l2.slug);
    setIsModalOpen(true);
  };

  const handleOpenEditL3 = (l2Id: string, l3: DeepCategoryItem) => {
    if (!activeCategory) return;
    setModalState({ mode: "EDIT_L3", parentL1Id: activeCategory.id, parentL2Id: l2Id, item: l3 });
    setInputName(l3.name);
    setInputSlug(l3.slug);
    setIsModalOpen(true);
  };

  // --- Save Modal ---
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    setIsSaving(true);

    try {
      const finalSlug = inputSlug.trim() || inputName.toLowerCase().replace(/\s+/g, "-");

      if (modalState.mode === "ADD_L1") {
        await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: inputName.trim(),
            slug: finalSlug,
            icon: "Sparkles",
            children: [],
          }),
        });
      } else if (modalState.mode === "EDIT_L1") {
        await fetch("/api/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: modalState.category.id,
            name: inputName.trim(),
            slug: finalSlug,
          }),
        });
      } else if (modalState.mode === "ADD_L2" || modalState.mode === "EDIT_L2") {
        const l1 = categories.find((c) => c.id === modalState.parentL1Id);
        if (l1) {
          let updatedChildren = [...(l1.children || [])];
          if (modalState.mode === "ADD_L2") {
            updatedChildren.push({ id: `sub-${Date.now()}`, name: inputName.trim(), slug: finalSlug, items: [] });
          } else {
            updatedChildren = updatedChildren.map((s) => s.id === modalState.subCategory.id ? { ...s, name: inputName.trim(), slug: finalSlug } : s);
          }
          await fetch("/api/categories", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: l1.id, children: updatedChildren }),
          });
        }
      } else if (modalState.mode === "ADD_L3" || modalState.mode === "EDIT_L3") {
        const l1 = categories.find((c) => c.id === modalState.parentL1Id);
        if (l1 && l1.children) {
          const updatedChildren = l1.children.map((sub) => {
            if (sub.id === modalState.parentL2Id) {
              let updatedItems = [...(sub.items || [])];
              if (modalState.mode === "ADD_L3") {
                updatedItems.push({ id: `item-${Date.now()}`, name: inputName.trim(), slug: finalSlug });
              } else {
                updatedItems = updatedItems.map((i) => i.id === modalState.item.id ? { ...i, name: inputName.trim(), slug: finalSlug } : i);
              }
              return { ...sub, items: updatedItems };
            }
            return sub;
          });
          await fetch("/api/categories", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: l1.id, children: updatedChildren }),
          });
        }
      }

      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      console.error("Failed to save category:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Deletes ---
  const handleDeleteL1 = async (id: string, name: string) => {
    if (confirm(`გსურთ მთავარი კატეგორიის "${name}" წაშლა?`)) {
      try {
        await fetch(`/api/categories?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        if (selectedL1Id === id) setSelectedL1Id(null);
        loadCategories();
      } catch (err) {
        console.error("Delete L1 error:", err);
      }
    }
  };

  const handleDeleteL2 = async (l2Id: string, name: string) => {
    if (!activeCategory || !activeCategory.children) return;
    if (confirm(`გსურთ ქვეკატეგორიის "${name}" წაშლა?`)) {
      try {
        const updated = activeCategory.children.filter((s) => s.id !== l2Id);
        await fetch("/api/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: activeCategory.id, children: updated }),
        });
        loadCategories();
      } catch (err) {
        console.error("Delete L2 error:", err);
      }
    }
  };

  const handleDeleteL3 = async (l2Id: string, l3Id: string, name: string) => {
    if (!activeCategory || !activeCategory.children) return;
    if (confirm(`გსურთ "${name}" წაშლა?`)) {
      try {
        const updated = activeCategory.children.map((sub) => {
          if (sub.id === l2Id && sub.items) {
            return { ...sub, items: sub.items.filter((i) => i.id !== l3Id) };
          }
          return sub;
        });
        await fetch("/api/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: activeCategory.id, children: updated }),
        });
        loadCategories();
      } catch (err) {
        console.error("Delete L3 error:", err);
      }
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>კატალოგის არქიტექტურა</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight">
            კატეგორიები & ქვეკატეგორიები ({categories.length})
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            მართეთ 3-დონიანი იერარქია: მთავარი კატეგორიები, ქვეკატეგორიები და დეტალური ჯგუფები.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddL1}
          className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <FolderPlus className="w-4 h-4" />
          <span>ახალი მთავარი კატეგორია</span>
        </button>
      </div>

      {/* Level 1 Swiper Carousel Navigation */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs relative">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <Folder className="w-4 h-4 text-blue-600" />
            <span>მთავარი კატეგორიები (დონე 1)</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              ref={swiperPrevRef}
              className="w-8 h-8 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              ref={swiperNextRef}
              className="w-8 h-8 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 py-1 overflow-x-auto animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 w-32 bg-slate-100 rounded-xl shrink-0" />
            ))}
          </div>
        ) : (
          <Swiper
            modules={[Navigation, FreeMode, Mousewheel]}
            navigation={{
              prevEl: swiperPrevRef.current,
              nextEl: swiperNextRef.current,
            }}
            onBeforeInit={(swiper: any) => {
              swiper.params.navigation.prevEl = swiperPrevRef.current;
              swiper.params.navigation.nextEl = swiperNextRef.current;
            }}
            slidesPerView="auto"
            spaceBetween={12}
            freeMode={true}
            mousewheel={{ forceToAxis: true }}
            className="w-full"
          >
            {categories.map((cat) => {
              const isSelected = selectedL1Id === cat.id;
              return (
                <SwiperSlide key={cat.id} className="!w-auto">
                  <div
                    onClick={() => setSelectedL1Id(cat.id)}
                    className={`px-4 py-2.5 rounded-xl border text-xs flex items-center gap-2 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-50 border-blue-300 text-blue-800 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-60">({cat.children?.length || 0})</span>
                    <div className="flex items-center gap-0.5 ml-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleOpenEditL1(cat); }}
                        className="p-1 hover:text-blue-600 rounded"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteL1(cat.id, cat.name); }}
                        className="p-1 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>

      {/* Subcategories (Level 2 & 3) Tree Panel */}
      {activeCategory && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg text-slate-900 flex items-center gap-2">
                <span>{activeCategory.name}</span>
                <span className="text-xs text-slate-400 font-mono">({activeCategory.slug})</span>
              </h2>
              <p className="text-xs text-slate-500">ქვეკატეგორიებისა და ჯგუფების იერარქია</p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddL2}
              className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ქვეკატეგორიის დამატება (დონე 2)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCategory.children && activeCategory.children.length > 0 ? (
              activeCategory.children.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm text-slate-900">{sub.name}</h3>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditL2(sub)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteL2(sub.id, sub.name)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Level 3 Items */}
                    <div className="space-y-1.5 pl-2 border-l-2 border-blue-200">
                      {sub.items && sub.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs text-slate-600">
                          <span>{item.name}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditL3(sub.id, item)}
                              className="p-1 text-slate-400 hover:text-blue-600"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteL3(sub.id, item.id, item.name)}
                              className="p-1 text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenAddL3(sub)}
                    className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>ჯგუფის დამატება (დონე 3)</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-xs text-slate-400">
                ქვეკატეგორიები არ არის დამატებული.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base text-slate-900">
                {modalState.mode === "ADD_L1" && "ახალი მთავარი კატეგორია"}
                {modalState.mode === "EDIT_L1" && "მთავარი კატეგორიის რედაქტირება"}
                {modalState.mode === "ADD_L2" && "ახალი ქვეკატეგორია (დონე 2)"}
                {modalState.mode === "EDIT_L2" && "ქვეკატეგორიის რედაქტირება"}
                {modalState.mode === "ADD_L3" && "ახალი ჯგუფი (დონე 3)"}
                {modalState.mode === "EDIT_L3" && "ჯგუფის რედაქტირება"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-700 mb-1">დასახელება *</label>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => {
                    setInputName(e.target.value);
                    if (!inputSlug) setInputSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                  placeholder="მაგ: სმარტფონები, Apple, iPhone 16"
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={inputSlug}
                  onChange={(e) => setInputSlug(e.target.value)}
                  placeholder="smartphones"
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-colors"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>შენახვა</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
