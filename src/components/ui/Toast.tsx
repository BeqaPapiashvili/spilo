"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      layout
      className="flex items-start gap-3 w-full max-w-sm bg-white/95 backdrop-blur-md border border-gray-100 shadow-xl rounded-2xl p-4 text-gray-900 pointer-events-auto"
    >
      {icons[toast.type]}
      <div className="flex-1 text-xs">
        <p className="text-sm text-gray-900">{toast.title}</p>
        {toast.message && <p className="text-gray-500 mt-0.5">{toast.message}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-gray-600 p-0.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
