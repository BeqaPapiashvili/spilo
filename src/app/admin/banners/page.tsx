"use client";

import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Plus, Trash2, X, Check, Edit3, ExternalLink, ArrowUp, ArrowDown, Power, Loader2, RefreshCw } from "lucide-react";
import { useStore } from "@/store/useStore";
import { ImageUploader } from "@/components/admin/ImageUploader";

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  link?: string;
  image?: string;
  imageDesktop?: string;
  position: "HERO" | "MID_PAGE" | "CATEGORY" | "SIDEBAR";
  isActive: boolean;
  priority: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminBannersPage() {
  const { addToast } = useStore();
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaText, setCtaText] = useState("ნახვა");
  const [ctaLink, setCtaLink] = useState("/catalog");
  const [imageUrl, setImageUrl] = useState("");
  const [position, setPosition] = useState<"HERO" | "MID_PAGE" | "CATEGORY" | "SIDEBAR">("HERO");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/banners");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setBanners(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch banners:", err);
      addToast({
        title: "შეცდომა",
        message: "ბანერების ჩატვირთვა ვერ მოხერხდა",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setTitle("");
    setSubtitle("");
    setCtaText("ნახვა");
    setCtaLink("/catalog");
    setImageUrl("");
    setPosition("HERO");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: BannerItem) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || "");
    setCtaText(banner.ctaText || "ნახვა");
    setCtaLink(banner.ctaLink || banner.link || "/catalog");
    setImageUrl(banner.imageDesktop || banner.image || "");
    setPosition(banner.position || "HERO");
    setIsActive(banner.isActive ?? true);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        id: editingBanner ? editingBanner.id : undefined,
        title: title.trim(),
        subtitle: subtitle.trim(),
        ctaText: ctaText.trim() || "ნახვა",
        ctaLink: ctaLink.trim() || "/catalog",
        imageDesktop: imageUrl.trim(),
        image: imageUrl.trim(),
        position,
        isActive,
        priority: editingBanner ? editingBanner.priority : banners.length + 1,
      };

      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        addToast({
          title: editingBanner ? "ბანერი განახლდა" : "ბანერი შეიქმნა",
          message: `${title} წარმატებით შეინახა MySQL ბაზაში`,
          type: "success",
        });
        setIsModalOpen(false);
        fetchBanners();
      } else {
        throw new Error(json.error || "შენახვა ვერ მოხერხდა");
      }
    } catch (err: any) {
      console.error("handleSave error:", err);
      addToast({
        title: "შეცდომა",
        message: err.message || "ბანერის შენახვისას დაფიქსირდა შეცდომა",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (banner: BannerItem) => {
    const nextActive = !banner.isActive;
    try {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...banner,
          isActive: nextActive,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setBanners((prev) =>
          prev.map((b) => (b.id === banner.id ? { ...b, isActive: nextActive } : b))
        );
        addToast({
          title: "სტატუსი განახლდა",
          message: `ბანერი "${banner.title}" ${nextActive ? "გააქტიურდა" : "გაითიშა"}`,
          type: "info",
        });
      }
    } catch (err) {
      console.error("handleToggleStatus error:", err);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    // Update priorities
    const reorderPayload = newBanners.map((b, idx) => ({
      id: b.id,
      priority: idx + 1,
    }));

    setBanners(newBanners.map((b, idx) => ({ ...b, priority: idx + 1 })));

    try {
      await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorder: reorderPayload }),
      });
      addToast({
        title: "თანმიმდევრობა შენახულია",
        message: "ბანერების პრიორიტეტი განახლდა ბაზაში",
        type: "success",
      });
    } catch (err) {
      console.error("handleMove error:", err);
    }
  };

  const handleDelete = async (id: string, bannerTitle: string) => {
    if (!confirm(`დარწმუნებული ხართ, რომ გსურთ ბანერის "${bannerTitle}" წაშლა?`)) return;

    try {
      const res = await fetch(`/api/banners?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
        addToast({
          title: "ბანერი წაიშალა",
          message: `ბანერი "${bannerTitle}" წაიშალა MySQL ბაზიდან`,
          type: "success",
        });
      } else {
        throw new Error(json.error || "წაშლა ვერ მოხერხდა");
      }
    } catch (err: any) {
      console.error("handleDelete error:", err);
      addToast({
        title: "შეცდომა",
        message: err.message || "ბანერის წაშლისას დაფიქსირდა შეცდომა",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>მარკეტინგი & Storefront</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight">
            ბანერები ({banners.length})
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Hero Slider, Promotional და Sidebar ბანერების მართვა პირდაპირ MySQL ბაზაში.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchBanners}
            className="h-11 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
            title="განახლება"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">განახლება</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>ახალი ბანერი</span>
          </button>
        </div>
      </div>

      {/* Banners List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 md:p-5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-6 h-12 bg-slate-100 rounded-lg" />
                <div className="w-28 h-16 bg-slate-200 rounded-2xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded-md w-48" />
                  <div className="h-3 bg-slate-100 rounded-md w-32" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-8 bg-slate-100 rounded-full" />
                <div className="w-8 h-8 bg-slate-200 rounded-xl" />
                <div className="w-8 h-8 bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80">
          <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm text-slate-700">ბანერები ვერ მოიძებნა</h3>
          <p className="text-xs text-slate-400">დაამატეთ პირველი ბანერი Storefront-ისთვის</p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ბანერის დამატება</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner, index) => {
            const img = banner.imageDesktop || banner.image;
            return (
              <div
                key={banner.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 md:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 hover:border-slate-300 transition-all"
              >
                {/* Left: Reorder Arrows & Image & Info */}
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                  {/* Reorder Up/Down */}
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
                      disabled={index === banners.length - 1}
                      onClick={() => handleMove(index, "down")}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        index === banners.length - 1 ? "text-slate-200" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                      title="ქვემოთ გადატანა"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="w-24 h-16 sm:w-32 sm:h-20 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                    {img ? (
                      <img src={img} alt={banner.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-mono">
                        {banner.position}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        #{banner.priority}
                      </span>
                    </div>
                    <h3 className="text-sm text-slate-900 truncate">{banner.title}</h3>
                    {banner.subtitle && <p className="text-xs text-slate-400 truncate">{banner.subtitle}</p>}
                    <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <span>ლინკი:</span>
                      <span className="text-blue-600 truncate">{banner.ctaLink || banner.link || "/catalog"}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Status Toggle & Edit / Delete */}
                <div className="flex items-center justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(banner)}
                    className={`px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-all flex items-center gap-1.5 ${
                      banner.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{banner.isActive ? "აქტიური" : "გათიშული"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(banner)}
                    className="h-9 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
                    title="რედაქტირება"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>შეცვლა</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(banner.id, banner.title)}
                    className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                    title="წაშლა"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 border border-slate-100 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base text-slate-900">
                {editingBanner ? `ბანერის რედაქტირება: ${editingBanner.title}` : "ახალი ბანერის შექმნა"}
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
              {/* Title */}
              <div>
                <label className="block text-slate-700 mb-1">სათაური *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="მაგ: ახალი თაობის MacBook Pro"
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-slate-700 mb-1">ქვესათაური / სლოგანი</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="მაg: შეიძინეთ 0%-იანი განვადებით"
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Position & CTA Text */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">პოზიცია Storefront-ზე</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as any)}
                    className="w-full h-11 px-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none cursor-pointer"
                  >
                    <option value="HERO">HERO Slider (მთავარი)</option>
                    <option value="MID_PAGE">MID_PAGE (შუა გვერდი)</option>
                    <option value="CATEGORY">CATEGORY (კატეგორია)</option>
                    <option value="SIDEBAR">SIDEBAR (გვერდითა)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">ღილაკის ტექსტი</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="ნახვა / ყიდვა"
                    className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Target Link */}
              <div>
                <label className="block text-slate-700 mb-1">გადასასვლელი ბმული (URL)</label>
                <input
                  type="text"
                  value={ctaLink}
                  onChange={(e) => setCtaLink(e.target.value)}
                  placeholder="/catalog ან /product/..."
                  className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Banner Image Uploader */}
              <div className="space-y-1.5">
                <label className="block text-slate-700">ბანერის სურათი (ატვირთვა ან URL)</label>
                <ImageUploader
                  images={imageUrl ? [imageUrl] : []}
                  onChange={(imgs) => setImageUrl(imgs[0] || "")}
                  multiple={false}
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="bannerIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
                <label htmlFor="bannerIsActive" className="text-slate-700 cursor-pointer">
                  აქტიურია (ჩანს Storefront-ზე)
                </label>
              </div>

              {/* Action Buttons */}
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
                  <span>{editingBanner ? "შენახვა" : "შექმნა"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
