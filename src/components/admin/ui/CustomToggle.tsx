"use client";

import React from "react";

interface CustomToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  badge?: string;
  disabled?: boolean;
}

export function CustomToggle({
  checked,
  onChange,
  label,
  description,
  badge,
  disabled = false,
}: CustomToggleProps) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all select-none ${
        disabled
          ? "opacity-50 cursor-not-allowed bg-zinc-50 border-zinc-200"
          : checked
          ? "bg-[#FFF5F2] border-[#FED7CC] cursor-pointer"
          : "bg-white border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50/50 cursor-pointer"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {label && <span className="text-xs text-zinc-900 leading-snug">{label}</span>}
          {badge && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-md shrink-0 ${
                checked
                  ? "bg-[#FF5238] text-white"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>

      {/* Switch Bubble */}
      <div
        className={`w-11 h-6 rounded-full transition-colors duration-200 relative shrink-0 p-0.5 ${
          checked ? "bg-[#FF5238]" : "bg-zinc-200"
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </div>
  );
}
