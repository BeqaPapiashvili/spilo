"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Check, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import { ToastMessage } from "@/types";

export interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const ICONS = {
  success: Check,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const ICON_COLOR = {
  success: "text-[#2F9E5C]",
  error: "text-[#FF5238]",
  info: "text-[#8B8F97]",
  warning: "text-[#C9841A]",
};

export const ToastItem: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const duration = toast.duration || 3200;
  const Icon = ICONS[toast.type] || Info;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      layout
      role="status"
      className="pointer-events-auto w-full max-w-[320px] rounded-xl bg-white pl-3.5 pr-2.5 py-2.5 flex items-start gap-2.5 border border-[#E8E8EA] shadow-[0_4px_18px_rgba(17,17,17,0.07)]"
    >
      <Icon className={`w-4 h-4 mt-[3px] shrink-0 ${ICON_COLOR[toast.type] || ICON_COLOR.info}`} strokeWidth={2} />

      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-[#1D1D1F] leading-[1.35]">{toast.title}</p>
        {toast.message && toast.message !== toast.title && (
          <p className="mt-0.5 text-[12px] text-[#8B8F97] leading-[1.4] line-clamp-2">
            {toast.message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="mt-0.5 p-1 text-[#C4C6CB] hover:text-[#1D1D1F] cursor-pointer shrink-0"
        aria-label="დახურვა"
      >
        <X className="w-3.5 h-3.5" strokeWidth={1.75} />
      </button>
    </motion.div>
  );
};
