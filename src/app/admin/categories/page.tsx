"use client";

import React, { useState, useEffect } from "react";
import { 
  FolderTree, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Layers, 
  Tag, 
  Check, 
  X,
  FolderPlus,
  CornerDownRight,
  Package
} from "lucide-react";
import { dataService } from "@/services/dataService";
import { Category, SubCategory, DeepCategoryItem } from "@/types";

type TargetType = 
  | { mode: "ADD_ROOT" }
  | { mode: "ADD_SUB"; parentId: string }
  | { mode: "ADD_ITEM"; parentId: string; subId: string }
  | { mode: "EDIT_ROOT"; category: Category }
  | { mode: "EDIT_SUB"; parentId: string; subCategory: SubCategory }
  | { mode: "EDIT_ITEM"; parentId: string; subId: string; item: DeepCategoryItem };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedRootIds, setExpandedRootIds] = useState<Record<string, boolean>>({
    mobiles: true,
    tablets: true,
    laptops: true,
    gaming: true,
  });

  const [expandedSubIds, setExpandedSubIds] = useState<Record<string, boolean>>({});

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<TargetType>({ mode: "ADD_ROOT" });

  // Form Inputs
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("Smartphone");

  useEffect(() => {
    setCategories(dataService.getCategories());
    const unsub = dataService.subscribe(() => {
      setCategories(dataService.getCategories());
    });
    return () => unsub();
  }, []);

  const toggleExpandRoot = (id: string) => {
    setExpandedRootIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpandSub = (id: string) => {
    setExpandedSubIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Open Modals ---
  const handleOpenAddRoot = () => {
    setModalTarget({ mode: "ADD_ROOT" });
    setName("");
    setSlug("");
    setIcon("Sparkles");
    setIsModalOpen(true);
  };

  const handleOpenAddSub = (parentId: string) => {
    setModalTarget({ mode: "ADD_SUB", parentId });
    setName("");
    setSlug("");
    setIcon("Folder");
    setIsModalOpen(true);
  };

  const handleOpenAddItem = (parentId: string, subId: string) => {
    setModalTarget({ mode: "ADD_ITEM", parentId, subId });
    setName("");
    setSlug("");
    setIcon("Tag");
    setIsModalOpen(true);
  };

  const handleOpenEditRoot = (cat: Category) => {
    setModalTarget({ mode: "EDIT_ROOT", category: cat });
    setName(cat.name);
    setSlug(cat.slug);
    setIcon(cat.icon || "Sparkles");
    setIsModalOpen(true);
  };

  const handleOpenEditSub = (parentId: string, sub: SubCategory) => {
    setModalTarget({ mode: "EDIT_SUB", parentId, subCategory: sub });
    setName(sub.name);
    setSlug(sub.slug);
    setIcon("Folder");
    setIsModalOpen(true);
  };

  const handleOpenEditItem = (parentId: string, subId: string, item: DeepCategoryItem) => {
    setModalTarget({ mode: "EDIT_ITEM", parentId, subId, item });
    setName(item.name);
    setSlug(item.slug);
    setIcon("Tag");
    setIsModalOpen(true);
  };

  // --- Form Submit ---
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedSlug = slug.trim() || name.toLowerCase().replace(/\s+/g, "-");

    if (modalTarget.mode === "ADD_ROOT") {
      dataService.saveCategory({
        name: name.trim(),
        slug: formattedSlug,
        icon,
        children: [],
      });
    } else if (modalTarget.mode === "EDIT_ROOT") {
      dataService.saveCategory({
        ...modalTarget.category,
        name: name.trim(),
        slug: formattedSlug,
        icon,
      });
    } else if (modalTarget.mode === "ADD_SUB") {
      const parent = categories.find((c) => c.id === modalTarget.parentId);
      if (parent) {
        const newSub: SubCategory = {
          id: `sub-${Date.now()}`,
          name: name.trim(),
          slug: formattedSlug,
          productCount: 0,
          items: [],
        };
        const updatedChildren = parent.children ? [...parent.children, newSub] : [newSub];
        dataService.saveCategory({ ...parent, children: updatedChildren });
      }
    } else if (modalTarget.mode === "EDIT_SUB") {
      const parent = categories.find((c) => c.id === modalTarget.parentId);
      if (parent && parent.children) {
        const updatedChildren = parent.children.map((sub) =>
          sub.id === modalTarget.subCategory.id
            ? { ...sub, name: name.trim(), slug: formattedSlug }
            : sub
        );
        dataService.saveCategory({ ...parent, children: updatedChildren });
      }
    } else if (modalTarget.mode === "ADD_ITEM") {
      const parent = categories.find((c) => c.id === modalTarget.parentId);
      if (parent && parent.children) {
        const updatedChildren = parent.children.map((sub) => {
          if (sub.id === modalTarget.subId) {
            const newItem: DeepCategoryItem = {
              id: `item-${Date.now()}`,
              name: name.trim(),
              slug: formattedSlug,
              productCount: 0,
            };
            const updatedItems = sub.items ? [...sub.items, newItem] : [newItem];
            return { ...sub, items: updatedItems };
          }
          return sub;
        });
        dataService.saveCategory({ ...parent, children: updatedChildren });
      }
    } else if (modalTarget.mode === "EDIT_ITEM") {
      const parent = categories.find((c) => c.id === modalTarget.parentId);
      if (parent && parent.children) {
        const updatedChildren = parent.children.map((sub) => {
          if (sub.id === modalTarget.subId && sub.items) {
            const updatedItems = sub.items.map((item) =>
              item.id === modalTarget.item.id
                ? { ...item, name: name.trim(), slug: formattedSlug }
                : item
            );
            return { ...sub, items: updatedItems };
          }
          return sub;
        });
        dataService.saveCategory({ ...parent, children: updatedChildren });
      }
    }

    setIsModalOpen(false);
  };

  // --- Deletions ---
  const handleDeleteRoot = (cat: Category) => {
    if (confirm(`დარწმუნებული ხართ, რომ გსურთ კატეგორიის "${cat.name}" წაშლა?`)) {
      dataService.deleteCategory(cat.id);
    }
  };

  const handleDeleteSub = (parentId: string, sub: SubCategory) => {
    if (confirm(`დარწმუნებული ხართ, რომ გსურთ სუბკატეგორიის "${sub.name}" წაშლა?`)) {
      const parent = categories.find((c) => c.id === parentId);
      if (parent && parent.children) {
        const updatedChildren = parent.children.filter((s) => s.id !== sub.id);
        dataService.saveCategory({ ...parent, children: updatedChildren });
      }
    }
  };

  const handleDeleteItem = (parentId: string, subId: string, item: DeepCategoryItem) => {
    if (confirm(`დარწმუნებული ხართ, რომ გსურთ Level 3 ელემენტის "${item.name}" წაშლა?`)) {
      const parent = categories.find((c) => c.id === parentId);
      if (parent && parent.children) {
        const updatedChildren = parent.children.map((sub) => {
          if (sub.id === subId && sub.items) {
            return { ...sub, items: sub.items.filter((i) => i.id !== item.id) };
          }
          return sub;
        });
        dataService.saveCategory({ ...parent, children: updatedChildren });
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">
            <span>3-Level იერარქიის მართვა</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            კატეგორიების ხე (Level 1 → Level 2 → Level 3)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            მთავარი კატეგორია (Level 1) ➔ სუბკატეგორია (Level 2) ➔ ჩამონათვალი/ბრენდები (Level 3, მაგ: Apple, Google, Xiaomi).
          </p>
        </div>

        <button
          onClick={handleOpenAddRoot}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <FolderPlus className="w-4 h-4" />
          <span>მთავარი კატეგორიის (L1) დამატება</span>
        </button>
      </div>

      {/* 2. Category Tree Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-4">
        
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-blue-600" />
            <span>კატეგორიების სრული იერარქია ({categories.length} მთავარი კატეგორია)</span>
          </h3>
        </div>

        <div className="space-y-4">
          {categories.map((root) => {
            const isRootExpanded = expandedRootIds[root.id] ?? true;
            const hasSubcategories = root.children && root.children.length > 0;

            return (
              <div key={root.id} className="border border-gray-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
                
                {/* LEVEL 1 ROW */}
                <div className="flex items-center justify-between p-4 bg-gray-50/90 hover:bg-gray-100/70 transition-colors select-none">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExpandRoot(root.id)}
                      className="p-1 text-gray-500 hover:text-gray-900 rounded-lg cursor-pointer"
                    >
                      {isRootExpanded ? (
                        <ChevronDown className="w-4.5 h-4.5 text-blue-600" />
                      ) : (
                        <ChevronRight className="w-4.5 h-4.5 text-gray-400" />
                      )}
                    </button>
                    <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200/50">
                      📁
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900">{root.name}</h4>
                        <span className="px-2 py-0.5 text-[9px] bg-blue-600 text-white rounded-full font-bold uppercase tracking-wider">
                          Level 1
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-mono">slug: /{root.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAddSub(root.id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Level 2-ის დამატება</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditRoot(root)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-xl transition-colors cursor-pointer"
                      title="რედაქტირება"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoot(root)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-xl transition-colors cursor-pointer"
                      title="წაშლა"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* LEVEL 2 & LEVEL 3 CONTAINER */}
                {isRootExpanded && hasSubcategories && (
                  <div className="p-4 bg-white border-t border-gray-100 space-y-4">
                    {root.children!.map((sub) => {
                      const isSubExpanded = expandedSubIds[sub.id] ?? true;
                      const hasItems = sub.items && sub.items.length > 0;

                      return (
                        <div key={sub.id} className="ml-4 pl-4 border-l-2 border-blue-200/60 space-y-3">
                          
                          {/* LEVEL 2 ROW */}
                          <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-colors">
                            <div className="flex items-center gap-2.5">
                              <button
                                onClick={() => toggleExpandSub(sub.id)}
                                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                              >
                                {isSubExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-slate-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                              <CornerDownRight className="w-4 h-4 text-blue-500 shrink-0" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="text-xs font-bold text-slate-900">{sub.name}</h5>
                                  <span className="px-2 py-0.5 text-[9px] bg-slate-700 text-white rounded-full font-semibold">
                                    Level 2
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-mono">/{sub.slug}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* + Level 3 Button (Apple, Google, Xiaomi) */}
                              <button
                                onClick={() => handleOpenAddItem(root.id, sub.id)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>+ Level 3-ის დამატება (მაგ: Apple)</span>
                              </button>
                              <button
                                onClick={() => handleOpenEditSub(root.id, sub)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                                title="რედაქტირება"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSub(root.id, sub)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                                title="წაშლა"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* LEVEL 3 ITEMS GRID (Apple, Google, Samsung, etc.) */}
                          {isSubExpanded && (
                            <div className="ml-8 pt-1">
                              {hasItems ? (
                                <div className="flex flex-wrap gap-2">
                                  {sub.items!.map((item) => (
                                    <div
                                      key={item.id}
                                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:border-blue-400 rounded-xl text-xs shadow-2xs group transition-all"
                                    >
                                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                                      <span className="font-bold text-gray-900">{item.name}</span>
                                      <span className="text-[9px] text-gray-400 font-mono">({item.slug})</span>
                                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-bold rounded">
                                        L3
                                      </span>

                                      <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity ml-1 pl-1 border-l border-gray-200">
                                        <button
                                          onClick={() => handleOpenEditItem(root.id, sub.id, item)}
                                          className="p-1 text-gray-400 hover:text-blue-600 rounded cursor-pointer"
                                          title="რედაქტირება"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteItem(root.id, sub.id, item)}
                                          className="p-1 text-gray-400 hover:text-red-600 rounded cursor-pointer"
                                          title="წაშლა"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-[11px] text-gray-400 italic py-1">
                                  Level 3 ელემენტები (ბრენდები/ტიპები) ჯერ არ არის დამატებული. დააჭირეთ "+ Level 3-ის დამატება" ღილაკს.
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

      {/* 3. Universal Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">
                {modalTarget.mode === "ADD_ROOT" && "ახალი მთავარი კატეგორიის (Level 1) დამატება"}
                {modalTarget.mode === "EDIT_ROOT" && "მთავარი კატეგორიის (Level 1) რედაქტირება"}
                {modalTarget.mode === "ADD_SUB" && "ახალი სუბკატეგორიის (Level 2) დამატება"}
                {modalTarget.mode === "EDIT_SUB" && "სუბკატეგორიის (Level 2) რედაქტირება"}
                {modalTarget.mode === "ADD_ITEM" && "Level 3 ელემენტის დამატება (მაგ: Apple, Google, Xiaomi)"}
                {modalTarget.mode === "EDIT_ITEM" && "Level 3 ელემენტის რედაქტირება"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  {modalTarget.mode.includes("ITEM") ? "Level 3 ელემენტის დასახელება (მაგ: Apple) *" : "კატეგორიის დასახელება *"}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!modalTarget.mode.startsWith("EDIT")) {
                      setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }
                  }}
                  placeholder={modalTarget.mode.includes("ITEM") ? "მაგ: Apple" : "მაგ: მობილურები"}
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="apple"
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs font-mono text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {modalTarget.mode.includes("ROOT") && (
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">ხატულას სახელი (Lucide Icon)</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="Smartphone, Laptop, Tv, Camera..."
                    className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
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
