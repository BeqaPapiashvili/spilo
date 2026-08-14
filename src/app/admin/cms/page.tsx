"use client";

import React, { useState, useEffect } from "react";
import { Globe, Edit3, Save, Check, X, FileText, ExternalLink } from "lucide-react";
import { dataService, CMSPage } from "@/services/dataService";

export default function AdminCMSPagesPage() {
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setPages(dataService.getCMSPages());
    const unsub = dataService.subscribe(() => setPages(dataService.getCMSPages()));
    return () => unsub();
  }, []);

  const handleEdit = (page: CMSPage) => {
    setEditingPage(page);
    setTitle(page.title);
    setSlug(page.slug);
    setContent(page.content);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage || !title.trim()) return;

    dataService.saveCMSPage({
      ...editingPage,
      title: title.trim(),
      slug: slug.trim(),
      content: content.trim(),
      lastUpdated: new Date().toISOString().slice(0, 10),
    });

    setIsModalOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem" }}>
        <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}>
          <FileText size={13} /> სტატიკური გვერდები
        </div>
        <h1 className="adm-page-title">CMS გვერდების მართვა</h1>
        <p className="adm-page-desc">წესები და პირობები, კონფიდენციალურობა, ჩვენს შესახებ და FAQ გვერდების რედაქტირება.</p>
      </div>

      {/* Pages Table/Card */}
      <div className="adm-card" style={{ overflow: "hidden" }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>გვერდის დასახელება</th>
              <th>Slug / URL</th>
              <th>ბოლო განახლება</th>
              <th style={{ textAlign: "right" }}>მოქმედება</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
                      <FileText size={14} />
                    </div>
                    <span style={{ color: "#0f172a" }}>{p.title}</span>
                  </div>
                </td>
                <td style={{ fontFamily: "monospace", color: "#64748b", fontSize: "0.75rem" }}>
                  /{p.slug}
                </td>
                <td style={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                  {p.lastUpdated}
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    type="button"
                    onClick={() => handleEdit(p)}
                    className="adm-btn-secondary"
                    style={{ fontSize: "0.72rem", padding: "0.35rem 0.75rem" }}
                  >
                    <Edit3 size={13} />
                    <span>რედაქტირება</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingPage && (
        <div className="adm-modal-overlay">
          <div className="adm-modal adm-modal-lg">
            <div className="adm-modal-header">
              <h3 style={{ fontSize: "1rem", color: "#0f172a" }}>
                გვერდის რედაქტირება: {editingPage.title}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="adm-icon-btn">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="adm-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label className="adm-label">გვერდის სათაური *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="adm-input"
                  />
                </div>

                <div>
                  <label className="adm-label">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    className="adm-input"
                    style={{ fontFamily: "monospace" }}
                  />
                </div>

                <div>
                  <label className="adm-label">გვერდის შიგთავსი (HTML / Markdown / Text) *</label>
                  <textarea
                    rows={12}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="adm-textarea"
                    style={{ fontFamily: "inherit", fontSize: "0.8rem", lineHeight: 1.6 }}
                  />
                </div>
              </div>

              <div className="adm-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="adm-btn-secondary">
                  გაუქმება
                </button>
                <button type="submit" className="adm-btn-primary">
                  <Check size={14} />
                  <span>ცვლილებების შენახვა</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
