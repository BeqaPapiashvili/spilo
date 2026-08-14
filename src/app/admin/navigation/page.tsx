"use client";

import React, { useState, useEffect } from "react";
import { Navigation, Plus, MoveUp, MoveDown, Trash2, Edit3, Check, X, ExternalLink } from "lucide-react";
import { dataService, NavigationItem } from "@/services/dataService";

export default function AdminNavigationBuilderPage() {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    setItems(dataService.getNavigationItems());
    const unsub = dataService.subscribe(() => setItems(dataService.getNavigationItems()));
    return () => unsub();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setLabel("");
    setUrl("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NavigationItem) => {
    setEditingItem(item);
    setLabel(item.label);
    setUrl(item.url);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !url.trim()) return;

    dataService.saveNavigationItem({
      id: editingItem ? editingItem.id : `nav-${Date.now()}`,
      label: label.trim(),
      url: url.trim(),
      order: editingItem ? editingItem.order : items.length + 1,
    });

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("წავშალოთ ნავიგაციის ელემენტი?")) {
      dataService.deleteNavigationItem(id);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}>
            <Navigation size={13} /> ნავიგაციის მართვა
          </div>
          <h1 className="adm-page-title">ჰედერის & მეგამენიუს ბმულები</h1>
          <p className="adm-page-desc">საიტის მთავარი ნავიგაციის ელემენტები, ბმულები და რიგითობა.</p>
        </div>
        <button type="button" onClick={handleOpenAdd} className="adm-btn-primary">
          <Plus size={15} />
          <span>ახალი ბმული</span>
        </button>
      </div>

      {/* List */}
      <div className="adm-card" style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {items.map((item, idx) => (
          <div
            key={item.id}
            style={{
              padding: "0.875rem 1.25rem",
              borderRadius: "0.75rem",
              border: "1px solid #f1f5f9",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem", background: "#f1f5f9", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontFamily: "monospace" }}>
                #{idx + 1}
              </div>
              <div>
                <h4 style={{ fontSize: "0.82rem", color: "#0f172a" }}>{item.label}</h4>
                <p style={{ fontSize: "0.68rem", color: "#94a3b8", fontFamily: "monospace" }}>{item.url}</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <button
                type="button"
                onClick={() => handleOpenEdit(item)}
                className="adm-icon-btn adm-icon-btn-blue"
                title="რედაქტირება"
              >
                <Edit3 size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="adm-icon-btn adm-icon-btn-red"
                title="წაშლა"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="adm-modal-overlay">
          <div className="adm-modal">
            <div className="adm-modal-header">
              <h3 style={{ fontSize: "1rem", color: "#0f172a" }}>
                {editingItem ? "ბმულის რედაქტირება" : "ახალი ნავიგაციის ბმული"}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="adm-icon-btn">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="adm-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label className="adm-label">სათაური (Label) *</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="მაგ. სმარტფონები"
                    required
                    className="adm-input"
                  />
                </div>

                <div>
                  <label className="adm-label">URL მისამართი *</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="/categories/mobiles"
                    required
                    className="adm-input"
                    style={{ fontFamily: "monospace" }}
                  />
                </div>
              </div>

              <div className="adm-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="adm-btn-secondary">
                  გაუქმება
                </button>
                <button type="submit" className="adm-btn-primary">
                  <Check size={14} />
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
