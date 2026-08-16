"use client";

import React, { useState, useEffect } from "react";
import { Navigation, Plus, ArrowUp, ArrowDown, Trash2, Edit3, Check, X, ExternalLink, Power, Loader2, RefreshCw } from "lucide-react";
import { useStore } from "@/store/useStore";

export interface NavigationItemData {
  id: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminNavigationBuilderPage() {
  const { addToast } = useStore();
  const [items, setItems] = useState<NavigationItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItemData | null>(null);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/navigation");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch navigation items:", err);
      addToast({
        title: "შეცდომა",
        message: "ნავიგაციის ელემენტების ჩატვირთვა ვერ მოხერხდა",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setLabel("");
    setUrl("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NavigationItemData) => {
    setEditingItem(item);
    setLabel(item.label);
    setUrl(item.url);
    setIsActive(item.isActive ?? true);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !url.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        id: editingItem ? editingItem.id : undefined,
        label: label.trim(),
        url: url.trim(),
        order: editingItem ? editingItem.order : items.length + 1,
        isActive,
      };

      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        addToast({
          title: editingItem ? "ნავიგაცია განახლდა" : "ნავიგაცია დაემატა",
          message: `"${label}" წარმატებით შეინახა`,
          type: "success",
        });
        setIsModalOpen(false);
        fetchItems();
      } else {
        throw new Error(json.message || "შენახვა ვერ მოხერხდა");
      }
    } catch (err: any) {
      console.error("handleSave error:", err);
      addToast({
        title: "შეცდომა",
        message: err.message || "ნავიგაციის შენახვისას დაფიქსირდა შეცდომა",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: NavigationItemData) => {
    const nextActive = !item.isActive;
    try {
      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          isActive: nextActive,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, isActive: nextActive } : it))
        );
        addToast({
          title: "სტატუსი განახლდა",
          message: `"${item.label}" ${nextActive ? "გააქტიურდა" : "გაითიშა"}`,
          type: "info",
        });
      }
    } catch (err) {
      console.error("handleToggleStatus error:", err);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const reorderPayload = newItems.map((it, idx) => ({
      id: it.id,
      order: idx + 1,
    }));

    setItems(newItems.map((it, idx) => ({ ...it, order: idx + 1 })));

    try {
      await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorder: reorderPayload }),
      });
      addToast({
        title: "თანმიმდევრობა შენახულია",
        message: "ნავიგაციის რიგითობა განახლდა ბაზაში",
        type: "success",
      });
    } catch (err) {
      console.error("handleMove error:", err);
    }
  };

  const handleDelete = async (id: string, itemLabel: string) => {
    if (!confirm(`დარწმუნებული ხართ, რომ გსურთ "${itemLabel}"-ის წაშლა?`)) return;

    try {
      const res = await fetch(`/api/admin/navigation?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setItems((prev) => prev.filter((it) => it.id !== id));
        addToast({
          title: "ელემენტი წაიშალა",
          message: `"${itemLabel}" წაიშალა MySQL ბაზიდან`,
          type: "success",
        });
      } else {
        throw new Error(json.message || "წაშლა ვერ მოხერხდა");
      }
    } catch (err: any) {
      console.error("handleDelete error:", err);
      addToast({
        title: "შეცდომა",
        message: err.message || "წაშლისას დაფიქსირდა შეცდომა",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs">
            <Navigation className="w-3.5 h-3.5" />
            <span>Storefront მენიუ</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight">
            ნავიგაციის მართვა ({items.length})
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Storefront Header და MegaMenu-ს მთავარი ბმულების და რიგითობის მართვა.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchItems}
            className="h-11 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
            title="განახლება"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">განახლება</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>ახალი ბმულის დამატება</span>
          </button>
        </div>
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200/80">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
          <span>იტვირთება ნავიგაციის მენიუ...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80">
          <Navigation className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm text-slate-700">ნავიგაციის ბმულები არ არის</h3>
          <p className="text-xs text-slate-400">დაამატეთ მენიუს პირველი ელემენტი</p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ბმულის დამატება</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 md:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 hover:border-slate-300 transition-all"
            >
              {/* Left: Reorder & Info */}
              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, "up")}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      index === 0 ? "text-slate-200" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                    title="ზემოთ გადატანა"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => handleMove(index, "down")}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      index === items.length - 1 ? "text-slate-200" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                    title="ქვემოთ გადატანა"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Badge & Order */}
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 font-mono text-xs flex items-center justify-center shrink-0">
                  #{item.order}
                </div>

                {/* Label & URL */}
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm text-slate-900 truncate">{item.label}</h3>
                  </div>
                  <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                    <span className="text-blue-600 truncate">{item.url}</span>
                  </p>
                </div>
              </div>

              {/* Right: Status Toggle & Actions */}
              <div className="flex items-center justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-all flex items-center gap-1.5 ${
                    item.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  <Power className="w-3 h-3" />
                  <span>{item.isActive ? "აქტიური" : "გათიშული"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="h-9 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
                  title="რედაქტირება"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>შეცვლა</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.label)}
                  className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                  title="წაშლა"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 md:p-8 border border-slate-100 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base text-slate-900">
                {editingItem ? `ნავიგაციის რედაქტირება: ${editingItem.label}` : "ახალი ბმულის დამატება"}
              </h3>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1">დასახელება (Label) *</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="მაგ: მობილურები, აქციები, ბლოგი..."
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">ბმული (URL) *</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="მაგ: /catalog?category=smartphones ან /promotions"
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="navIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
                <label htmlFor="navIsActive" className="text-slate-700 cursor-pointer">
                  აქტიურია (ჩანს Storefront მენიუში)
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? "შენახვა" : "დამატება"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
