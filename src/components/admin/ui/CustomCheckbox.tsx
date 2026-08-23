"use client";

import React from "react";
import { Check } from "lucide-react";

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  subLabel?: string;
  disabled?: boolean;
}

export function CustomCheckbox({
  checked,
  onChange,
  label,
  subLabel,
  disabled = false,
}: CustomCheckboxProps) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={`flex items-start gap-2.5 select-none transition-opacity ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer group"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 mt-0.5 border ${
          checked
            ? "bg-[#FF5238] border-[#FF5238] text-white shadow-2xs shadow-[#FF5238]/20"
            : "bg-white border-zinc-300 group-hover:border-[#FF5238] group-hover:bg-[#FFF5F2]/40"
        }`}
      >
        {checked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
      </div>

      {(label || subLabel) && (
        <div className="flex-1 min-w-0">
          {label && <p className="text-xs text-zinc-800 leading-snug group-hover:text-zinc-950 transition-colors">{label}</p>}
          {subLabel && <p className="text-[11px] text-zinc-400 mt-0.5">{subLabel}</p>}
        </div>
      )}
    </div>
  );
}
