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
  ChevronRight
} from "lucide-react";
import { dataService } from "@/services/dataService";
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

  const swiperPrevRef = useRef<HTMLButtonElement>(null);
  const swiperNextRef = useRef<HTMLButtonElement>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({ mode: "ADD_L1" });
  const [inputName, setInputName] = useState("");
  const [inputSlug, setInputSlug] = useState("");

  useEffect(() => {
    const loaded = dataService.getCategories();
    setCategories([...loaded]);

    if (loaded.length > 0 && !selectedL1Id) {
      setSelectedL1Id(loaded[0].id);
    }

    const unsub = dataService.subscribe(() => {
      const updated = dataService.getCategories();
      setCategories([...updated]);
      if (updated.length > 0 && (!selectedL1Id || !updated.some((c) => c.id === selectedL1Id))) {
        setSelectedL1Id(updated[0].id);
      }
    });
    return () => unsub();
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
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    const finalSlug = inputSlug.trim() || inputName.toLowerCase().replace(/\s+/g, "-");

    if (modalState.mode === "ADD_L1" || modalState.mode === "EDIT_L1") {
      const editId = modalState.mode === "EDIT_L1" ? modalState.category.id : undefined;
      const existing = modalState.mode === "EDIT_L1" ? modalState.category : {};
      dataService.saveCategory({
        ...existing,
        id: editId,
        name: inputName.trim(),
        slug: finalSlug,
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
        dataService.saveCategory({ ...l1, children: updatedChildren });
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
        dataService.saveCategory({ ...l1, children: updatedChildren });
      }
    }

    setIsModalOpen(false);
  };

  // --- Deletes ---
  const handleDeleteL1 = (id: string, name: string) => {
    if (confirm(`გსურთ მთავარი კატეგორიის "${name}" წაშლა?`)) {
      dataService.deleteCategory(id);
      if (selectedL1Id === id) setSelectedL1Id(null);
    }
  };

  const handleDeleteL2 = (l2Id: string, name: string) => {
    if (!activeCategory || !activeCategory.children) return;
    if (confirm(`გსურთ ქვეკატეგორიის "${name}" წაშლა?`)) {
      const updated = activeCategory.children.filter((s) => s.id !== l2Id);
      dataService.saveCategory({ ...activeCategory, children: updated });
    }
  };

  const handleDeleteL3 = (l2Id: string, l3Id: string, name: string) => {
    if (!activeCategory || !activeCategory.children) return;
    if (confirm(`გსურთ "${name}" წაშლა?`)) {
      const updated = activeCategory.children.map((sub) => {
        if (sub.id === l2Id && sub.items) {
          return { ...sub, items: sub.items.filter((i) => i.id !== l3Id) };
        }
        return sub;
      });
      dataService.saveCategory({ ...activeCategory, children: updated });
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
            აირჩიეთ მთავარი კატეგორია Swiper ტაბებიდან და მართეთ მისი ქვეკატეგორიები და ბრენდები.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddL1}
          className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-xs hover:shadow-md shrink-0"
        >
          <FolderPlus className="w-4 h-4" />
          <span>+ ახალი მთავარი კატეგორია</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ძიება: კატეგორიები, ქვეკატეგორიები, ბრენდები..."
            className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Official Swiper React Carousel Deck */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs relative flex items-center gap-2.5">
        
        {/* Navigation Prev Button */}
        <button
          ref={swiperPrevRef}
          type="button"
          className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-2xs z-10"
          title="მარცხნივ"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Swiper Slider */}
        <div className="flex-1 overflow-hidden">
          <Swiper
            modules={[Navigation, FreeMode, Mousewheel]}
            slidesPerView="auto"
            spaceBetween={10}
            freeMode={true}
            mousewheel={{ forceToAxis: true }}
            navigation={{
              prevEl: swiperPrevRef.current,
              nextEl: swiperNextRef.current,
            }}
            onBeforeInit={(swiper) => {
              // @ts-ignore
              swiper.params.navigation.prevEl = swiperPrevRef.current;
              // @ts-ignore
              swiper.params.navigation.nextEl = swiperNextRef.current;
            }}
            className="w-full select-none"
          >
            {filteredCategories.map((cat) => {
              const isSelected = activeCategory?.id === cat.id;

              return (
                <SwiperSlide key={cat.id} style={{ width: "auto" }}>
                  <button
                    type="button"
                    onClick={() => setSelectedL1Id(cat.id)}
                    className={`h-11 px-4.5 rounded-2xl text-xs flex items-center gap-3 shrink-0 transition-all cursor-pointer select-none ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-xs border border-slate-900"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-blue-400 animate-pulse" : "bg-slate-300"}`} />
                    <span className="whitespace-nowrap font-medium">{cat.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                    }`}>
                      {cat.children?.length || 0}
                    </span>
                  </button>
                </SwiperSlide>
              );
            })}

            <SwiperSlide style={{ width: "auto" }}>
              <button
                type="button"
                onClick={handleOpenAddL1}
                className="h-11 px-4 rounded-2xl text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer border border-dashed border-blue-200 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ახალი L1</span>
              </button>
            </SwiperSlide>
          </Swiper>
        </div>

        {/* Navigation Next Button */}
        <button
          ref={swiperNextRef}
          type="button"
          className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-2xs z-10"
          title="მარჯვნივ"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>

      {/* Active Main Category Dedicated Workspace Card */}
      {activeCategory ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6">
          
          {/* Custom Hero Card for Active Category */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-200/80">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-blue-600 shrink-0">
                <FolderTree className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg text-slate-900">{activeCategory.name}</h2>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-full text-[10px] font-mono uppercase">
                    მთავარი კატეგორია (L1)
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">URL Path: /catalog/{activeCategory.slug}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenAddL2()}
                className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ L2 ქვეკატეგორიის დამატება</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenEditL1(activeCategory)}
                className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                title="კატეგორიის რედაქტირება"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleDeleteL1(activeCategory.id, activeCategory.name)}
                className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
                title="კატეგორიის წაშლა"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subcategories (L2) Grid Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm text-slate-900 flex items-center gap-2">
                <Folder className="w-4 h-4 text-blue-600" />
                <span>ქვეკატეგორიები ({activeCategory.children?.length || 0})</span>
              </h3>
            </div>

            {activeCategory.children && activeCategory.children.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {activeCategory.children.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                  >
                    
                    {/* L2 Subcategory Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-600" />
                          <h4 className="text-sm text-slate-900">{sub.name}</h4>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono pl-4">/{sub.slug}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenAddL3(sub)}
                          className="h-8 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 rounded-xl text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ L3 ელემენტი</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditL2(sub)}
                          className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteL2(sub.id, sub.name)}
                          className="w-8 h-8 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* L3 Deep Items Tags Grid */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">L3 ელემენტები / ბრენდები:</span>
                        <span className="text-slate-400 font-mono">{sub.items?.length || 0}</span>
                      </div>

                      {sub.items && sub.items.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {sub.items.map((item) => (
                            <div
                              key={item.id}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs text-slate-800 flex items-center gap-2 group transition-all"
                            >
                              <Tag className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{item.name}</span>
                              
                              <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditL3(sub.id, item)}
                                  className="text-slate-400 hover:text-blue-600 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteL3(sub.id, item.id, item.name)}
                                  className="text-slate-400 hover:text-red-600 cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">L3 ელემენტები ჯერ არ არის დამატებული</p>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs">
                ამ კატეგორიას ქვეკატეგორიები ჯერ არ აქვს. გამოიყენეთ "+ L2 ქვეკატეგორიის დამატება" ღილაკი.
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 text-slate-400 text-xs">
          კატეგორიები ვერ მოიძებნა
        </div>
      )}

      {/* Unified Hierarchical Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 border border-slate-100 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base text-slate-900">
                  {modalState.mode.startsWith("EDIT") ? "რედაქტირება" : "ახალი კატეგორია / ქვეკატეგორია"}
                </h3>
                {modalState.mode === "ADD_L2" && (
                  <p className="text-xs text-blue-600">მშობელი: {modalState.parentL1Name}</p>
                )}
                {modalState.mode === "ADD_L3" && (
                  <p className="text-xs text-indigo-600">გზა: {modalState.parentPath}</p>
                )}
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1">დასახელება *</label>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => {
                    setInputName(e.target.value);
                    if (!modalState.mode.startsWith("EDIT")) {
                      setInputSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }
                  }}
                  placeholder={
                    modalState.mode.includes("L3")
                      ? "მაგ: Apple, For Google..."
                      : modalState.mode.includes("L2")
                      ? "მაგ: ბრენდები, მობილურის ჩასადებები..."
                      : "მაგ: მობილურები..."
                  }
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={inputSlug}
                  onChange={(e) => setInputSlug(e.target.value)}
                  placeholder="slug"
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs font-mono text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs transition-colors cursor-pointer shadow-xs"
                >
                  შენახვა
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
