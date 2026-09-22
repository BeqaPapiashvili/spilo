"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, LayoutGrid, Loader2, X } from "lucide-react";
import { Category, DeepCategoryItem, SubCategory } from "@/types";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { getBrandLogo } from "@/lib/brandLogos";

interface MobileCategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileCategorySheet({ isOpen, onClose }: MobileCategorySheetProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSub, setSelectedSub] = useState<SubCategory | null>(null);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchCategories = async () => {
      try {
        if (categories.length === 0) setIsLoading(true);
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      } catch (err) {
        console.error("MobileCategorySheet: failed to load categories", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, [isOpen, categories.length]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedCategory(null);
      setSelectedSub(null);
      setDirection(1);
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (selectedSub) goBack();
      else if (selectedCategory) goBack();
      else onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, selectedCategory, selectedSub, onClose]);

  const openCategory = (category: Category) => {
    setDirection(1);
    setSelectedSub(null);
    setSelectedCategory(category);
  };

  const openSub = (sub: SubCategory) => {
    if (sub.items && sub.items.length > 0) {
      setDirection(1);
      setSelectedSub(sub);
      return;
    }
  };

  const goBack = () => {
    setDirection(-1);
    if (selectedSub) {
      setSelectedSub(null);
      return;
    }
    setSelectedCategory(null);
  };

  const paneKey = selectedSub
    ? `sub-${selectedSub.id}`
    : selectedCategory
      ? `cat-${selectedCategory.id}`
      : "root";

