"use client";

import React, { useState, useRef, useMemo } from "react";
import { 
  UploadCloud, FileSpreadsheet, Download, Check, AlertCircle, 
  X, Loader2, Search, Trash2, Eye, Info, CheckCircle2, AlertTriangle, RefreshCw
} from "lucide-react";
import { 
  parseExcelOrCSV, 
  generateSampleExcelWorkbook, 
  downloadFile, 
  ParsedImportProduct 
} from "@/utils/exportImport";

export const ProductImportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [products, setProducts] = useState<ParsedImportProduct[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [successData, setSuccessData] = useState<{ created: number; updated: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "selected" | "invalid">("all");
  const [activeSpecProduct, setActiveSpecProduct] = useState<ParsedImportProduct | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const bytes = generateSampleExcelWorkbook();
    downloadFile("spilo_products_template.xlsx", bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  };

  const handleFileSelect = async (selectedFile: File | null) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsParsing(true);
    setSuccessData(null);
    setFileErrors([]);

    try {
      const { products: parsed, errors } = await parseExcelOrCSV(selectedFile);
      setProducts(parsed);
      setFileErrors(errors);
    } catch (err: any) {
      console.error("Parse error:", err);
      setFileErrors([err.message || "ფაილის წაკითხვა ვერ მოხერხდა"]);
    } finally {
      setIsParsing(false);
    }
  };

  // Toggle selection for a single product
  const toggleSelectProduct = (id: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, selected: !p.selected };
      }
      return p;
    }));
  };

  // Select all or deselect all
  const selectAll = (select: boolean) => {
    setProducts(prev => prev.map(p => ({
      ...p,
      selected: select ? p.isValid : false
    })));
  };

  // Update product field inline in review table
  const updateProductField = (id: string, field: "price" | "costPrice" | "stock" | "title", value: any) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;

      const updated = { ...p, [field]: value };
      // Revalidate
      const errs: string[] = [];
      if (!updated.title.trim()) errs.push("სათაური აკლია");
      if (isNaN(Number(updated.price)) || Number(updated.price) <= 0) errs.push("ფასი არასწორია");
      updated.validationErrors = errs;
      updated.isValid = errs.length === 0;
      return updated;
    }));
  };

  // Remove single row from review list
  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Filtered view
  const displayedProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !searchQuery.trim() || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brandName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === "selected") return p.selected;
      if (statusFilter === "invalid") return !p.isValid;
      return true;
    });
  }, [products, searchQuery, statusFilter]);

  const selectedCount = products.filter(p => p.selected).length;
  const validCount = products.filter(p => p.isValid).length;
  const invalidCount = products.filter(p => !p.isValid).length;

  // Perform bulk import for approved/selected items
  const handleApproveAndImport = async () => {
    const toImport = products.filter(p => p.selected && p.isValid);
    if (toImport.length === 0) return;

    setIsImporting(true);
    try {
      const res = await fetch("/api/products/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: toImport }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessData({
          created: json.createdCount || 0,
          updated: json.updatedCount || 0,
        });
      } else {
        alert(json.error || "იმპორტი ვერ მოხერხდა");
      }
    } catch (err: any) {
      console.error("Import request failed:", err);
      alert(err.message || "კავშირის შეცდომა სერვერთან");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="adm-modal-overlay">
      <div 
        className="adm-modal" 
        style={{ 
          maxWidth: products.length > 0 ? "1180px" : "640px", 
          width: "95%", 
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Header */}
        <div className="adm-modal-header" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <h3 style={{ fontSize: "1.05rem", color: "#0f172a", marginBottom: "3px" }}>
              პროდუქტების იმპორტი და ადმინისტრაციის გადამოწმება
            </h3>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              ატვირთეთ ექსელის (.xlsx) ან CSV ფაილი, გადაამოწმეთ მონაცემები და დაადასტურეთ საიტზე განთავსება
            </p>
          </div>
          <button onClick={onClose} className="adm-icon-btn">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="adm-modal-body" style={{ padding: "1.25rem 1.5rem", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          {/* STEP 1: Upload state when no products loaded */}
          {products.length === 0 && successData === null && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              
              {/* Template Download Card */}
              <div style={{ padding: "1rem 1.25rem", borderRadius: "0.875rem", background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                  <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.625rem", background: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileSpreadsheet size={20} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.82rem", color: "#0f172a", marginBottom: "2px" }}>
                      ოფიციალური 23-სვეტიანი შაბლონის ჩამოტვირთვა
                    </p>
                    <p style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                      შეიცავს ქართულ და ლათინურ ჰედერებს, შევსების მაგალითებსა და ფორმატს
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="adm-btn-secondary"
                  style={{ fontSize: "0.75rem", padding: "0.45rem 1rem", gap: "0.5rem" }}
                >
                  <Download size={14} />
                  <span>შაბლონი (.xlsx)</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                style={{
                  border: isDragging ? "2px dashed #6366f1" : "2px dashed #cbd5e1",
                  borderRadius: "1rem",
                  background: isDragging ? "#eef2ff" : (isParsing ? "#f8fafc" : "#fafafa"),
                  padding: "2.5rem 1.5rem",
                  textAlign: "center",
                  cursor: isParsing ? "wait" : "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.75rem",
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                  accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,text/plain"
                  style={{ display: "none" }}
                />
                <div style={{ width: "3.25rem", height: "3.25rem", borderRadius: "0.875rem", background: isDragging ? "#e0e7ff" : "#eef2ff", color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isParsing ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} />}
                </div>
                <div>
                  <p style={{ fontSize: "0.88rem", color: "#0f172a", marginBottom: "4px" }}>
                    {isParsing ? "მიმდინარეობს ფაილის წაკითხვა..." : (file ? file.name : (isDragging ? "ჩააგდეთ ფაილი აქ" : "დააჭირეთ ან ჩააგდეთ ექსელის ფაილი აქ"))}
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                    მხარდაჭერილია Microsoft Excel (.xlsx, .xls) და CSV (.csv) ფორმატები
                  </p>
                </div>
              </div>

              {/* Error list if parsing failed */}
              {fileErrors.length > 0 && (
                <div className="adm-alert adm-alert-amber">
                  <AlertCircle size={16} />
                  <span style={{ fontSize: "0.75rem" }}>{fileErrors[0]}</span>
                </div>
              )}

              {/* Instructions Guide */}
              <div style={{ background: "#ffffff", border: "1px solid #f1f5f9", borderRadius: "0.875rem", padding: "1rem" }}>
                <p style={{ fontSize: "0.78rem", color: "#334155", marginBottom: "0.5rem" }}>
                  როგორ მუშაობს ადმინისტრაციის გადამოწმება:
                </p>
                <ul style={{ fontSize: "0.72rem", color: "#64748b", lineHeight: "1.6", paddingLeft: "1.25rem", listStyleType: "disc" }}>
                  <li>ფაილის ატვირთვის შემდეგ საიტზე პირდაპირ არაფერი დაემატება.</li>
                  <li>ეკრანზე გაიშლება გადამოწმების სამუშაო გარემო ყველა პროდუქტის დეტალით.</li>
                  <li>ადმინისტრატორს შეუძლია გადაამოწმოს ფასები, მარაგი, სურათები და მახასიათებლები.</li>
                  <li>მხოლოდ იმ პროდუქტებს მონიშნავთ და დაამტკიცებთ, რომლებიც გადამოწმებულია.</li>
                </ul>
              </div>

            </div>
          )}

          {/* STEP 2: VERIFICATION WORKSPACE (When products are loaded) */}
          {products.length > 0 && successData === null && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              {/* Summary Stats Strip */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
                <div style={{ padding: "0.75rem 1rem", borderRadius: "0.75rem", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.68rem", color: "#64748b" }}>სულ ფაილში</span>
                  <p style={{ fontSize: "1.1rem", color: "#0f172a" }}>{products.length} პროდუქტი</p>
                </div>
                <div style={{ padding: "0.75rem 1rem", borderRadius: "0.75rem", background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
                  <span style={{ fontSize: "0.68rem", color: "#065f46" }}>ვალიდური</span>
                  <p style={{ fontSize: "1.1rem", color: "#047857" }}>{validCount}</p>
                </div>
                <div style={{ padding: "0.75rem 1rem", borderRadius: "0.75rem", background: invalidCount > 0 ? "#fef2f2" : "#f8fafc", border: `1px solid ${invalidCount > 0 ? "#fecaca" : "#e2e8f0"}` }}>
                  <span style={{ fontSize: "0.68rem", color: invalidCount > 0 ? "#991b1b" : "#64748b" }}>ხარვეზით</span>
                  <p style={{ fontSize: "1.1rem", color: invalidCount > 0 ? "#b91c1c" : "#64748b" }}>{invalidCount}</p>
                </div>
                <div style={{ padding: "0.75rem 1rem", borderRadius: "0.75rem", background: "#eef2ff", border: "1px solid #c7d2fe" }}>
                  <span style={{ fontSize: "0.68rem", color: "#3730a3" }}>დასამტკიცებლად მონიშნული</span>
                  <p style={{ fontSize: "1.1rem", color: "#4338ca" }}>{selectedCount}</p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", padding: "0.5rem 0" }}>
                {/* Search */}
                <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
                  <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ძებნა სათაურით, SKU-ით ან ბრენდით..."
                    style={{
                      width: "100%",
                      padding: "0.45rem 0.75rem 0.45rem 2.25rem",
                      borderRadius: "0.625rem",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.75rem",
                      outline: "none"
                    }}
                  />
                </div>

                {/* Filter Tabs */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    style={{
                      padding: "0.35rem 0.75rem",
                      borderRadius: "0.5rem",
                      fontSize: "0.72rem",
                      border: "1px solid",
                      borderColor: statusFilter === "all" ? "#6366f1" : "#e2e8f0",
                      background: statusFilter === "all" ? "#eef2ff" : "#ffffff",
                      color: statusFilter === "all" ? "#4338ca" : "#64748b",
                      cursor: "pointer"
                    }}
                  >
                    ყველა ({products.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("selected")}
                    style={{
                      padding: "0.35rem 0.75rem",
                      borderRadius: "0.5rem",
                      fontSize: "0.72rem",
                      border: "1px solid",
                      borderColor: statusFilter === "selected" ? "#6366f1" : "#e2e8f0",
                      background: statusFilter === "selected" ? "#eef2ff" : "#ffffff",
                      color: statusFilter === "selected" ? "#4338ca" : "#64748b",
                      cursor: "pointer"
                    }}
                  >
                    მონიშნული ({selectedCount})
                  </button>
                  {invalidCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setStatusFilter("invalid")}
                      style={{
                        padding: "0.35rem 0.75rem",
                        borderRadius: "0.5rem",
                        fontSize: "0.72rem",
                        border: "1px solid",
                        borderColor: statusFilter === "invalid" ? "#ef4444" : "#fecaca",
                        background: statusFilter === "invalid" ? "#fef2f2" : "#ffffff",
                        color: "#b91c1c",
                        cursor: "pointer"
                      }}
                    >
                      ხარვეზით ({invalidCount})
                    </button>
                  )}
                </div>

                {/* Bulk Select Toggles */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => selectAll(true)}
                    className="adm-btn-secondary"
                    style={{ fontSize: "0.7rem", padding: "0.35rem 0.65rem" }}
                  >
                    ყველას მონიშვნა
                  </button>
                  <button
                    type="button"
                    onClick={() => selectAll(false)}
                    className="adm-btn-secondary"
                    style={{ fontSize: "0.7rem", padding: "0.35rem 0.65rem" }}
                  >
                    მოხსნა
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProducts([]);
                      setFile(null);
                    }}
                    className="adm-btn-secondary"
                    style={{ fontSize: "0.7rem", padding: "0.35rem 0.65rem", gap: "0.25rem" }}
                    title="სხვა ფაილის ატვირთვა"
                  >
                    <RefreshCw size={12} />
                    <span>ახალი ფაილი</span>
                  </button>
                </div>
              </div>

              {/* Review Table */}
              <div style={{ border: "1px solid #e2e8f0", borderRadius: "0.875rem", overflow: "hidden", maxHeight: "380px", overflowY: "auto" }}>
                <table className="adm-table" style={{ fontSize: "0.72rem", width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 10, borderBottom: "1px solid #e2e8f0" }}>
                    <tr>
                      <th style={{ width: "40px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={selectedCount === validCount && validCount > 0}
                          onChange={(e) => selectAll(e.target.checked)}
                          style={{ cursor: "pointer" }}
                        />
                      </th>
                      <th style={{ width: "50px" }}>ფოტო</th>
                      <th>პროდუქტი და SKU</th>
                      <th>კატეგორია & ბრენდი</th>
                      <th style={{ width: "110px" }}>გასაყიდი ფასი (₾)</th>
                      <th style={{ width: "95px" }}>ასაღები (₾)</th>
                      <th style={{ width: "85px" }}>მარაგი</th>
                      <th>მახასიათებლები</th>
                      <th>სტატუსი</th>
                      <th style={{ width: "50px", textAlign: "center" }}>წაშლა</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                          არჩეული ფილტრით პროდუქტები არ მოიძებნა
                        </td>
                      </tr>
                    ) : (
                      displayedProducts.map((p) => (
                        <tr 
                          key={p.id} 
                          style={{ 
                            background: !p.isValid ? "#fff5f5" : (p.selected ? "#f8fafc" : "#ffffff"),
                            transition: "background 0.15s"
                          }}
                        >
                          {/* Checkbox */}
                          <td style={{ textAlign: "center" }}>
                            <input
                              type="checkbox"
                              checked={p.selected}
                              disabled={!p.isValid}
                              onChange={() => toggleSelectProduct(p.id)}
                              style={{ cursor: p.isValid ? "pointer" : "not-allowed" }}
                            />
                          </td>

                          {/* Image */}
                          <td>
                            <div style={{ width: "36px", height: "36px", borderRadius: "0.375rem", background: "#f1f5f9", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {p.mainImage ? (
                                <img 
                                  src={p.mainImage} 
                                  alt="" 
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: "0.6rem", color: "#cbd5e1" }}>N/A</span>
                              )}
                            </div>
                          </td>

                          {/* Title & SKU */}
                          <td style={{ maxWidth: "260px" }}>
                            <input
                              type="text"
                              value={p.title}
                              onChange={(e) => updateProductField(p.id, "title", e.target.value)}
                              style={{
                                width: "100%",
                                border: "1px solid transparent",
                                background: "transparent",
                                fontSize: "0.72rem",
                                color: "#0f172a",
                                padding: "2px 4px",
                                borderRadius: "4px"
                              }}
                              onFocus={(e) => (e.target.style.borderColor = "#cbd5e1")}
                              onBlur={(e) => (e.target.style.borderColor = "transparent")}
                            />
                            <span style={{ fontSize: "0.65rem", color: "#94a3b8", fontFamily: "monospace", paddingLeft: "4px" }}>
                              SKU: {p.sku}
                            </span>
                          </td>

                          {/* Category & Brand */}
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span style={{ color: "#334155" }}>{p.categoryName}</span>
                              <span style={{ fontSize: "0.65rem", color: "#6366f1" }}>{p.brandName}</span>
                            </div>
                          </td>

                          {/* Retail Price (Editable) */}
                          <td>
                            <input
                              type="number"
                              value={p.price}
                              onChange={(e) => updateProductField(p.id, "price", parseFloat(e.target.value))}
                              style={{
                                width: "80px",
                                padding: "3px 6px",
                                borderRadius: "4px",
                                border: isNaN(p.price) || p.price <= 0 ? "1px solid #ef4444" : "1px solid #cbd5e1",
                                fontSize: "0.72rem",
                                textAlign: "right"
                              }}
                            />
                          </td>

                          {/* Cost Price */}
                          <td>
                            <input
                              type="number"
                              value={p.costPrice !== undefined ? p.costPrice : ""}
                              placeholder="-"
                              onChange={(e) => updateProductField(p.id, "costPrice", e.target.value ? parseFloat(e.target.value) : undefined)}
                              style={{
                                width: "70px",
                                padding: "3px 6px",
                                borderRadius: "4px",
                                border: "1px solid #cbd5e1",
                                fontSize: "0.72rem",
                                textAlign: "right",
                                color: "#64748b"
                              }}
                            />
                          </td>

                          {/* Stock (Editable) */}
                          <td>
                            <input
                              type="number"
                              value={p.stock}
                              onChange={(e) => updateProductField(p.id, "stock", parseInt(e.target.value, 10))}
                              style={{
                                width: "60px",
                                padding: "3px 6px",
                                borderRadius: "4px",
                                border: "1px solid #cbd5e1",
                                fontSize: "0.72rem",
                                textAlign: "center"
                              }}
                            />
                          </td>

                          {/* Specs count & inspection button */}
                          <td>
                            <button
                              type="button"
                              onClick={() => setActiveSpecProduct(p)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "0.375rem",
                                background: "#f1f5f9",
                                border: "1px solid #e2e8f0",
                                fontSize: "0.68rem",
                                color: "#334155",
                                cursor: "pointer"
                              }}
                            >
                              <Eye size={12} />
                              <span>
                                {p.specs.reduce((acc, g) => acc + g.items.length, 0)} პარამეტრი
                              </span>
                            </button>
                          </td>

                          {/* Status */}
                          <td>
                            {p.isValid ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#16a34a", fontSize: "0.68rem" }}>
                                <CheckCircle2 size={13} />
                                <span>მზადაა</span>
                              </span>
                            ) : (
                              <span 
                                title={p.validationErrors.join(", ")}
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#dc2626", fontSize: "0.68rem", cursor: "help" }}
                              >
                                <AlertTriangle size={13} />
                                <span>{p.validationErrors[0]}</span>
                              </span>
                            )}
                          </td>

                          {/* Delete */}
                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => removeProduct(p.id)}
                              style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
                              title="სიიდან ამოშლა"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* STEP 3: SUCCESS STATE */}
          {successData !== null && (
            <div style={{ padding: "2.5rem 1.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", background: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Check size={28} />
              </div>
              <div>
                <h4 style={{ fontSize: "1.1rem", color: "#0f172a", marginBottom: "4px" }}>
                  პროდუქტები წარმატებით აიტვირთა!
                </h4>
                <p style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  პროდუქტები შეინახა ბაზაში და გადავიდა „გადასამოწმებელი (Pending Review)“ სექციაში. საიტზე მყიდველებისთვის ისინი გამოჩნდება მხოლოდ ადმინისტრატორის მიერ დამოწმების შემდეგ.
                </p>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <div style={{ padding: "0.75rem 1.5rem", borderRadius: "0.75rem", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.7rem", color: "#64748b" }}>ახალი პროდუქტი</span>
                  <p style={{ fontSize: "1.2rem", color: "#0f172a" }}>+{successData.created}</p>
                </div>
                {successData.updated > 0 && (
                  <div style={{ padding: "0.75rem 1.5rem", borderRadius: "0.75rem", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>განახლებული (SKU)</span>
                    <p style={{ fontSize: "1.2rem", color: "#0f172a" }}>{successData.updated}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="adm-modal-footer" style={{ padding: "1rem 1.5rem", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            {products.length > 0 && successData === null && (
              <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                მონიშნულია <strong>{selectedCount}</strong> პროდუქტი {products.length}-დან
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button 
              type="button" 
              onClick={onClose} 
              className={successData !== null ? "adm-btn-primary" : "adm-btn-secondary"}
              style={{ fontSize: "0.75rem" }}
            >
              {successData !== null ? "გადასამოწმებელ სიაში გადასვლა" : "გაუქმება"}
            </button>

            {products.length > 0 && successData === null && (
              <button
                type="button"
                onClick={handleApproveAndImport}
                disabled={selectedCount === 0 || isImporting}
                className="adm-btn-primary"
                style={{
                  opacity: selectedCount === 0 || isImporting ? 0.5 : 1,
                  cursor: selectedCount === 0 || isImporting ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                {isImporting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>მიმდინარეობს ატვირთვა...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>გაგზავნა გადასამოწმებლად ({selectedCount})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* POPUP: Product Specifications Inspection */}
      {activeSpecProduct && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}
          onClick={() => setActiveSpecProduct(null)}
        >
          <div 
            style={{
              background: "#ffffff",
              borderRadius: "1rem",
              maxWidth: "540px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              padding: "1.5rem",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h4 style={{ fontSize: "0.95rem", color: "#0f172a", marginBottom: "2px" }}>
                  ტექნიკური მახასიათებლები
                </h4>
                <p style={{ fontSize: "0.72rem", color: "#64748b" }}>
                  {activeSpecProduct.title} ({activeSpecProduct.sku})
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setActiveSpecProduct(null)} 
                className="adm-icon-btn"
              >
                <X size={16} />
              </button>
            </div>

            {/* Structured specs view */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {activeSpecProduct.specs.length === 0 ? (
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", textAlign: "center", padding: "1rem" }}>
                  დამატებითი სპეციფიკაციები არ არის მითითებული
                </p>
              ) : (
                activeSpecProduct.specs.map((group, gIdx) => (
                  <div key={gIdx} style={{ background: "#f8fafc", borderRadius: "0.625rem", padding: "0.875rem", border: "1px solid #f1f5f9" }}>
                    <p style={{ fontSize: "0.75rem", color: "#475569", marginBottom: "0.5rem" }}>
                      {group.title}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                      {group.items.map((item, iIdx) => (
                        <div key={iIdx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
                          <span style={{ color: "#64748b" }}>{item.label}:</span>
                          <span style={{ color: "#0f172a" }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}

              {/* Photos Gallery */}
              {activeSpecProduct.allImages.length > 0 && (
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#475569", marginBottom: "0.5rem" }}>
                    ფოტოების გალერეა ({activeSpecProduct.allImages.length}):
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {activeSpecProduct.allImages.map((img, idx) => (
                      <div key={idx} style={{ width: "60px", height: "60px", borderRadius: "0.375rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
                        <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: "1.25rem", textAlign: "right" }}>
              <button
                type="button"
                onClick={() => setActiveSpecProduct(null)}
                className="adm-btn-secondary"
                style={{ fontSize: "0.72rem", padding: "0.4rem 1rem" }}
              >
                დახურვა
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
