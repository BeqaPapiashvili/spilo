"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { ToastItem } from "./Toast";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  return (
    <div className="fixed top-4 sm:top-6 inset-x-0 sm:inset-x-auto sm:right-6 z-50 flex flex-col items-center sm:items-end gap-2 pointer-events-none px-4 sm:px-0 max-w-full sm:max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
