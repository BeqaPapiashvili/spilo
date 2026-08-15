"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, Check, Link as LinkIcon } from "lucide-react";

interface ImageUploadFieldProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  compact?: boolean;
}

export default function ImageUploadField({
  value = "",
  onChange,
  label = "სურათი (Image)",
  placeholder = "https://... ან ატვირთეთ ფაილი",
  compact = false,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("გთხოვთ აირჩიოთ სურათის ფაილი (PNG, JPG, WEBP, SVG)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("ფაილის ზომა არ უნდა აღემატებოდეს 10MB-ს");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
      } else {
        setError(data.error || "ატვირთვა ვერ მოხერხდა");
      }
    } catch (err: any) {
      console.error("Image upload failed:", err);
      setError(err.message || "სერვერთან კავშირის შეცდომა");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="block text-[11px] text-slate-600">{label}</label>}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex items-center gap-2 rounded-xl transition-all ${
          isDragging ? "ring-2 ring-blue-500 bg-blue-50/50" : ""
        }`}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Thumbnail Preview */}
        {value ? (
          <div className="relative w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 group flex items-center justify-center">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-contain p-0.5"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="წაშლა"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 border border-slate-200/80 flex items-center justify-center shrink-0">
            <ImageIcon size={16} />
          </div>
        )}

        {/* Text Input for URL */}
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="adm-input w-full text-xs font-mono pr-20"
          />
        </div>

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border transition-all shrink-0 cursor-pointer ${
            uploading
              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
              : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs hover:border-slate-300 active:scale-95"
          }`}
          title="ატვირთეთ ფაილი კომპიუტერიდან"
        >
          {uploading ? (
            <>
              <Loader2 size={13} className="animate-spin text-blue-600" />
              <span>იტვირთება...</span>
            </>
          ) : (
            <>
              <Upload size={13} className="text-blue-600" />
              <span>ატვირთვა</span>
            </>
          )}
        </button>
      </div>

      {/* Error text */}
      {error && (
        <p className="text-[10px] text-red-500">{error}</p>
      )}
    </div>
  );
}
