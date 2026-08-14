"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export const NetworkStatusToast: React.FC = () => {
  const { isOnline, wasOffline } = useNetworkStatus();

  // Show banner if offline OR if connection just recovered (wasOffline is true)
  const showToast = !isOnline || wasOffline;

  return (
    <AnimatePresence>
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none px-4 w-full max-w-md flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md border text-xs md:text-sm font-medium ${
              !isOnline
                ? "bg-red-600/90 border-red-500/40 text-white"
                : "bg-emerald-600/90 border-emerald-500/40 text-white"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              {!isOnline ? (
                <WifiOff className="w-4 h-4 text-white animate-pulse" />
              ) : (
                <Wifi className="w-4 h-4 text-white" />
              )}
            </div>

            <div className="flex-1">
              {!isOnline ? (
                <p className="leading-snug">
                  ინტერნეტთან კავშირი შეწყდა. გთხოვთ შეამოწმოთ ქსელი.
                </p>
              ) : (
                <p className="leading-snug">ინტერნეტთან კავშირი აღდგა</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
