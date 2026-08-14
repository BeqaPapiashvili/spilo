"use client";

import React, { useState } from "react";
import { LayoutTemplate, MoveUp, MoveDown, Eye, Save, Check, Layers } from "lucide-react";
import Link from "next/link";

interface HomeSection {
  id: string;
  name: string;
  desc: string;
  enabled: boolean;
}

export default function AdminHomepageCMSPage() {
  const [sections, setSections] = useState<HomeSection[]>([
    { id: "hero", name: "Hero Banner Carousel (მთავარი ბანერები)", desc: "სლაიდერი აქციებისა და შეთავაზებებისთვის", enabled: true },
    { id: "categories", name: "Category Cards Carousel (კატეგორიები)", desc: "სწრაფი ნავიგაციის კატეგორიების ბარათები", enabled: true },
    { id: "hot_deals", name: "Hot Deals / Flash Sales (ცხელი შეთავაზებები)", desc: "ტაიმერიანი ფასდაკლების ბლოკი", enabled: true },
    { id: "featured", name: "Featured Products (რჩეული პროდუქტები)", desc: "რეკომენდებული ტექნიკა და ფლაგმანები", enabled: true },
    { id: "brands", name: "Popular Brands Bar (პოპულარული ბრენდები)", desc: "Apple, Samsung, Sony და სხვა ლოგოების ზოლი", enabled: true },
    { id: "recently_viewed", name: "Recently Viewed (ბოლოს ნანახი)", desc: "მომხმარებლის მიერ ბოლოს დათვალიერებული ნივთები", enabled: true },
  ]);

  const [saved, setSaved] = useState(false);

  const toggleSection = (id: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const newSections = [...sections];
    const temp = newSections[idx - 1];
    newSections[idx - 1] = newSections[idx];
    newSections[idx] = temp;
    setSections(newSections);
  };

  const moveDown = (idx: number) => {
    if (idx === sections.length - 1) return;
    const newSections = [...sections];
    const temp = newSections[idx + 1];
    newSections[idx + 1] = newSections[idx];
    newSections[idx] = temp;
    setSections(newSections);
  };

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
            <LayoutTemplate size={13} /> ვიზუალური კონტენტის მართვა
          </div>
          <h1 className="adm-page-title">მთავარი გვერდის მართვა (Homepage CMS)</h1>
          <p className="adm-page-desc">სექციების თანმიმდევრობა, ჩართვა/გამორთვა და ვიზუალური ბლოკების კონფიგურაცია.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Link href="/" target="_blank" className="adm-btn-secondary">
            <Eye size={14} />
            <span>Storefront ნახვა</span>
          </Link>
          <button
            type="button"
            onClick={handleSave}
            className={saved ? "adm-btn-secondary" : "adm-btn-primary"}
          >
            {saved ? <><Check size={14} /> შენახულია!</> : <><Save size={14} /> შენახვა</>}
          </button>
        </div>
      </div>

      {/* Sections List */}
      <div className="adm-card" style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <h3 style={{ fontSize: "0.85rem", color: "#0f172a", marginBottom: "0.25rem" }}>სექციების თანმიმდევრობა</h3>

        {sections.map((sec, idx) => (
          <div
            key={sec.id}
            style={{
              padding: "1rem 1.25rem",
              borderRadius: "0.875rem",
              border: "1px solid #f1f5f9",
              background: sec.enabled ? "#ffffff" : "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              opacity: sec.enabled ? 1 : 0.65,
              transition: "all 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem", background: "#f1f5f9", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontFamily: "monospace" }}>
                #{idx + 1}
              </div>
              <div>
                <h4 style={{ fontSize: "0.8rem", color: "#0f172a" }}>{sec.name}</h4>
                <p style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{sec.desc}</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => moveUp(idx)}
                disabled={idx === 0}
                className="adm-icon-btn"
                style={{ opacity: idx === 0 ? 0.3 : 1, cursor: idx === 0 ? "not-allowed" : "pointer" }}
                title="ზემოთ აწევა"
              >
                <MoveUp size={14} />
              </button>

              <button
                type="button"
                onClick={() => moveDown(idx)}
                disabled={idx === sections.length - 1}
                className="adm-icon-btn"
                style={{ opacity: idx === sections.length - 1 ? 0.3 : 1, cursor: idx === sections.length - 1 ? "not-allowed" : "pointer" }}
                title="ქვემოთ ჩამოწევა"
              >
                <MoveDown size={14} />
              </button>

              <label style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginLeft: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={sec.enabled}
                  onChange={() => toggleSection(sec.id)}
                  style={{ width: "1rem", height: "1rem", accentColor: "#6366f1" }}
                />
                <span style={{ fontSize: "0.72rem", color: sec.enabled ? "#16a34a" : "#94a3b8" }}>
                  {sec.enabled ? "აქტიური" : "გათიშული"}
                </span>
              </label>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
