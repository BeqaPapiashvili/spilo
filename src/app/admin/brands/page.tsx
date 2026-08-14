"use client";

import React, { useState, useEffect } from "react";
import { Award, Plus, Search, Edit3, Trash2, Check, X, ExternalLink } from "lucide-react";
import { dataService } from "@/services/dataService";
import { Brand } from "@/types";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [brandLogo, setBrandLogo] = useState("");
  const [isFeatured, setIsFeatured] = useState(true);

  useEffect(() => {
    setBrands(dataService.getBrands());
    const unsub = dataService.subscribe(() => setBrands(dataService.getBrands()));
    return () => unsub();
  }, []);

  const filtered = brands.filter(b => !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleOpenAdd = () => { setEditingBrand(null); setBrandName(""); setBrandSlug(""); setBrandLogo(""); setIsFeatured(true); setIsModalOpen(true); };
  const handleOpenEdit = (b: Brand) => { setEditingBrand(b); setBrandName(b.name); setBrandSlug(b.slug); setBrandLogo(b.logo); setIsFeatured(b.featured ?? true); setIsModalOpen(true); };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    dataService.saveBrand({ id: editingBrand?.id, name: brandName.trim(), slug: brandSlug.trim() || brandName.toLowerCase().replace(/\s+/g, "-"), logo: brandLogo.trim() || "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", featured: isFeatured });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" ბრენდის წაშლა?`)) dataService.deleteBrand(id);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}><Award size={13} /> კატალოგის მართვა</div>
          <h1 className="adm-page-title">ბრენდები ({filtered.length})</h1>
          <p className="adm-page-desc">პარტნიორი ბრენდების მართვა, ლოგოები და Storefront-ის ბრენდ ფილტრი.</p>
        </div>
        <button onClick={handleOpenAdd} className="adm-btn-primary"><Plus size={15} /> ახალი ბრენდი</button>
      </div>

      {/* Search */}
      <div className="adm-card" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ position: "relative", maxWidth: "24rem" }}>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="ბრენდის ძიება..." className="adm-search-input" />
          <Search size={14} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Brand Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "0.875rem" }}>
        {filtered.map(brand => (
          <div key={brand.id} className="adm-card" style={{ padding: "1.5rem 1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.875rem", textAlign: "center" }}>
            <div style={{ width: "4rem", height: "4rem", borderRadius: "1rem", background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: "0.75rem" }}>
              <img src={brand.logo} alt={brand.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={e => (e.currentTarget.style.display = "none")} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.85rem", color: "#0f172a" }}>{brand.name}</p>
              <p style={{ fontSize: "0.68rem", color: "#94a3b8", fontFamily: "monospace", marginTop: "2px" }}>{brand.slug}</p>
              {brand.featured && <span className="adm-badge adm-badge-purple" style={{ marginTop: "0.5rem" }}>Featured</span>}
            </div>
            <div style={{ display: "flex", gap: "0.375rem" }}>
              <button onClick={() => handleOpenEdit(brand)} className="adm-icon-btn adm-icon-btn-blue"><Edit3 size={14} /></button>
              <button onClick={() => handleDelete(brand.id, brand.name)} className="adm-icon-btn adm-icon-btn-red"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}

        {/* Add new card */}
        <button onClick={handleOpenAdd} className="adm-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer", border: "1.5px dashed #e2e8f0", background: "#f8fafc", minHeight: "160px", transition: "border-color 0.15s, background 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#a5b4fc"; e.currentTarget.style.background = "#f5f3ff"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
        >
          <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={18} style={{ color: "#6366f1" }} />
          </div>
          <span style={{ fontSize: "0.75rem", color: "#6366f1" }}>ახალი ბრენდი</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="adm-modal-overlay">
          <div className="adm-modal">
            <div className="adm-modal-header">
              <h3 style={{ fontSize: "1rem", color: "#0f172a" }}>{editingBrand ? "ბრენდის რედაქტირება" : "ახალი ბრენდი"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="adm-icon-btn"><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="adm-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label className="adm-label">ბრენდის სახელი *</label>
                  <input value={brandName} onChange={e => setBrandName(e.target.value)} className="adm-input" placeholder="მაგ. Apple" required />
                </div>
                <div>
                  <label className="adm-label">Slug (URL)</label>
                  <input value={brandSlug} onChange={e => setBrandSlug(e.target.value)} className="adm-input" placeholder="apple" />
                </div>
                <div>
                  <ImageUploader
                    images={brandLogo ? [brandLogo] : []}
                    onChange={(imgs) => setBrandLogo(imgs[0] || "")}
                    multiple={false}
                    label="ბრენდის ლოგო"
                    helperText="რეკომენდებულია გამჭვირვალე SVG ან PNG"
                  />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.625rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ width: "1rem", height: "1rem", accentColor: "#6366f1" }} />
                  <span style={{ fontSize: "0.8rem", color: "#475569" }}>Featured ბრენდი (Storefront-ზე ჩვენება)</span>
                </label>
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
