"use client";

import React, { useState, useEffect } from "react";
import { Warehouse, Search, Plus, Minus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { dataService } from "@/services/dataService";
import { Product } from "@/types";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setProducts(dataService.getProducts());
    const unsub = dataService.subscribe(() => setProducts(dataService.getProducts()));
    return () => unsub();
  }, []);

  const handleAdjust = (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    dataService.saveProduct({ ...product, stock: newStock });
    dataService.logAction("Beka Papiashvili", "STOCK_ADJUSTMENT", `Product #${product.id}`, `მარაგი: ${product.stock} → ${newStock} (${delta > 0 ? `+${delta}` : delta})`);
  };

  const filtered = products.filter(p =>
    !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem" }}>
        <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}><Warehouse size={13} /> ოპერაციები</div>
        <h1 className="adm-page-title">მარაგების კონტროლი & კორექტირება</h1>
        <p className="adm-page-desc">პროდუქტების მარაგების სწრაფი კორექტირება (+/-) და მდგომარეობის მონიტორინგი.</p>
      </div>

      {/* Stock Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.875rem" }}>
        <div className="adm-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <div className="adm-icon-box" style={{ background: "#f0fdf4", color: "#16a34a" }}><CheckCircle2 size={18} /></div>
          <div>
            <p style={{ fontSize: "0.7rem", color: "#94a3b8" }}>მარაგშია</p>
            <p className="adm-metric-num">{products.filter(p => p.stock > 5).length}</p>
          </div>
        </div>
        <div className="adm-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <div className="adm-icon-box" style={{ background: "#fffbeb", color: "#d97706" }}><AlertTriangle size={18} /></div>
          <div>
            <p style={{ fontSize: "0.7rem", color: "#94a3b8" }}>მცირე მარაგი</p>
            <p className="adm-metric-num">{lowStockCount}</p>
          </div>
        </div>
        <div className="adm-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <div className="adm-icon-box" style={{ background: "#fef2f2", color: "#dc2626" }}><AlertTriangle size={18} /></div>
          <div>
            <p style={{ fontSize: "0.7rem", color: "#94a3b8" }}>ამოწურული</p>
            <p className="adm-metric-num">{outOfStockCount}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="adm-card" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ position: "relative", maxWidth: "24rem" }}>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="ძიება: პროდუქტი, SKU..." className="adm-search-input" />
          <Search size={14} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="adm-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>პროდუქტი</th>
                <th>SKU</th>
                <th>მარაგი</th>
                <th>სტატუსი</th>
                <th style={{ textAlign: "center" }}>კორექტირება</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const isOut = p.stock === 0;
                const isLow = p.stock > 0 && p.stock <= 5;
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                        <img src={p.images[0]} alt={p.title} style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem", objectFit: "contain", background: "#f8fafc", border: "1px solid #f1f5f9" }} onError={e => (e.currentTarget.style.display = "none")} />
                        <span style={{ fontSize: "0.78rem", color: "#0f172a" }}>{p.title}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: "monospace", color: "#94a3b8", fontSize: "0.7rem" }}>{p.sku || p.code || "—"}</td>
                    <td>
                      <span style={{ fontSize: "1.1rem", color: isOut ? "#dc2626" : isLow ? "#d97706" : "#0f172a", letterSpacing: "-0.02em" }}>{p.stock}</span>
                      <span style={{ fontSize: "0.65rem", color: "#94a3b8", marginLeft: "4px" }}>ც.</span>
                    </td>
                    <td>
                      {isOut
                        ? <span className="adm-badge adm-badge-red">ამოწურულია</span>
                        : isLow
                        ? <span className="adm-badge adm-badge-amber">მცირე</span>
                        : <span className="adm-badge adm-badge-green">მარაგშია</span>}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                        <button onClick={() => handleAdjust(p, -1)} className="adm-icon-btn adm-icon-btn-red" style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", border: "1px solid #fecaca", background: "#fef2f2" }}>
                          <Minus size={13} style={{ color: "#dc2626" }} />
                        </button>
                        <span style={{ fontSize: "0.8rem", color: "#0f172a", minWidth: "2rem", textAlign: "center" }}>{p.stock}</span>
                        <button onClick={() => handleAdjust(p, 1)} className="adm-icon-btn adm-icon-btn-blue" style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", border: "1px solid #bfdbfe", background: "#eff6ff" }}>
                          <Plus size={13} style={{ color: "#2563eb" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
