"use client";

import React, { useState, useEffect } from "react";
import { Globe, Save, Check, Search, Share2, Sparkles, Loader2 } from "lucide-react";

export default function AdminSEOManagerPage() {
  const [siteTitle, setSiteTitle] = useState("Spilo — ონლაინ ტექნიკის მაღაზია | ტელეფონები, ლეპტოპები");
  const [metaDesc, setMetaDesc] = useState("შეიძინეთ უახლესი ტექნიკა 0% ონლაინ განვადებით და უფასო მიწოდებით მთელ საქართველოში Spilo-ზე.");
  const [ogImage, setOgImage] = useState("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("G-SPILO99214");
  const [facebookPixelId, setFacebookPixelId] = useState("FB_PIXEL_8849201");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/seo")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const homeSeo = res.data.find((s: any) => s.pageSlug === "home") || res.data[0];
          if (homeSeo) {
            if (homeSeo.metaTitle) setSiteTitle(homeSeo.metaTitle);
            if (homeSeo.metaDescription) setMetaDesc(homeSeo.metaDescription);
            if (homeSeo.metaKeywords) {
              try {
                const kw = JSON.parse(homeSeo.metaKeywords);
                if (kw.ogImage) setOgImage(kw.ogImage);
                if (kw.googleAnalyticsId) setGoogleAnalyticsId(kw.googleAnalyticsId);
                if (kw.facebookPixelId) setFacebookPixelId(kw.facebookPixelId);
              } catch {
                // Ignore parsing error
              }
            }
          }
        }
      })
      .catch((err) => console.error("Error fetching SEO settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const extraMeta = JSON.stringify({
        ogImage,
        googleAnalyticsId,
        facebookPixelId,
      });

      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageSlug: "home",
          metaTitle: siteTitle,
          metaDescription: metaDesc,
          metaKeywords: extraMeta,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error("Failed to save SEO:", err);
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
            <Globe size={13} /> მარკეტინგი & ოპტიმიზაცია
          </div>
          <h1 className="adm-page-title">SEO & საძიებო სისტემების ოპტიმიზაცია</h1>
          <p className="adm-page-desc">მთავარი Meta Title, Description, OpenGraph და ანალიტიკის კოდები.</p>
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
            <><Save size={14} /> SEO-ს შენახვა</>
          )}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.25rem", alignItems: "start" }}>

        {/* Inputs Form */}
        <div className="adm-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label className="adm-label">მთავარი Meta Title (სათაური) *</label>
            <input
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              className="adm-input"
            />
            <span style={{ fontSize: "0.68rem", color: "#94a3b8", display: "block", marginTop: "4px" }}>
              რეკომენდებული სიგრძე: 50-60 სიმბოლო (ამჟამად: {siteTitle.length})
            </span>
          </div>

          <div>
            <label className="adm-label">მთავარი Meta Description (აღწერა) *</label>
            <textarea
              rows={4}
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              className="adm-textarea"
            />
            <span style={{ fontSize: "0.68rem", color: "#94a3b8", display: "block", marginTop: "4px" }}>
              რეკომენდებული სიგრძე: 120-160 სიმბოლო (ამჟამად: {metaDesc.length})
            </span>
          </div>

          <div>
            <label className="adm-label">OpenGraph გაზიარების სურათი (Social Share Image URL)</label>
            <input
              type="text"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              className="adm-input"
              placeholder="https://..."
            />
          </div>

          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1rem", marginTop: "0.5rem" }}>
            <h4 style={{ fontSize: "0.8rem", color: "#0f172a", marginBottom: "0.75rem" }}>ანალიტიკა & პიქსელები</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label className="adm-label" style={{ fontSize: "0.68rem" }}>Google Analytics ID</label>
                <input
                  type="text"
                  value={googleAnalyticsId}
                  onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                  className="adm-input"
                  style={{ fontFamily: "monospace", fontSize: "0.75rem" }}
                />
              </div>
              <div>
                <label className="adm-label" style={{ fontSize: "0.68rem" }}>Facebook Pixel ID</label>
                <input
                  type="text"
                  value={facebookPixelId}
                  onChange={(e) => setFacebookPixelId(e.target.value)}
                  className="adm-input"
                  style={{ fontFamily: "monospace", fontSize: "0.75rem" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Google Search Live Preview */}
        <div className="adm-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Search size={15} style={{ color: "#6366f1" }} />
            <h3 style={{ fontSize: "0.82rem", color: "#0f172a" }}>Google საძიებო პრევიუ</h3>
          </div>

          <div style={{ padding: "1rem", borderRadius: "0.75rem", background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span style={{ fontSize: "0.7rem", color: "#202124" }}>https://spilo.ge</span>
            <h4 style={{ fontSize: "0.95rem", color: "#1a0dab", textDecoration: "underline", cursor: "pointer", lineHeight: 1.3 }}>
              {siteTitle || "Spilo E-Commerce"}
            </h4>
            <p style={{ fontSize: "0.75rem", color: "#4d5156", lineHeight: 1.4, marginTop: "2px" }}>
              {metaDesc || "Spilo ონლაინ მაღაზია საქართველოში..."}
            </p>
          </div>

          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Share2 size={14} style={{ color: "#6366f1" }} />
              <span style={{ fontSize: "0.78rem", color: "#0f172a" }}>სოციალური ბარათი (OG)</span>
            </div>
            {ogImage && (
              <div style={{ width: "100%", height: "120px", borderRadius: "0.5rem", overflow: "hidden", border: "1px solid #e2e8f0", background: "#f8fafc" }}>
                <img src={ogImage} alt="OG Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
