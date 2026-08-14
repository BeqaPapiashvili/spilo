"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, Download, Check, AlertCircle, X, Loader2, Sparkles } from "lucide-react";
import { parseProductsCSV, generateSampleProductsCSV, downloadFile, ParsedProduct } from "@/utils/exportImport";
import { dataService } from "@/services/dataService";

export const ProductImportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const sample = generateSampleProductsCSV();
    downloadFile("spilo_products_template.csv", sample);
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const { products, errors } = parseProductsCSV(text);
        setParsedProducts(products);
        setErrors(errors);
      }
    };
    reader.readAsText(selectedFile, "UTF-8");
  };

  const handleImport = () => {
    if (parsedProducts.length === 0) return;

    setIsProcessing(true);
    let count = 0;

    parsedProducts.forEach((p) => {
      dataService.saveProduct(p);
      count++;
    });

    dataService.logAction(
      "Beka Papiashvili",
      "BULK_PRODUCT_IMPORT",
      `Products Import`,
      `წარმატებით დაიმპორტდა ${count} ახალი პროდუქტი CSV ფაილიდან (${file?.name || "import.csv"})`
    );

    setIsProcessing(false);
    setSuccessCount(count);
  };

  return (
    <div className="adm-modal-overlay">
      <div className="adm-modal adm-modal-lg">
        {/* Header */}
        <div className="adm-modal-header">
          <div>
            <h3 style={{ fontSize: "1rem", color: "#0f172a", marginBottom: "2px" }}>
              პროდუქტების მასობრივი იმპორტი (Excel / CSV)
            </h3>
            <p style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
              ატვირთეთ CSV ფაილი ასობით პროდუქტის ერთბაშად დასამატებლად
            </p>
          </div>
          <button onClick={onClose} className="adm-icon-btn">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="adm-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          {/* Step 1: Download Sample */}
          <div style={{ padding: "0.875rem 1.25rem", borderRadius: "0.875rem", background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem", background: "#eef2ff", color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={15} />
              </div>
              <div>
                <p style={{ fontSize: "0.78rem", color: "#0f172a" }}>შაბლონის ჩამოტვირთვა</p>
                <p style={{ fontSize: "0.68rem", color: "#94a3b8" }}>გამოიყენეთ წინასწარ გამზადებული CSV სტრუქტურა</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="adm-btn-secondary"
              style={{ fontSize: "0.72rem", padding: "0.4rem 0.875rem" }}
            >
              <Download size={13} />
              <span>შაბლონი (.csv)</span>
            </button>
          </div>

          {/* Step 2: Upload CSV File */}
          {successCount === null && (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: "1rem",
                background: "#fafafa",
                padding: "1.5rem",
                textAlign: "center",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                accept=".csv"
                style={{ display: "none" }}
              />
              <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "0.75rem", background: "#eef2ff", color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UploadCloud size={20} />
              </div>
              <p style={{ fontSize: "0.8rem", color: "#0f172a" }}>
                {file ? file.name : "დააჭირეთ ან ჩააგდეთ CSV ფაილი აქ"}
              </p>
              <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
                მხარდაჭერილია .csv (UTF-8) ფორმატი
              </span>
            </div>
          )}

          {/* Success Message */}
          {successCount !== null && (
            <div className="adm-alert adm-alert-green" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Check size={18} />
                <span style={{ fontSize: "0.85rem" }}>იმპორტი წარმატებით დასრულდა!</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#166534" }}>
                წარმატებით დაემატა <strong>{successCount}</strong> ახალი პროდუქტი. შეგიძლიათ ფანჯრის დახურვა.
              </p>
            </div>
          )}

          {/* Validation & Errors */}
          {errors.length > 0 && (
            <div className="adm-alert adm-alert-amber" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.375rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertCircle size={15} />
                <span style={{ fontSize: "0.78rem" }}>გაფრთხილება: ნაპოვნია შეცდომები ({errors.length})</span>
              </div>
              <ul style={{ fontSize: "0.68rem", paddingLeft: "1.25rem", listStyleType: "disc" }}>
                {errors.slice(0, 4).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
                {errors.length > 4 && <li>...და კიდევ {errors.length - 4} შეცდომა</li>}
              </ul>
            </div>
          )}

          {/* Preview Table */}
          {parsedProducts.length > 0 && successCount === null && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#0f172a" }}>
                  დასაიმპორტებელი პროდუქტები ({parsedProducts.length})
                </span>
                <span className="adm-badge adm-badge-green">ვალიდურია</span>
              </div>
              <div style={{ maxHeight: "160px", overflowY: "auto", border: "1px solid #f1f5f9", borderRadius: "0.75rem" }}>
                <table className="adm-table" style={{ fontSize: "0.7rem" }}>
                  <thead>
                    <tr>
                      <th>სათაური</th>
                      <th>SKU</th>
                      <th>ფასი</th>
                      <th>მარაგი</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedProducts.slice(0, 10).map((p, idx) => (
                      <tr key={idx}>
                        <td style={{ color: "#0f172a", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.title}
                        </td>
                        <td style={{ fontFamily: "monospace", color: "#94a3b8" }}>{p.sku}</td>
                        <td style={{ color: "#0f172a" }}>{p.price} ₾</td>
                        <td>{p.stock} ც.</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="adm-modal-footer">
          <button type="button" onClick={onClose} className="adm-btn-secondary">
            {successCount !== null ? "დახურვა" : "გაუქმება"}
          </button>
          {successCount === null && (
            <button
              type="button"
              onClick={handleImport}
              disabled={parsedProducts.length === 0 || isProcessing}
              className="adm-btn-primary"
              style={{ opacity: parsedProducts.length === 0 ? 0.5 : 1, cursor: parsedProducts.length === 0 ? "not-allowed" : "pointer" }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>მიმდინარეობს...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>იმპორტის დაწყება ({parsedProducts.length})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
