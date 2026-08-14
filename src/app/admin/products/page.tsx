"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit3, Copy, Eye, Trash2, CheckSquare, Square, Package } from "lucide-react";
import { dataService } from "@/services/dataService";
import { Product } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedBrand, setSelectedBrand] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");

  useEffect(() => {
    setProducts(dataService.getProducts());
    const unsub = dataService.subscribe(() => setProducts(dataService.getProducts()));
    return () => unsub();
  }, []);

  const categories = dataService.getCategories();
  const brands = dataService.getBrands();

  const filtered = products.filter((p) => {
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) || p.brandName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === "ALL" || p.categoryId === selectedCategory;
    const matchBrand = selectedBrand === "ALL" || p.brandId === selectedBrand;
    let matchStock = true;
    if (stockFilter === "IN_STOCK") matchStock = p.stock > 0;
    if (stockFilter === "LOW_STOCK") matchStock = p.stock > 0 && p.stock <= 5;
    if (stockFilter === "OUT_OF_STOCK") matchStock = p.stock === 0;
    return matchSearch && matchCat && matchBrand && matchStock;
  });

  const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(p => p.id));
  const toggleOne = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleDelete = (id: string) => {
    if (confirm("პროდუქტის წაშლა?")) { dataService.deleteProduct(id); setSelectedIds(prev => prev.filter(x => x !== id)); }
  };
  const handleBulkDelete = () => {
    if (confirm(`${selectedIds.length} პროდუქტის წაშლა?`)) { selectedIds.forEach(id => dataService.deleteProduct(id)); setSelectedIds([]); }
  };
  const handleDuplicate = (p: Product) => {
    dataService.saveProduct({ ...p, id: undefined, title: `${p.title} (კოპია)`, slug: `${p.slug}-copy-${Date.now()}` });
  };

  const stockBadge = (p: Product) => {
    if (p.stock === 0) return <span className="adm-badge adm-badge-red">ამოწურულია</span>;
    if (p.stock <= 5) return <span className="adm-badge adm-badge-amber">{p.stock} ცალი ⚠</span>;
    return <span className="adm-badge adm-badge-green">{p.stock} ცალი</span>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div className="adm-card" style={{ padding: "1.5rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div className="adm-eyebrow" style={{ marginBottom: "0.375rem" }}>
            <Package size={13} /> კატალოგის მართვა
          </div>
          <h1 className="adm-page-title">პროდუქტები ({filtered.length})</h1>
          <p className="adm-page-desc">პროდუქტების სია, ფასები, მარაგები, SKU და სწრაფი მოქმედებები.</p>
        </div>
        <Link href="/admin/products/new" className="adm-btn-primary">
          <Plus size={15} /> ახალი პროდუქტი
        </Link>
      </div>

      {/* Filters */}
      <div className="adm-card" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 220px", minWidth: "180px" }}>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="ძიება: სახელი, SKU, ბრენდი..." className="adm-search-input" />
            <Search size={14} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
          </div>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="adm-select">
            <option value="ALL">ყველა კატეგორია</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} className="adm-select">
            <option value="ALL">ყველა ბრენდი</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={stockFilter} onChange={e => setStockFilter(e.target.value)} className="adm-select">
            <option value="ALL">მარაგი</option>
            <option value="IN_STOCK">მარაგშია</option>
            <option value="LOW_STOCK">მცირე (≤5)</option>
            <option value="OUT_OF_STOCK">ამოწურული</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div style={{ marginTop: "0.875rem", padding: "0.75rem 1rem", background: "#eff6ff", borderRadius: "0.75rem", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.75rem", color: "#1e3a8a" }}>არჩეულია {selectedIds.length} პროდუქტი</span>
            <button onClick={handleBulkDelete} className="adm-btn-danger" style={{ padding: "0.35rem 0.875rem" }}>
              <Trash2 size={13} /> წაშლა
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="adm-card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: "2.5rem" }}>
                  <button onClick={toggleAll} className="adm-icon-btn">
                    {selectedIds.length === filtered.length && filtered.length > 0
                      ? <CheckSquare size={15} style={{ color: "#6366f1" }} />
                      : <Square size={15} />}
                  </button>
                </th>
                <th>პროდუქტი</th>
                <th>SKU</th>
                <th>კატეგორია</th>
                <th>ბრენდი</th>
                <th>ფასი</th>
                <th>მარაგი</th>
                <th style={{ textAlign: "right" }}>მოქმედება</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((p) => {
                const sel = selectedIds.includes(p.id);
                return (
                  <tr key={p.id} style={{ background: sel ? "#f5f3ff" : undefined }}>
                    <td>
                      <button onClick={() => toggleOne(p.id)} className="adm-icon-btn">
                        {sel ? <CheckSquare size={15} style={{ color: "#6366f1" }} /> : <Square size={15} />}
                      </button>
                    </td>
                    <td style={{ minWidth: "220px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <img
                          src={p.images[0] || "https://veli.store/media-cdn/__sized__/product/iphone16pro-thumbnail-200x200-95.jpg"}
                          alt={p.title}
                          style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.625rem", objectFit: "contain", background: "#f8fafc", border: "1px solid #f1f5f9", flexShrink: 0 }}
                        />
                        <div>
                          <p style={{ fontSize: "0.78rem", color: "#0f172a", lineHeight: 1.3 }}>{p.title}</p>
                          {p.isFeatured && <span style={{ fontSize: "0.65rem", color: "#6366f1" }}>★ Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: "monospace", color: "#94a3b8", fontSize: "0.7rem" }}>{p.sku || p.code || "—"}</td>
                    <td style={{ color: "#475569" }}>{p.categoryName || "ზოგადი"}</td>
                    <td style={{ color: "#475569" }}>{p.brandName || "—"}</td>
                    <td>
                      <div>
                        <span style={{ color: "#0f172a", fontSize: "0.8rem" }}>{p.discountPrice ?? p.price} ₾</span>
                        {p.discountPrice && <span style={{ fontSize: "0.65rem", color: "#94a3b8", textDecoration: "line-through", display: "block" }}>{p.price} ₾</span>}
                      </div>
                    </td>
                    <td>{stockBadge(p)}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "2px" }}>
                        <Link href={`/product/${p.id}`} target="_blank" className="adm-icon-btn adm-icon-btn-blue" title="Storefront Preview"><Eye size={14} /></Link>
                        <Link href={`/admin/products/${p.id}/edit`} className="adm-icon-btn adm-icon-btn-blue" title="რედაქტირება"><Edit3 size={14} /></Link>
                        <button onClick={() => handleDuplicate(p)} className="adm-icon-btn adm-icon-btn-blue" title="დუბლირება"><Copy size={14} /></button>
                        <button onClick={() => handleDelete(p.id)} className="adm-icon-btn adm-icon-btn-red" title="წაშლა"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "0.8rem" }}>პროდუქტები ვერ მოიძებნა</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
