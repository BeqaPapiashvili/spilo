"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface CatalogFilterState {
  category: string[];
  brand: string[];
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  onlyDiscounted: boolean;
  sort: string;
  page: number;
  searchQuery: string;
}

export const ABSOLUTE_MAX_PRICE = 10000;

export function useCatalogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse current URL params
  const categoryParam = searchParams.get("category");
  const brandParam = searchParams.get("brand");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const inStockParam = searchParams.get("inStock");
  const discountParam = searchParams.get("discount");
  const sortParam = searchParams.get("sort");
  const pageParam = searchParams.get("page");
  const qParam = searchParams.get("q") || searchParams.get("search") || "";

  // Initial State derived from URL
  const filtersFromUrl: CatalogFilterState = useMemo(() => {
    return {
      category: categoryParam ? categoryParam.split(",").filter(Boolean) : [],
      brand: brandParam ? brandParam.split(",").filter(Boolean) : [],
      minPrice: minPriceParam ? Math.max(0, parseInt(minPriceParam, 10)) : 0,
      maxPrice: maxPriceParam ? Math.min(ABSOLUTE_MAX_PRICE, parseInt(maxPriceParam, 10)) : ABSOLUTE_MAX_PRICE,
      inStock: inStockParam === "true",
      onlyDiscounted: discountParam === "true",
      sort: sortParam || "default",
      page: pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1,
      searchQuery: qParam,
    };
  }, [categoryParam, brandParam, minPriceParam, maxPriceParam, inStockParam, discountParam, sortParam, pageParam, qParam]);

  // Local state for responsive UI feel before URL updates
  const [filters, setFilters] = useState<CatalogFilterState>(filtersFromUrl);

  // Keep local filters synced if URL changes externally
  useEffect(() => {
    setFilters(filtersFromUrl);
  }, [filtersFromUrl]);

  // Ref to hold pending timer for debouncing URL updates
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to schedule URL replace outside of current React render stack
  const scheduleUrlPush = useCallback(
    (newFilters: CatalogFilterState, delayMs = 0) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const params = new URLSearchParams();

        if (newFilters.category.length > 0) {
          params.set("category", newFilters.category.join(","));
        }
        if (newFilters.brand.length > 0) {
          params.set("brand", newFilters.brand.join(","));
        }
        if (newFilters.minPrice > 0) {
          params.set("minPrice", newFilters.minPrice.toString());
        }
        if (newFilters.maxPrice < ABSOLUTE_MAX_PRICE) {
          params.set("maxPrice", newFilters.maxPrice.toString());
        }
        if (newFilters.inStock) {
          params.set("inStock", "true");
        }
        if (newFilters.onlyDiscounted) {
          params.set("discount", "true");
        }
        if (newFilters.sort && newFilters.sort !== "default") {
          params.set("sort", newFilters.sort);
        }
        if (newFilters.page > 1) {
          params.set("page", newFilters.page.toString());
        }
        if (newFilters.searchQuery.trim()) {
          params.set("q", newFilters.searchQuery.trim());
        }

        const queryString = params.toString();
        const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
        router.replace(targetUrl, { scroll: false });
      }, delayMs);
    },
    [pathname, router]
  );

  // Update handlers
  const toggleBrand = useCallback(
    (brandName: string) => {
      setFilters((prev) => {
        const nextBrands = prev.brand.includes(brandName)
          ? prev.brand.filter((b) => b !== brandName)
          : [...prev.brand, brandName];
        const updated = { ...prev, brand: nextBrands, page: 1 };
        scheduleUrlPush(updated, 0);
        return updated;
      });
    },
    [scheduleUrlPush]
  );

  const toggleCategory = useCallback(
    (categoryName: string) => {
      setFilters((prev) => {
        const nextCategories = prev.category.includes(categoryName)
          ? prev.category.filter((c) => c !== categoryName)
          : [...prev.category, categoryName];
        const updated = { ...prev, category: nextCategories, page: 1 };
        scheduleUrlPush(updated, 0);
        return updated;
      });
    },
    [scheduleUrlPush]
  );

  const setPriceRange = useCallback(
    (min: number, max: number) => {
      setFilters((prev) => {
        const updated = { ...prev, minPrice: min, maxPrice: max, page: 1 };
        scheduleUrlPush(updated, 350); // debounced 350ms
        return updated;
      });
    },
    [scheduleUrlPush]
  );

  const setSort = useCallback(
    (sortVal: string) => {
      setFilters((prev) => {
        const updated = { ...prev, sort: sortVal };
        scheduleUrlPush(updated, 0);
        return updated;
      });
    },
    [scheduleUrlPush]
  );

  const toggleDiscountedOnly = useCallback(() => {
    setFilters((prev) => {
      const updated = { ...prev, onlyDiscounted: !prev.onlyDiscounted, page: 1 };
      scheduleUrlPush(updated, 0);
      return updated;
    });
  }, [scheduleUrlPush]);

  const toggleInStockOnly = useCallback(() => {
    setFilters((prev) => {
      const updated = { ...prev, inStock: !prev.inStock, page: 1 };
      scheduleUrlPush(updated, 0);
      return updated;
    });
  }, [scheduleUrlPush]);

  const setSearchQuery = useCallback(
    (query: string) => {
      setFilters((prev) => {
        const updated = { ...prev, searchQuery: query, page: 1 };
        scheduleUrlPush(updated, 0);
        return updated;
      });
    },
    [scheduleUrlPush]
  );

  const resetFilters = useCallback(() => {
    const defaultFilters: CatalogFilterState = {
      category: [],
      brand: [],
      minPrice: 0,
      maxPrice: ABSOLUTE_MAX_PRICE,
      inStock: false,
      onlyDiscounted: false,
      sort: "default",
      page: 1,
      searchQuery: "",
    };
    setFilters(defaultFilters);
    scheduleUrlPush(defaultFilters, 0);
  }, [scheduleUrlPush]);

  const activeFiltersCount = useMemo(() => {
    return (
      filters.category.length +
      filters.brand.length +
      (filters.inStock ? 1 : 0) +
      (filters.onlyDiscounted ? 1 : 0) +
      (filters.minPrice > 0 || filters.maxPrice < ABSOLUTE_MAX_PRICE ? 1 : 0)
    );
  }, [filters]);

  return {
    filters,
    activeFiltersCount,
    toggleBrand,
    toggleCategory,
    setPriceRange,
    setSort,
    toggleDiscountedOnly,
    toggleInStockOnly,
    setSearchQuery,
    resetFilters,
  };
}
