"use client";

import React, { useState, useEffect } from "react";
import { Tag, Plus, Calendar, Percent, Trash2, X, Check } from "lucide-react";
import { dataService, Promotion } from "@/services/dataService";

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountValue, setDiscountValue] = useState(20);
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-09-01");

  useEffect(() => {
    setPromotions(dataService.getPromotions());
    const unsub = dataService.subscribe(() => setPromotions(dataService.getPromotions()));
    return () => unsub();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    dataService.savePromotion({ id: `promo-${Date.now()}`, name: name.trim(), slug: name.toLowerCase().replace(/\s+/g, "-"), description, discountType: "percentage", discountValue: Number(discountValue), startDate, endDate, status: "ACTIVE" });
    setIsModalOpen(false); setName(""); setDescription("");
  };
  const handleDelete = (id: string) => { if (confirm("აქციის წაშლა?")) dataService.deletePromotion(id); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}><Tag size={13} /> მარკეტინგი</div>
          <h1 className="adm-page-title">აქციები & ფასდაკლებები ({promotions.length})</h1>
          <p className="adm-page-desc">სეზონური და სპეციალური ფასდაკლებების სრული მართვა.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="adm-btn-primary"><Plus size={15} /> ახალი აქცია</button>
      </div>

      {/* Promotions Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.875rem" }}>
        {promotions.map(promo => (
          <div key={promo.id} className="adm-card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.875rem" }}>
              <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "0.875rem", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Percent size={18} style={{ color: "#7c3aed" }} />
              </div>
              <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                <span className={`adm-badge ${promo.status === "ACTIVE" ? "adm-badge-green" : "adm-badge-slate"}`}>
                  {promo.status === "ACTIVE" ? "აქტიური" : "არააქტიური"}
                </span>
                <button onClick={() => handleDelete(promo.id)} className="adm-icon-btn adm-icon-btn-red"><Trash2 size={13} /></button>
              </div>
            </div>
            <h3 style={{ fontSize: "0.9rem", color: "#0f172a", marginBottom: "0.375rem" }}>{promo.name}</h3>
            <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: "0.875rem" }}>{promo.description || "—"}</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "1.5rem", color: "#7c3aed", letterSpacing: "-0.02em" }}>-{promo.discountValue}%</span>
              <div style={{ textAlign: "right", fontSize: "0.65rem", color: "#94a3b8" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "3px" }}><Calendar size={11} /> {promo.startDate}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}><Calendar size={11} /> {promo.endDate}</div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Card */}
        <button onClick={() => setIsModalOpen(true)} className="adm-card"
          style={{ padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer", border: "1.5px dashed #e2e8f0", background: "#f8fafc", minHeight: "160px", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#ddd6fe"; e.currentTarget.style.background = "#f5f3ff"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
        >
          <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={18} style={{ color: "#7c3aed" }} />
          </div>
          <span style={{ fontSize: "0.75rem", color: "#7c3aed" }}>ახალი აქცია</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="adm-modal-overlay">
          <div className="adm-modal">
            <div className="adm-modal-header">
              <h3 style={{ fontSize: "1rem", color: "#0f172a" }}>ახალი აქციის შექმნა</h3>
              <button onClick={() => setIsModalOpen(false)} className="adm-icon-btn"><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="adm-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label className="adm-label">აქციის სახელი *</label>
                  <input value={name} onChange={e => setName(e.target.value)} className="adm-input" placeholder="მაგ. Summer Sale 2026" required />
                </div>
                <div>
                  <label className="adm-label">აღწერა</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} className="adm-textarea" placeholder="მოკლე აღწერა..." style={{ minHeight: "70px" }} />
                </div>
                <div>
                  <label className="adm-label">ფასდაკლება (%)</label>
                  <input type="number" min={1} max={100} value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="adm-input" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label className="adm-label">დაწყება</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="adm-input" />
                  </div>
                  <div>
                    <label className="adm-label">დასრულება</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="adm-input" />
                  </div>
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
