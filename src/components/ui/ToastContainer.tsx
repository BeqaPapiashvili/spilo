"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { ToastItem } from "./Toast";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed z-[80] pointer-events-none top-[72px] sm:top-[100px] inset-x-3 sm:inset-x-auto sm:right-4 flex flex-col items-stretch sm:items-end gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
