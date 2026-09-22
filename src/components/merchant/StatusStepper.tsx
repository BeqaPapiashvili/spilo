"use client";

import { Check, MousePointerClick } from "lucide-react";

export type StatusStep = {
  key: string;
  label: string;
};

export function StatusStepper({
  steps,
  value,
  disabled,
  onChange,
  title,
  hint,
  currentLabel,
  nextLabel,
}: {
  steps: StatusStep[];
  value: string;
  disabled?: boolean;
  onChange: (key: string) => void;
  title?: string;
  hint?: string;
  currentLabel?: string;
  nextLabel?: string;
}) {
  const currentIndex = steps.findIndex((step) => step.key === value);

  return (
    <div className="space-y-4">
      {(title || hint) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          {title ? <p className="text-sm text-slate-900">{title}</p> : <span />}
          {hint && (
            <p className="text-xs text-[#FF5238] inline-flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5" />
              {hint}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {steps.map((step, index) => {
          const done = currentIndex >= 0 && index < currentIndex;
          const active = step.key === value;
          const next = index === currentIndex + 1;
          return (
            <button
              key={step.key}
              type="button"
              disabled={disabled || active}
              onClick={() => onChange(step.key)}
              className={`group rounded-2xl border px-3 py-3 text-left transition-all ${
                active
                  ? "bg-[#FF5238] border-[#FF5238] text-white shadow-sm"
                  : next
                    ? "bg-[#FFF5F2] border-[#FF5238] text-slate-900 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer"
                    : done
                      ? "bg-white border-slate-200 text-slate-700 hover:border-[#FF5238] hover:-translate-y-0.5 cursor-pointer"
                      : "bg-white border-dashed border-slate-300 text-slate-500 hover:border-[#FF5238] hover:text-slate-800 hover:-translate-y-0.5 cursor-pointer"
              } disabled:cursor-default disabled:hover:translate-y-0`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] shrink-0 ${
                    active
                      ? "bg-white text-[#FF5238]"
                      : next
                        ? "bg-[#FF5238] text-white"
                        : done
                          ? "bg-[#FF5238] text-white"
                          : "bg-slate-100 text-slate-400 group-hover:bg-[#FFF5F2] group-hover:text-[#FF5238]"
                  }`}
                >
                  {done || active ? <Check className="w-3.5 h-3.5" /> : index + 1}
                </span>
                <span className="text-xs">{step.label}</span>
              </span>
              <span className={`block mt-2 text-[10px] ${active ? "text-white/80" : next ? "text-[#FF5238]" : "text-slate-400"}`}>
                {active ? currentLabel : nextLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
