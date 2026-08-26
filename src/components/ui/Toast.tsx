"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import { ToastMessage } from "@/types";

export interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const ToastItem: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 3500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 350 }}
      layout
      className="flex items-center gap-3 w-auto max-w-[92vw] sm:max-w-sm bg-[#1D1D1F]/95 text-white backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl py-2.5 px-4 pointer-events-auto select-none"
    >
      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
        {icons[toast.type] || icons.success}
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <p className="text-xs text-white leading-tight truncate">
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-[11px] text-white/70 truncate mt-0.5">
            {toast.message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="text-white/40 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
        aria-label="დახურვა"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};
