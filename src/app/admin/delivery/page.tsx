"use client";

import React, { useState, useEffect } from "react";
import { Truck, Check, Save, MapPin, DollarSign, Clock, ShieldCheck, Loader2 } from "lucide-react";

export default function AdminDeliveryPage() {
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(100);
  const [standardDeliveryFee, setStandardDeliveryFee] = useState(5);
  const [expressDeliveryFee, setExpressDeliveryFee] = useState(15);
  const [regionsDeliveryFee, setRegionsDeliveryFee] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/delivery")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const d = res.data;
          if (d.freeShippingThreshold !== undefined) setFreeShippingThreshold(Number(d.freeShippingThreshold));
          if (d.standardDeliveryFee !== undefined) setStandardDeliveryFee(Number(d.standardDeliveryFee));
          if (d.expressDeliveryFee !== undefined) setExpressDeliveryFee(Number(d.expressDeliveryFee));
          if (d.regionsDeliveryFee !== undefined) setRegionsDeliveryFee(Number(d.regionsDeliveryFee));
        }
      })
      .catch((err) => console.error("Error loading delivery settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freeShippingThreshold,
          standardDeliveryFee,
          expressDeliveryFee,
          regionsDeliveryFee,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error("Failed to save delivery settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}>
            <Truck size={13} /> ლოგისტიკა & მიწოდება
          </div>
          <h1 className="adm-page-title">მიწოდების ტარიფები & პირობები</h1>
          <p className="adm-page-desc">უფასო მიწოდების ზღვარი, თბილისისა და რეგიონების მიტანის საფასური და ვადები.</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={saved ? "adm-btn-secondary" : "adm-btn-primary"}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
        >
          {saving ? (
            <><Loader2 size={14} className="animate-spin" /> ინახება...</>
          ) : saved ? (
            <><Check size={14} /> შენახულია!</>
          ) : (
            <><Save size={14} /> პარამეტრების შენახვა</>
          )}
        </button>
      </div>

      {/* Delivery Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="adm-card animate-pulse" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", background: "#f1f5f9" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", flex: 1 }}>
                  <div style={{ width: "60%", height: "0.85rem", background: "#e2e8f0", borderRadius: "0.25rem" }} />
                  <div style={{ width: "40%", height: "0.68rem", background: "#f1f5f9", borderRadius: "0.25rem" }} />
                </div>
              </div>
              <div style={{ width: "100%", height: "2.5rem", background: "#f8fafc", borderRadius: "0.5rem" }} />
            </div>
          ))
        ) : (
          <>
            {/* Free Delivery Threshold */}
            <div className="adm-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "0.85rem", color: "#0f172a" }}>უფასო მიწოდების ზღვარი</h3>
              <p style={{ fontSize: "0.68rem", color: "#94a3b8" }}>ამ თანხის ზემოთ მიწოდება უფასოა</p>
            </div>
          </div>
          <div>
            <label className="adm-label" style={{ fontSize: "0.68rem" }}>მინიმალური თანხა (₾)</label>
            <input
              type="number"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
              className="adm-input"
            />
          </div>
        </div>

        {/* Standard Tbilisi Delivery */}
        <div className="adm-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", background: "#eef2ff", color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Truck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "0.85rem", color: "#0f172a" }}>სტანდარტული მიწოდება</h3>
              <p style={{ fontSize: "0.68rem", color: "#94a3b8" }}>თბილისი (1-2 სამუშაო დღე)</p>
            </div>
          </div>
          <div>
            <label className="adm-label" style={{ fontSize: "0.68rem" }}>საფასური (₾)</label>
            <input
              type="number"
              value={standardDeliveryFee}
              onChange={(e) => setStandardDeliveryFee(Number(e.target.value))}
              className="adm-input"
            />
          </div>
        </div>

        {/* Express Same-Day Delivery */}
        <div className="adm-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", background: "#fff7ed", color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "0.85rem", color: "#0f172a" }}>ექსპრეს მიწოდება</h3>
              <p style={{ fontSize: "0.68rem", color: "#94a3b8" }}>იმავე დღეს (2-3 საათში)</p>
            </div>
          </div>
          <div>
            <label className="adm-label" style={{ fontSize: "0.68rem" }}>საფასური (₾)</label>
            <input
              type="number"
              value={expressDeliveryFee}
              onChange={(e) => setExpressDeliveryFee(Number(e.target.value))}
              className="adm-input"
            />
          </div>
        </div>

        {/* Regional Georgia Delivery */}
        <div className="adm-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", background: "#f5f3ff", color: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MapPin size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "0.85rem", color: "#0f172a" }}>რეგიონებში მიწოდება</h3>
              <p style={{ fontSize: "0.68rem", color: "#94a3b8" }}>მთელი საქართველო (2-3 დღე)</p>
            </div>
          </div>
          <div>
            <label className="adm-label" style={{ fontSize: "0.68rem" }}>საფასური (₾)</label>
            <input
              type="number"
              value={regionsDeliveryFee}
              onChange={(e) => setRegionsDeliveryFee(Number(e.target.value))}
              className="adm-input"
            />
          </div>
        </div>
        </>
      )}
    </div>

    </div>
  );
}
