"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo, useRef } from "react";

export interface CatalogFilterState {
  category: string[];
  brand: string[];
  color: string[];
  storage: string[];
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

  const categoryParam = searchParams.get("category") || "";
  const brandParam = searchParams.get("brand") || "";
  const colorParam = searchParams.get("color") || "";
  const storageParam = searchParams.get("storage") || "";
  const minPriceParam = searchParams.get("minPrice") || "0";
  const maxPriceParam = searchParams.get("maxPrice") || String(ABSOLUTE_MAX_PRICE);
  const inStockParam = searchParams.get("inStock") || "";
  const discountParam = searchParams.get("discount") || "";
  const sortParam = searchParams.get("sort") || "default";
  const pageParam = searchParams.get("page") || "1";
  const qParam = searchParams.get("q") || searchParams.get("search") || "";

  const category = useMemo(() => categoryParam ? categoryParam.split(",").filter(Boolean) : [], [categoryParam]);
  const brand = useMemo(() => brandParam ? brandParam.split(",").filter(Boolean) : [], [brandParam]);
  const color = useMemo(() => colorParam ? colorParam.split(",").filter(Boolean) : [], [colorParam]);
  const storage = useMemo(() => storageParam ? storageParam.split(",").filter(Boolean) : [], [storageParam]);
  const minPrice = useMemo(() => Math.max(0, parseInt(minPriceParam, 10) || 0), [minPriceParam]);
  const maxPrice = useMemo(() => Math.min(ABSOLUTE_MAX_PRICE, parseInt(maxPriceParam, 10) || ABSOLUTE_MAX_PRICE), [maxPriceParam]);
  const inStock = inStockParam === "true";
  const onlyDiscounted = discountParam === "true";
  const sort = sortParam || "default";
  const page = useMemo(() => Math.max(1, parseInt(pageParam, 10) || 1), [pageParam]);
  const searchQuery = qParam;

