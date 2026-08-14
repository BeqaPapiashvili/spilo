"use client";

import React, { useState, useEffect } from "react";
import { Ticket, Plus, Trash2, X, Check, Copy } from "lucide-react";
import { dataService, Coupon } from "@/services/dataService";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountValue, setDiscountValue] = useState(15);
  const [minOrder, setMinOrder] = useState(100);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setCoupons(dataService.getCoupons());
    const unsub = dataService.subscribe(() => setCoupons(dataService.getCoupons()));
    return () => unsub();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    dataService.saveCoupon({ id: `cpn-${Date.now()}`, code: code.trim().toUpperCase(), discountType: "percentage", discountValue: Number(discountValue), minOrderAmount: Number(minOrder), startDate: "2026-01-01", endDate: "2026-12-31", usedCount: 0, status: "ACTIVE" });
    setIsModalOpen(false); setCode("");
  };
  const handleDelete = (id: string) => { if (confirm("კუპონის წაშლა?")) dataService.deleteCoupon(id); };
  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code).then(() => { setCopiedId(id); setTimeout(() => setCopiedId(null), 1500); });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}><Ticket size={13} /> მარკეტინგი</div>
          <h1 className="adm-page-title">კუპონები ({coupons.length})</h1>
          <p className="adm-page-desc">ფასდაკლების კოდების შექმნა, მართვა და გამოყენების ანალიტიკა.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="adm-btn-primary"><Plus size={15} /> ახალი კუპონი</button>
      </div>

      {/* Coupon Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.875rem" }}>
        {coupons.map(coupon => (
          <div key={coupon.id} className="adm-card" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
            {/* Decorative dashed line */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: "linear-gradient(180deg, #6366f1, #8b5cf6)", borderRadius: "0 0 0 0" }} />
            <div style={{ paddingLeft: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
                <span className={coupon.status === "ACTIVE" ? "adm-badge adm-badge-green" : "adm-badge adm-badge-slate"}>
                  {coupon.status === "ACTIVE" ? "აქტიური" : "გათიშული"}
                </span>
                <button onClick={() => handleDelete(coupon.id)} className="adm-icon-btn adm-icon-btn-red"><Trash2 size={13} /></button>
              </div>
              {/* Code */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
                <code style={{ fontSize: "1.1rem", color: "#0f172a", letterSpacing: "0.1em", background: "#f8fafc", padding: "0.375rem 0.75rem", borderRadius: "0.5rem", border: "1px dashed #e2e8f0", flex: 1 }}>
                  {coupon.code}
                </code>
                <button onClick={() => handleCopy(coupon.code, coupon.id)} className="adm-icon-btn adm-icon-btn-blue" title="კოდის კოპირება">
                  {copiedId === coupon.id ? <Check size={14} style={{ color: "#16a34a" }} /> : <Copy size={14} />}
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "1.5rem", color: "#6366f1", letterSpacing: "-0.02em" }}>-{coupon.discountValue}%</span>
                </div>
                <div style={{ textAlign: "right", fontSize: "0.7rem", color: "#94a3b8" }}>
                  <p>მინ. შეკვეთა: {coupon.minOrderAmount} ₾</p>
                  <p>გამოყ.: {coupon.usedCount || 0}x</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add card */}
        <button onClick={() => setIsModalOpen(true)} className="adm-card"
          style={{ padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer", border: "1.5px dashed #e2e8f0", background: "#f8fafc", minHeight: "160px", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#a5b4fc"; e.currentTarget.style.background = "#f5f3ff"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
        >
          <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={18} style={{ color: "#6366f1" }} />
          </div>
          <span style={{ fontSize: "0.75rem", color: "#6366f1" }}>ახალი კუპონი</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="adm-modal-overlay">
          <div className="adm-modal">
            <div className="adm-modal-header">
              <h3 style={{ fontSize: "1rem", color: "#0f172a" }}>ახალი კუპონი</h3>
              <button onClick={() => setIsModalOpen(false)} className="adm-icon-btn"><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="adm-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label className="adm-label">კუპონის კოდი *</label>
                  <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="adm-input" placeholder="მაგ. SUMMER20" required style={{ letterSpacing: "0.1em", fontFamily: "monospace" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label className="adm-label">ფასდაკლება (%)</label>
                    <input type="number" min={1} max={100} value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="adm-input" />
                  </div>
                  <div>
                    <label className="adm-label">მინ. შეკვეთა (₾)</label>
                    <input type="number" min={0} value={minOrder} onChange={e => setMinOrder(Number(e.target.value))} className="adm-input" />
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
