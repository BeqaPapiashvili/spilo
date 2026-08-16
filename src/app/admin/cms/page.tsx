"use client";

import React, { useState, useEffect } from "react";
import { FileText, Edit3, Plus, Trash2, Check, X, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { useStore } from "@/store/useStore";
import Link from "next/link";

export interface CMSPageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminCMSPagesPage() {
  const { addToast } = useStore();
  const [pages, setPages] = useState<CMSPageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CMSPageData | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/cms");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPages(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch CMS pages:", err);
      addToast({
        title: "შეცდომა",
        message: "CMS გვერდების ჩატვირთვა ვერ მოხერხდა",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleOpenAdd = () => {
    setEditingPage(null);
    setTitle("");
    setSlug("");
    setContent("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (page: CMSPageData) => {
    setEditingPage(page);
    setTitle(page.title);
    setSlug(page.slug);
    setContent(page.content);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        id: editingPage ? editingPage.id : undefined,
        title: title.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
        content: content.trim(),
      };

      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        addToast({
          title: editingPage ? "გვერდი განახლდა" : "გვერდი შეიქმნა",
          message: `"${title}" წარმატებით შეინახა`,
          type: "success",
        });
        setIsModalOpen(false);
        fetchPages();
      } else {
        throw new Error(json.message || "შენახვა ვერ მოხერხდა");
      }
    } catch (err: any) {
      console.error("handleSave error:", err);
      addToast({
        title: "შეცდომა",
        message: err.message || "გვერდის შენახვისას დაფიქსირდა შეცდომა",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, pageTitle: string) => {
    if (!confirm(`დარწმუნებული ხართ, რომ გსურთ გვერდის "${pageTitle}" წაშლა?`)) return;

    try {
      const res = await fetch(`/api/admin/cms?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setPages((prev) => prev.filter((p) => p.id !== id));
        addToast({
          title: "გვერდი წაიშალა",
          message: `"${pageTitle}" წაიშალა MySQL ბაზიდან`,
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
            <FileText className="w-3.5 h-3.5" />
            <span>სტატიკური გვერდები</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight">
            CMS გვერდების მართვა ({pages.length})
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            წესები და პირობები, კონფიდენციალურობა, ჩვენ შესახებ და FAQ გვერდების რედაქტირება.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchPages}
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
            <span>ახალი გვერდის შექმნა</span>
          </button>
        </div>
      </div>

      {/* Pages List */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200/80">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
          <span>იტვირთება CMS გვერდები MySQL ბაზიდან...</span>
        </div>
      ) : pages.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm text-slate-700">გვერდები არ მოიძებნა</h3>
          <p className="text-xs text-slate-400">შექმენით პირველი CMS გვერდი</p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>გვერდის შექმნა</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500">
                <tr>
                  <th className="px-6 py-4">სათაური</th>
                  <th className="px-6 py-4">Slug / URL</th>
                  <th className="px-6 py-4">ბოლო განახლება</th>
                  <th className="px-6 py-4 text-right">მოქმედება</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-slate-900">{page.title}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-mono text-[11px]">
                        /{page.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {page.lastUpdated ? new Date(page.lastUpdated).toLocaleDateString("ka-GE") : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/page/${page.slug}`}
                          target="_blank"
                          className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 flex items-center justify-center transition-colors"
                          title="გვერდის ნახვა"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(page)}
                          className="h-8 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
                          title="რედაქტირება"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>რედაქტირება</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(page.id, page.title)}
                          className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                          title="წაშლა"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 border border-slate-100 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base text-slate-900">
                {editingPage ? `გვერდის რედაქტირება: ${editingPage.title}` : "ახალი CMS გვერდის შექმნა"}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">გვერდის სათაური *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!editingPage) {
                        setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                      }
                    }}
                    placeholder="მაგ: წესები და პირობები"
                    className="w-full h-11 px-4 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Slug (URL ბმული) *</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-slate-400 font-mono">/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="terms"
                      className="w-full h-11 pl-8 pr-4 rounded-2xl border border-slate-200 text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">გვერდის შინაარსი (ტექსტი / Markdown)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="ჩაწერეთ გვერდის სრული ტექსტი..."
                  rows={12}
                  className="w-full p-4 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:border-blue-600 focus:outline-none font-mono leading-relaxed"
                />
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
                  <span>{editingPage ? "შენახვა" : "შექმნა"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
