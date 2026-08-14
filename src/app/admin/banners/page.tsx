"use client";

import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Plus, Trash2, X, Check, ExternalLink } from "lucide-react";
import { dataService, Banner } from "@/services/dataService";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ctaLink, setCtaLink] = useState("/catalog");

  useEffect(() => {
    setBanners(dataService.getBanners());
    const unsub = dataService.subscribe(() => setBanners(dataService.getBanners()));
    return () => unsub();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;
    dataService.saveBanner({ id: `banner-${Date.now()}`, title: title.trim(), subtitle: subtitle.trim(), ctaText: "ნახვა", ctaLink, imageDesktop: imageUrl.trim(), position: "HERO", isActive: true, priority: banners.length + 1 });
    setIsModalOpen(false); setTitle(""); setSubtitle(""); setImageUrl("");
  };
  const handleDelete = (id: string) => { if (confirm("ბანერის წაშლა?")) dataService.deleteBanner(id); };
  const handleToggle = (banner: Banner) => dataService.saveBanner({ ...banner, isActive: !banner.isActive });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}><ImageIcon size={13} /> მარკეტინგი</div>
          <h1 className="adm-page-title">ბანერები ({banners.length})</h1>
          <p className="adm-page-desc">Hero, Promotional და სხვა ბანერების მართვა Storefront-ზე.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="adm-btn-primary"><Plus size={15} /> ახალი ბანერი</button>
      </div>

      {/* Banners Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {banners.map((banner, idx) => (
          <div key={banner.id} className="adm-card" style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
              {/* Banner Image Preview */}
              <div style={{ width: "200px", flexShrink: 0, position: "relative", overflow: "hidden", background: "#f1f5f9" }}>
                <img src={banner.imageDesktop} alt={banner.title} style={{ width: "100%", height: "120px", objectFit: "cover", display: "block" }}
                  onError={e => { e.currentTarget.style.display = "none"; }} />
                <div style={{ position: "absolute", top: "0.5rem", left: "0.5rem" }}>
                  <span className="adm-badge adm-badge-slate" style={{ fontSize: "0.55rem" }}>#{idx + 1} · {banner.position}</span>
                </div>
              </div>

              {/* Banner Info */}
              <div style={{ flex: 1, padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "0.9rem", color: "#0f172a", marginBottom: "0.25rem" }}>{banner.title}</h3>
                  <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.625rem" }}>{banner.subtitle || "—"}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <a href={banner.ctaLink} target="_blank" rel="noreferrer" style={{ fontSize: "0.7rem", color: "#6366f1", display: "flex", alignItems: "center", gap: "3px" }}>
                      {banner.ctaLink} <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                  {/* Toggle active */}
                  <button onClick={() => handleToggle(banner)} className={banner.isActive ? "adm-badge adm-badge-green" : "adm-badge adm-badge-slate"} style={{ cursor: "pointer", border: "none" }}>
                    {banner.isActive ? "აქტიური" : "გათიშული"}
                  </button>
                  <button onClick={() => handleDelete(banner.id)} className="adm-icon-btn adm-icon-btn-red"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add card */}
        <button onClick={() => setIsModalOpen(true)} className="adm-card"
          style={{ padding: "1.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", cursor: "pointer", border: "1.5px dashed #e2e8f0", background: "#f8fafc", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#a5b4fc"; e.currentTarget.style.background = "#f5f3ff"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
        >
          <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.75rem", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={17} style={{ color: "#6366f1" }} />
          </div>
          <span style={{ fontSize: "0.8rem", color: "#6366f1" }}>ახალი ბანერის დამატება</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="adm-modal-overlay">
          <div className="adm-modal">
            <div className="adm-modal-header">
              <h3 style={{ fontSize: "1rem", color: "#0f172a" }}>ახალი ბანერი</h3>
              <button onClick={() => setIsModalOpen(false)} className="adm-icon-btn"><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="adm-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label className="adm-label">სათაური *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} className="adm-input" placeholder="მაგ. Summer Sale 2026" required />
                </div>
                <div>
                  <label className="adm-label">ქვე-სათაური</label>
                  <input value={subtitle} onChange={e => setSubtitle(e.target.value)} className="adm-input" placeholder="მოკლე აღწერა..." />
                </div>
                <div>
                  <ImageUploader
                    images={imageUrl ? [imageUrl] : []}
                    onChange={(imgs) => setImageUrl(imgs[0] || "")}
                    multiple={false}
                    label="ბანერის სურათი *"
                    helperText="რეკომენდებული ზომა: 1920x600px ან 1200x400px"
                  />
                </div>
                <div>
                  <label className="adm-label">CTA ლინკი</label>
                  <input value={ctaLink} onChange={e => setCtaLink(e.target.value)} className="adm-input" placeholder="/catalog" />
                </div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="adm-btn-secondary">გაუქმება</button>
                <button type="submit" className="adm-btn-primary"><Check size={14} /> შენახვა</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
