"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, Image as ImageIcon, Link as LinkIcon, Loader2, Check } from "lucide-react";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
  label?: string;
  helperText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  multiple = true,
  label = "სურათების ატვირთვა",
  helperText = "PNG, JPG, WebP, SVG (მაქს. 10MB)",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      if (data.urls && data.urls.length > 0) {
        if (multiple) {
          onChange([...images, ...data.urls]);
        } else {
          onChange([data.urls[0]]);
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("სურათის ატვირთვა ვერ მოხერხდა");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    if (multiple) {
      onChange([...images, urlInput.trim()]);
    } else {
      onChange([urlInput.trim()]);
    }
    setUrlInput("");
    setShowUrlInput(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <label className="adm-label" style={{ marginBottom: 0 }}>{label}</label>
          <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{helperText}</span>
        </div>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          style={{ fontSize: "0.72rem", color: "#6366f1", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
        >
          <LinkIcon size={12} />
          <span>{showUrlInput ? "ფაილის ატვირთვა" : "URL-ით დამატება"}</span>
        </button>
      </div>

      {showUrlInput ? (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="ჩასვით სურათის პირდაპირი ლინკი (https://...)"
            className="adm-input"
            style={{ flex: 1 }}
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="adm-btn-primary"
            style={{ flexShrink: 0 }}
          >
            დამატება
          </button>
        </div>
      ) : (
        /* Drag & Drop Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragging ? "2px dashed #6366f1" : "2px dashed #e2e8f0",
            borderRadius: "1rem",
            background: isDragging ? "#f5f3ff" : "#f8fafc",
            padding: "1.75rem 1.25rem",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.15s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFiles(e.target.files)}
            multiple={multiple}
            accept="image/*"
            style={{ display: "none" }}
          />

          {isUploading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6366f1", fontSize: "0.8rem" }}>
              <Loader2 size={20} className="animate-spin" />
              <span>სურათი იტვირთება...</span>
            </div>
          ) : (
            <>
              <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "0.75rem", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
                <UploadCloud size={20} />
              </div>
              <div>
                <p style={{ fontSize: "0.8rem", color: "#0f172a", marginBottom: "2px" }}>
                  ჩააგდეთ სურათი აქ ან <span style={{ color: "#6366f1", textDecoration: "underline" }}>აირჩიეთ ფაილი</span>
                </p>
                <p style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
                  მხარდაჭერილია ერთდროულად რამდენიმე სურათის ატვირთვა
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Previews Grid */}
      {images && images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "0.625rem", marginTop: "0.25rem" }}>
          {images.map((imgUrl, idx) => (
            <div
              key={idx}
              style={{
                position: "relative",
                width: "100%",
                paddingTop: "100%",
                borderRadius: "0.75rem",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <img
                src={imgUrl}
                alt={`uploaded-${idx}`}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: "4px",
                }}
              />
              {idx === 0 && multiple && (
                <span
                  style={{
                    position: "absolute",
                    bottom: "4px",
                    left: "4px",
                    background: "rgba(15,23,42,0.75)",
                    color: "#fff",
                    fontSize: "0.55rem",
                    padding: "1px 5px",
                    borderRadius: "4px",
                  }}
                >
                  მთავარი
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(idx);
                }}
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "rgba(220, 38, 38, 0.9)",
                  color: "#ffffff",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
