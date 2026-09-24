"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ProductPageLoading } from "@/components/skeletons/ProductPageLoading";

function isStorefrontProductHref(href: string, pathnameFromAnchor?: string) {
  const path = pathnameFromAnchor || href.split("?")[0];
  return path.startsWith("/product/") && !path.startsWith("/admin");
}

function NavigationProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isProductNav, setIsProductNav] = useState(false);
  const [progress, setProgress] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const startedAtRef = useRef(0);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const startProgress = useCallback((product = false) => {
    clearAllTimers();
    startedAtRef.current = Date.now();
    setIsNavigating(true);
    setIsProductNav(product);
    setProgress(16);

    const t1 = setTimeout(() => setProgress(48), 80);
    const t2 = setTimeout(() => setProgress(72), 220);
    const t3 = setTimeout(() => setProgress(88), 700);
    timersRef.current.push(t1, t2, t3);
  }, []);

  const completeProgress = useCallback(() => {
    if (!startedAtRef.current) return;

    const elapsed = Date.now() - startedAtRef.current;
    const delay = Math.max(0, 450 - elapsed);
    clearAllTimers();

    const t1 = setTimeout(() => {
      setProgress(100);
      const t2 = setTimeout(() => {
        setIsNavigating(false);
        setIsProductNav(false);
        setProgress(0);
        startedAtRef.current = 0;
      }, 240);
      timersRef.current.push(t2);
    }, delay);

    timersRef.current.push(t1);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    completeProgress();
    return () => clearAllTimers();
  }, [pathname, searchParams, completeProgress]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.defaultPrevented) return;

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
        if (href.startsWith("#") || (target.hash && target.pathname === window.location.pathname)) {
          return;
        }

        const currentUrl = window.location.pathname + window.location.search;
        const targetUrl = target.pathname + target.search;

        if (targetUrl === currentUrl) {
          return;
        }

        startProgress(isStorefrontProductHref(href, target.pathname));
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
      clearAllTimers();
    };
  }, [startProgress]);

  if (!isNavigating && progress === 0) return null;

  return (
    <>
      <div
        className="fixed left-0 right-0 z-[99999] h-[5px] pointer-events-none"
        style={{ top: "env(safe-area-inset-top, 0px)" }}
        aria-hidden="true"
      >
        <div
          className="h-full rounded-r-full"
          style={{
            width: `${Math.max(progress, 8)}%`,
            opacity: progress === 100 ? 0 : 1,
            background: "linear-gradient(90deg, #FF8A70 0%, #FF5238 50%, #FF7A3A 100%)",
            boxShadow: "0 0 14px rgba(255, 82, 56, 0.65)",
            transition:
              progress === 100
                ? "width 160ms ease-out, opacity 240ms ease"
                : "width 240ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>

      {isProductNav && (
        <div
          className="fixed inset-x-0 top-[calc(env(safe-area-inset-top,0px)+4rem)] sm:top-[calc(env(safe-area-inset-top,0px)+5.5rem)] z-[60] bg-white overflow-y-auto overscroll-contain pointer-events-none transition-opacity duration-300 max-md:bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-0"
          style={{ opacity: progress === 100 ? 0 : 1 }}
          aria-hidden="true"
        >
          <ProductPageLoading />
        </div>
      )}
    </>
  );
}

export function NavigationProgressBar() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressBarInner />
    </Suspense>
  );
}
