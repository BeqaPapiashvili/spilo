"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: "right" | "left";
  children: React.ReactNode;
  maxWidth?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  position = "right",
  children,
  maxWidth = "max-w-md",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const slideVariants = {
    right: {
      initial: { x: "100%" },
      animate: { x: 0 },
      exit: { x: "100%" },
    },
    left: {
      initial: { x: "-100%" },
      animate: { x: 0 },
      exit: { x: "-100%" },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          <motion.div
            initial={slideVariants[position].initial}
            animate={slideVariants[position].animate}
            exit={slideVariants[position].exit}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className={`fixed inset-y-0 ${
              position === "right" ? "right-0" : "left-0"
            } w-full ${maxWidth} bg-white shadow-2xl z-10 flex flex-col`}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-base text-gray-900">{title}</h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {!title && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