  const filters: CatalogFilterState = useMemo(() => ({
    category,
    brand,
    color,
    storage,
    minPrice,
    maxPrice,
    inStock,
    onlyDiscounted,
    sort,
    page,
    searchQuery,
  }), [category, brand, color, storage, minPrice, maxPrice, inStock, onlyDiscounted, sort, page, searchQuery]);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updateFiltersInUrl = useCallback((updater: (params: URLSearchParams) => void, delayMs = 0) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const run = () => {
      const params = new URLSearchParams(searchParams.toString());
      updater(params);
      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    };

    if (delayMs > 0) {
      debounceTimerRef.current = setTimeout(run, delayMs);
    } else {
      run();
    }
  }, [searchParams, pathname, router]);

  const toggleBrand = useCallback((brandName: string) => {
    updateFiltersInUrl((params) => {
      const current = params.get("brand") ? params.get("brand")!.split(",").filter(Boolean) : [];
      const exists = current.some((b) => b.toLowerCase() === brandName.toLowerCase());
      const next = exists
        ? current.filter((b) => b.toLowerCase() !== brandName.toLowerCase())
        : [...current, brandName];
      if (next.length > 0) {
        params.set("brand", next.join(","));
      } else {
        params.delete("brand");
      }
      params.delete("page");
    });
  }, [updateFiltersInUrl]);

  const toggleCategory = useCallback((categoryName: string) => {
    updateFiltersInUrl((params) => {
      const current = params.get("category") ? params.get("category")!.split(",").filter(Boolean) : [];
      const exists = current.some((c) => c.toLowerCase() === categoryName.toLowerCase());
      const next = exists
        ? current.filter((c) => c.toLowerCase() !== categoryName.toLowerCase())
        : [...current, categoryName];
      if (next.length > 0) {
        params.set("category", next.join(","));
      } else {
        params.delete("category");
      }
      params.delete("page");
    });
  }, [updateFiltersInUrl]);

  const toggleColor = useCallback((colorName: string) => {
    updateFiltersInUrl((params) => {
      const current = params.get("color") ? params.get("color")!.split(",").filter(Boolean) : [];
      const exists = current.some((c) => c.toLowerCase() === colorName.toLowerCase());
      const next = exists
        ? current.filter((c) => c.toLowerCase() !== colorName.toLowerCase())
        : [...current, colorName];
      if (next.length > 0) {
        params.set("color", next.join(","));
      } else {
        params.delete("color");
      }
      params.delete("page");
    });
  }, [updateFiltersInUrl]);

  const toggleStorage = useCallback((storageValue: string) => {
    updateFiltersInUrl((params) => {
      const current = params.get("storage") ? params.get("storage")!.split(",").filter(Boolean) : [];
      const exists = current.some((s) => s.toLowerCase() === storageValue.toLowerCase());
      const next = exists
        ? current.filter((s) => s.toLowerCase() !== storageValue.toLowerCase())
        : [...current, storageValue];
      if (next.length > 0) {
        params.set("storage", next.join(","));
      } else {
        params.delete("storage");
      }
      params.delete("page");
    });
  }, [updateFiltersInUrl]);

  const setPriceRange = useCallback((min: number, max: number) => {
    updateFiltersInUrl((params) => {
      if (min > 0) params.set("minPrice", min.toString());
      else params.delete("minPrice");

      if (max < ABSOLUTE_MAX_PRICE) params.set("maxPrice", max.toString());
      else params.delete("maxPrice");

      params.delete("page");
    }, 350);
  }, [updateFiltersInUrl]);

  const setSort = useCallback((sortVal: string) => {
    updateFiltersInUrl((params) => {
      if (sortVal && sortVal !== "default") params.set("sort", sortVal);
      else params.delete("sort");
    });
  }, [updateFiltersInUrl]);

  const toggleDiscountedOnly = useCallback(() => {
    updateFiltersInUrl((params) => {
      if (params.get("discount") === "true") params.delete("discount");
      else params.set("discount", "true");
      params.delete("page");
    });
  }, [updateFiltersInUrl]);

  const toggleInStockOnly = useCallback(() => {
    updateFiltersInUrl((params) => {
      if (params.get("inStock") === "true") params.delete("inStock");
      else params.set("inStock", "true");
      params.delete("page");
    });
  }, [updateFiltersInUrl]);

  const setSearchQuery = useCallback((query: string) => {
    updateFiltersInUrl((params) => {
      if (query.trim()) params.set("q", query.trim());
      else params.delete("q");
      params.delete("page");
    });
  }, [updateFiltersInUrl]);

  const resetFilters = useCallback(() => {
    updateFiltersInUrl((params) => {
      params.delete("category");
      params.delete("brand");
      params.delete("color");
      params.delete("storage");
      params.delete("minPrice");
      params.delete("maxPrice");
      params.delete("inStock");
      params.delete("discount");
      params.delete("sort");
      params.delete("page");
      params.delete("q");
    });
  }, [updateFiltersInUrl]);

  const activeFiltersCount = useMemo(() => {
    return (
      category.length +
      brand.length +
      color.length +
      storage.length +
      (inStock ? 1 : 0) +
      (onlyDiscounted ? 1 : 0) +
      (minPrice > 0 || maxPrice < ABSOLUTE_MAX_PRICE ? 1 : 0)
    );
  }, [category.length, brand.length, color.length, storage.length, inStock, onlyDiscounted, minPrice, maxPrice]);

  const setPage = useCallback((pageNumber: number) => {
    updateFiltersInUrl((params) => {
      if (pageNumber > 1) params.set("page", pageNumber.toString());
      else params.delete("page");
    });
  }, [updateFiltersInUrl]);

  return {
    filters,
    activeFiltersCount,
    toggleBrand,
    toggleCategory,
    toggleColor,
    toggleStorage,
    setPriceRange,
    setSort,
    setPage,
    toggleDiscountedOnly,
    toggleInStockOnly,
    setSearchQuery,
    resetFilters,
  };
}