  const title = selectedSub?.name || selectedCategory?.name || "კატეგორიები";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <motion.button
            type="button"
            aria-label="დახურვა"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="კატეგორიები"
            initial={{ y: "108%" }}
            animate={{ y: 0 }}
            exit={{ y: "108%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320, mass: 0.9 }}
            className="absolute inset-x-0 bottom-0 bg-white rounded-t-[28px] shadow-[0_-12px_40px_-12px_rgba(15,23,42,0.28)] h-[min(86dvh,800px)] flex flex-col overflow-hidden"
            style={{ paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
          >
            <div className="flex flex-col items-center pt-3 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="px-4 pt-2 pb-3 flex items-center gap-2 shrink-0">
              {selectedCategory ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="w-9 h-9 rounded-full bg-[#F4F5F7] text-gray-700 flex items-center justify-center"
                  aria-label="უკან"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              ) : (
                <span className="w-9 h-9 rounded-full bg-[#FFF5F2] text-[#FF5238] flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4" />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-gray-400 leading-none mb-0.5">
                  {selectedSub ? selectedCategory?.name : selectedCategory ? "კატეგორიები" : "განყოფილებები"}
                </p>
                <h2 className="text-[17px] text-[#1D1D1F] tracking-tight truncate">{title}</h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[#F4F5F7] text-gray-600 flex items-center justify-center"
                aria-label="დახურვა"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden relative">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={paneKey}
                  custom={direction}
                  variants={paneVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 overflow-y-auto overscroll-contain px-4 pb-4"
                >
                  {isLoading && categories.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-2 text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin text-[#FF5238]" />
                      <span className="text-xs">იტვირთება...</span>
                    </div>
                  ) : selectedSub && selectedCategory ? (
                    <ItemPane
                      category={selectedCategory}
                      sub={selectedSub}
                      onClose={onClose}
                    />
                  ) : selectedCategory ? (
                    <SubcategoryPane
                      category={selectedCategory}
                      onOpenSub={openSub}
                      onClose={onClose}
                    />
                  ) : (
                    <RootPane
                      categories={categories}
                      onOpenCategory={openCategory}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function RootPane({
  categories,
  onOpenCategory,
}: {
  categories: Category[];
  onOpenCategory: (category: Category) => void;
}) {
  if (categories.length === 0) {
    return <div className="py-12 text-center text-xs text-gray-500">კატეგორიები ვერ მოიძებნა</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={listVariants}
      className="space-y-2"
    >
      {categories.map((category) => {
        const sections = category.children?.length || 0;
        return (
          <motion.div key={category.id} variants={rowVariants}>
            <button
              type="button"
              onClick={() => onOpenCategory(category)}
              className="w-full flex items-center gap-3 p-3 rounded-[22px] bg-[#F7F8FA] text-left active:scale-[0.99] transition-transform"
            >
              <span className="w-11 h-11 rounded-full bg-white text-[#1D1D1F] flex items-center justify-center shrink-0 shadow-2xs">
                {getCategoryIcon(category, "w-5 h-5")}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-[#1D1D1F] truncate">{category.name}</span>
                <span className="block text-[11px] text-gray-400">
                  {sections > 0 ? `${sections} სექცია` : "პროდუქტების ნახვა"}
                </span>
              </span>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function SubcategoryPane({
  category,
  onOpenSub,
  onClose,
}: {
  category: Category;
  onOpenSub: (sub: SubCategory) => void;
  onClose: () => void;
}) {
  const children = category.children || [];
  const catalogHref = `/catalog?category=${encodeURIComponent(category.slug || category.id)}`;

  return (
    <div className="space-y-2">
      <Link
        href={catalogHref}
        onClick={onClose}
        className="flex items-center justify-between p-3.5 rounded-[22px] bg-[#FFF5F2] text-[#FF5238] active:scale-[0.99] transition-transform"
      >
        <span className="text-sm">ყველა {category.name}</span>
        <ArrowRight className="w-4 h-4" />
      </Link>

      {children.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-500">ამ კატეგორიაში სექციები არ არის</div>
      ) : (
        children.map((sub) => {
          const itemCount = sub.items?.length || 0;
          const href = `/categories/${category.slug}/${sub.slug || sub.id}`;

          if (itemCount === 0) {
            return (
              <Link
                key={sub.id}
                href={href}
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-[22px] bg-[#F7F8FA] active:scale-[0.99] transition-transform"
              >
                <span className="w-11 h-11 rounded-full bg-white text-[#1D1D1F] flex items-center justify-center shrink-0 shadow-2xs">
                  {getCategoryIcon(sub, "w-5 h-5")}
                </span>
                <span className="flex-1 min-w-0 text-sm text-[#1D1D1F] truncate">{sub.name}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </Link>
            );
          }

          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => onOpenSub(sub)}
              className="w-full flex items-center gap-3 p-3 rounded-[22px] bg-[#F7F8FA] text-left active:scale-[0.99] transition-transform"
            >
              <span className="w-11 h-11 rounded-full bg-white text-[#1D1D1F] flex items-center justify-center shrink-0 shadow-2xs">
                {getCategoryIcon(sub, "w-5 h-5")}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-[#1D1D1F] truncate">{sub.name}</span>
                <span className="block text-[11px] text-gray-400">{itemCount} პოზიცია</span>
              </span>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </button>
          );
        })
      )}
    </div>
  );
}

function ItemPane({
  category,
  sub,
  onClose,
}: {
  category: Category;
  sub: SubCategory;
  onClose: () => void;
}) {
  const items = sub.items || [];
  const categorySlug = category.slug || category.id;

  return (
    <div className="space-y-2">
      <Link
        href={`/categories/${category.slug}/${sub.slug || sub.id}`}
        onClick={onClose}
        className="flex items-center justify-between p-3.5 rounded-[22px] bg-[#FFF5F2] text-[#FF5238] active:scale-[0.99] transition-transform"
      >
        <span className="text-sm">სექციის ნახვა</span>
        <ArrowRight className="w-4 h-4" />
      </Link>

      <div className="grid grid-cols-1 gap-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={itemHref(categorySlug, item)}
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-[22px] bg-[#F7F8FA] active:scale-[0.99] transition-transform"
          >
            <span className="w-11 h-11 rounded-full bg-white text-[#1D1D1F] flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
              {getBrandLogo(item.brandQuery || item.name, "w-5 h-5 text-[#1D1D1F]") ||
                getCategoryIcon(item, "w-5 h-5")}
            </span>
            <span className="flex-1 min-w-0 text-sm text-[#1D1D1F] truncate">{item.name}</span>
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function itemHref(categorySlug: string, item: DeepCategoryItem) {
  if (item.brandQuery) {
    return `/catalog?category=${encodeURIComponent(categorySlug)}&brand=${encodeURIComponent(item.brandQuery)}`;
  }
  return `/catalog?category=${encodeURIComponent(categorySlug)}&q=${encodeURIComponent(item.name)}`;
}

const paneVariants = {
  enter: (dir: number) => ({ x: dir * 28, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.2 } },
  exit: (dir: number) => ({ x: dir * -28, opacity: 0, transition: { duration: 0.16 } }),
};

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.04 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 24, stiffness: 340 },
  },
};
