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
  AlertTriangle,
  FolderPlus
} from "lucide-react";
import { dataService } from "@/services/dataService";
import { Category, SubCategory } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    mobiles: true,
    tablets: true,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("Smartphone");

  useEffect(() => {
    setCategories(dataService.getCategories());
    const unsub = dataService.subscribe(() => {
      setCategories(dataService.getCategories());
    });
    return () => unsub();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAddRoot = () => {
    setEditingCategory(null);
    setParentCategoryId(null);
    setCategoryName("");
    setCategorySlug("");
    setCategoryIcon("Sparkles");
    setIsModalOpen(true);
  };

  const handleOpenAddChild = (parentId: string) => {
    setEditingCategory(null);
    setParentCategoryId(parentId);
    setCategoryName("");
    setCategorySlug("");
    setCategoryIcon("Sparkles");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setParentCategoryId(null);
    setCategoryName(cat.name);
    setCategorySlug(cat.slug);
    setCategoryIcon(cat.icon || "Sparkles");
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    if (editingCategory) {
      dataService.saveCategory({
        ...editingCategory,
        name: categoryName.trim(),
        slug: categorySlug.trim() || categoryName.toLowerCase().replace(/\s+/g, "-"),
        icon: categoryIcon,
      });
    } else if (parentCategoryId) {
      // Adding subcategory under existing parent
      const parentObj = categories.find((c) => c.id === parentCategoryId);
      if (parentObj) {
        const newSub: SubCategory = {
          id: `sub-${Date.now()}`,
          name: categoryName.trim(),
          slug: categorySlug.trim() || categoryName.toLowerCase().replace(/\s+/g, "-"),
          productCount: 0,
        };
        const updatedChildren = parentObj.children ? [...parentObj.children, newSub] : [newSub];
        dataService.saveCategory({
          ...parentObj,
          children: updatedChildren,
        });
      }
    } else {
      // Adding new root category
      dataService.saveCategory({
        name: categoryName.trim(),
        slug: categorySlug.trim() || categoryName.toLowerCase().replace(/\s+/g, "-"),
        icon: categoryIcon,
        children: [],
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`დარწმუნებული ხართ, რომ გსურთ კატეგორიის "${name}" წაშლა?`)) {
      dataService.deleteCategory(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">
            <span>სტრუქტურის მართვა</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            კატეგორიების იერარქია (Tree View)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            განუსაზღვრელი სიღრმის კატეგორიების, სუბკატეგორიების და ატრიბუტების მართვის ცენტრი.
          </p>
        </div>

        <button
          onClick={handleOpenAddRoot}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <FolderPlus className="w-4 h-4" />
          <span>მთავარი კატეგორიის დამატება</span>
        </button>
      </div>

      {/* 2. Category Tree Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-4">
        
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-blue-600" />
            <span>კატეგორიების ხე ({categories.length} მთავარი კატეგორია)</span>
          </h3>
          <span className="text-xs text-gray-400">დააჭირეთ ისარს სუბკატეგორიების გასაშლელად</span>
        </div>

        <div className="space-y-3">
          {categories.map((cat) => {
            const isExpanded = expandedIds[cat.id] ?? true;
            const hasChildren = cat.children && cat.children.length > 0;

            return (
              <div key={cat.id} className="border border-gray-200/80 rounded-2xl overflow-hidden bg-white">
                
                {/* Level 1 Category Row */}
                <div className="flex items-center justify-between p-3.5 bg-gray-50/80 hover:bg-gray-100/60 transition-colors select-none">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExpand(cat.id)}
                      className="p-1 text-gray-500 hover:text-gray-900 rounded-lg cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                      📁
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{cat.name}</h4>
                      <p className="text-[10px] text-gray-400 font-mono">slug: /{cat.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAddChild(cat.id)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>შვილის დამატება</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="რედაქტირება"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="წაშლა"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Level 2 Subcategories Grid */}
                {isExpanded && hasChildren && (
                  <div className="p-4 bg-white border-t border-gray-100 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pl-8">
                      {cat.children!.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3 border border-gray-200/80 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <h5 className="text-xs font-bold text-gray-900">{sub.name}</h5>
                            <p className="text-[10px] text-gray-400 font-mono">/{sub.slug}</p>
                            {sub.items && sub.items.length > 0 && (
                              <span className="text-[10px] text-blue-600 font-semibold block mt-0.5">
                                {sub.items.length} მოდელი / ბრენდი (Level 3)
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono bg-white px-2 py-0.5 rounded-full border border-gray-200">
                            L2
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

      {/* 3. Add/Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">
                {editingCategory
                  ? "კატეგორიის რედაქტირება"
                  : parentCategoryId
                  ? "სუბკატეგორიის (Child) დამატება"
                  : "ახალი მთავარი კატეგორიის დამატება"}
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
                <label className="block text-xs font-bold text-gray-900 mb-1">კატეგორიის დასახელება *</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    if (!editingCategory) {
                      setCategorySlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }
                  }}
                  placeholder="მაგ: მობილურები"
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  placeholder="mobiles"
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs font-mono text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">ხატულას სახელი (Lucide Icon)</label>
                <input
                  type="text"
                  value={categoryIcon}
                  onChange={(e) => setCategoryIcon(e.target.value)}
                  placeholder="Smartphone, Laptop, Tv, Camera..."
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
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
