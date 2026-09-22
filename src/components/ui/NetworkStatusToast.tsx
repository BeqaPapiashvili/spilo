"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export const NetworkStatusToast: React.FC = () => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const showToast = !isOnline || wasOffline;

  return (
    <AnimatePresence>
      {showToast && (
        <div className="fixed top-[72px] sm:top-[100px] left-1/2 -translate-x-1/2 z-[80] pointer-events-none px-3 w-full max-w-[320px]">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="pointer-events-auto flex items-start gap-2.5 rounded-xl bg-white pl-3.5 pr-3 py-2.5 border border-[#E8E8EA] shadow-[0_4px_18px_rgba(17,17,17,0.07)]"
          >
            {!isOnline ? (
              <WifiOff className="w-4 h-4 mt-[3px] text-[#FF5238] shrink-0" strokeWidth={2} />
            ) : (
              <Wifi className="w-4 h-4 mt-[3px] text-[#2F9E5C] shrink-0" strokeWidth={2} />
            )}
            <p className="text-[13px] text-[#1D1D1F] leading-[1.35]">
              {!isOnline ? "ინტერნეტთან კავშირი შეწყდა" : "ინტერნეტთან კავშირი აღდგა"}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
