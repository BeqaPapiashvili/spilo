"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, Globe, Mail, Phone, MapPin, Check, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState("Spilo E-Commerce");
  const [contactEmail, setContactEmail] = useState("info@spilo.ge");
  const [contactPhone, setContactPhone] = useState("+995 32 2 12 34 56");
  const [address, setAddress] = useState("თბილისი, ჭავჭავაძის გამზირი #34");
  const [currency, setCurrency] = useState("GEL (₾)");
  const [locale, setLocale] = useState("ka-GE");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          const d = res.data;
          if (d.storeName) setStoreName(d.storeName);
          if (d.contactEmail) setContactEmail(d.contactEmail);
          if (d.contactPhone) setContactPhone(d.contactPhone);
          if (d.address) setAddress(d.address);
          if (d.currency) setCurrency(d.currency);
          if (d.locale) setLocale(d.locale);
        }
      })
      .catch((err) => console.error("Error loading settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          contactEmail,
          contactPhone,
          address,
          currency,
          locale,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem" }}>
        <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}><Settings size={13} /> სისტემა</div>
        <h1 className="adm-page-title">მაღაზიის პარამეტრები (Store Settings)</h1>
        <p className="adm-page-desc">მაღაზიის ძირითადი ინფორმაცია, საკონტაქტო მონაცემები და ლოკალიზაცია.</p>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* General Settings */}
        <div className="adm-card" style={{ padding: "1.5rem 1.75rem" }}>
          <h3 style={{ fontSize: "0.875rem", color: "#0f172a", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>ზოგადი ინფორმაცია</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "36rem" }}>
            <div>
              <label className="adm-label">მაღაზიის დასახელება</label>
              <div style={{ position: "relative" }}>
                <input value={storeName} onChange={e => setStoreName(e.target.value)} className="adm-input" style={{ paddingLeft: "2.5rem" }} />
                <Globe size={14} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
              <div>
                <label className="adm-label">ვალუტა</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className="adm-select" style={{ width: "100%" }}>
                  <option value="GEL (₾)">GEL (₾)</option>
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                </select>
              </div>
              <div>
                <label className="adm-label">ლოკალიზაცია</label>
                <select value={locale} onChange={e => setLocale(e.target.value)} className="adm-select" style={{ width: "100%" }}>
                  <option value="ka-GE">ქართული (ka-GE)</option>
                  <option value="en-US">English (en-US)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="adm-card" style={{ padding: "1.5rem 1.75rem" }}>
          <h3 style={{ fontSize: "0.875rem", color: "#0f172a", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>საკონტაქტო ინფორმაცია</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "36rem" }}>
            <div>
              <label className="adm-label">საკონტაქტო ელ-ფოსტა</label>
              <div style={{ position: "relative" }}>
                <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="adm-input" style={{ paddingLeft: "2.5rem" }} />
                <Mail size={14} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              </div>
            </div>
            <div>
              <label className="adm-label">საკონტაქტო ტელეფონი</label>
              <div style={{ position: "relative" }}>
                <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="adm-input" style={{ paddingLeft: "2.5rem" }} />
                <Phone size={14} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              </div>
            </div>
            <div>
              <label className="adm-label">მისამართი</label>
              <div style={{ position: "relative" }}>
                <input value={address} onChange={e => setAddress(e.target.value)} className="adm-input" style={{ paddingLeft: "2.5rem" }} />
                <MapPin size={14} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={saving}
            className={saved ? "adm-btn-secondary" : "adm-btn-primary"}
            style={{ padding: "0.625rem 1.5rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            {saving ? (
              <><Loader2 size={15} className="animate-spin" /> ინახება...</>
            ) : saved ? (
              <><Check size={15} /> შენახულია!</>
            ) : (
              <><Save size={15} /> ცვლილებების შენახვა</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
