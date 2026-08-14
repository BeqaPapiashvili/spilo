"use client";

import { useState, useEffect } from "react";

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return navigator.onLine;
    }
    return true;
  });

  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timer: NodeJS.Timeout | null = null;

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setWasOffline(false);
      }, 3500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (timer) clearTimeout(timer);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return { isOnline, wasOffline };
}
