"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function NavigationProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const startProgress = useCallback(() => {
    clearAllTimers();
    setIsNavigating(true);
    setProgress(25);

    const t1 = setTimeout(() => setProgress(65), 120);
    const t2 = setTimeout(() => setProgress(85), 280);
    timersRef.current.push(t1, t2);
  }, []);

  const completeProgress = useCallback(() => {
    clearAllTimers();
    setProgress(100);
    const t = setTimeout(() => {
      setIsNavigating(false);
      setProgress(0);
    }, 350);
    timersRef.current.push(t);
  }, []);

  // When pathname or searchParams change (Route transition finished)
  useEffect(() => {
    // Scroll to top immediately on route change
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // Finish progress bar
    completeProgress();

    return () => clearAllTimers();
  }, [pathname, searchParams, completeProgress]);

  // Intercept legitimate navigation clicks in bubble phase
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      // If event was prevented by Swiper or other drag handlers, do nothing!
      if (event.defaultPrevented) return;

      const target = (event.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      const targetAttr = target.getAttribute("target");

      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("//") &&
        targetAttr !== "_blank" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        !event.altKey
      ) {
        // Ignore hash anchor links (e.g. #specs, #reviews)
        if (href.startsWith("#") || target.hash && target.pathname === window.location.pathname) {
          return;
        }

        const currentUrl = window.location.pathname + window.location.search;
        const targetUrl = target.pathname + target.search;

        // If clicking link to the exact same page, do not trigger progress bar
        if (targetUrl === currentUrl) {
          return;
        }

        // Start progress bar only for real navigation to a new route
        startProgress();
      }
    };

    // Use bubble phase (false) so swiper / carousel drag cancellations take effect first
    document.addEventListener("click", handleAnchorClick, false);
    return () => {
      document.removeEventListener("click", handleAnchorClick, false);
      clearAllTimers();
    };
  }, [startProgress]);

  if (!isNavigating && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] h-[3px] pointer-events-none bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-linear-to-r from-[#FF5238] via-[#FF7A00] to-[#FF5238] shadow-[0_0_10px_rgba(255,82,56,0.5)] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition:
            progress === 100
              ? "width 150ms ease-out, opacity 350ms 100ms ease"
              : "width 200ms ease-out",
        }}
      />
    </div>
  );
}

export function NavigationProgressBar() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressBarInner />
    </Suspense>
  );
}
