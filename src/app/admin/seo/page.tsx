"use client";

import React, { useState } from "react";
import { Globe, Save, Check, Search, Share2, Sparkles } from "lucide-react";

export default function AdminSEOManagerPage() {
  const [siteTitle, setSiteTitle] = useState("Spilo — ონლაინ ტექნიკის მაღაზია | ტელეფონები, ლეპტოპები");
  const [metaDesc, setMetaDesc] = useState("შეიძინეთ უახლესი ტექნიკა 0% ონლაინ განვადებით და უფასო მიწოდებით მთელ საქართველოში Spilo-ზე.");
  const [ogImage, setOgImage] = useState("https://veli.store/media-cdn/__sized__/product/iphone16pro-thumbnail-200x200-95.jpg");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("G-SPILO99214");
  const [facebookPixelId, setFacebookPixelId] = useState("FB_PIXEL_8849201");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          className={saved ? "adm-btn-secondary" : "adm-btn-primary"}
        >
          {saved ? <><Check size={14} /> შენახულია!</> : <><Save size={14} /> SEO-ს შენახვა</>}
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
