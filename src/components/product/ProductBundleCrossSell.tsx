"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Check, ShoppingBag, Sparkles, Equal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/store/useStore";
import { dataService } from "@/services/dataService";
import { Product } from "@/types";

interface ProductBundleCrossSellProps {
  product: {
    id: string;
    title: string;
    price: number;
    discountPrice?: number;
    image: string;
    brandName?: string;
    categoryId?: string;
    categoryName?: string;
  };
}

interface BundleItem {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  image: string;
  badge: string;
  isMain?: boolean;
}

export function ProductBundleCrossSell({ product }: ProductBundleCrossSellProps) {
  const { addToCart, addToast } = useStore();
  const [isBundleAdded, setIsBundleAdded] = useState(false);

  // Find 2 smart matching accessories from database or fallback to tailored accessories
  const accessories = useMemo(() => {
    const allProducts = dataService.getProducts().filter((p) => p.id !== product.id);
    const mainTitleLower = product.title.toLowerCase();
    const brandLower = (product.brandName || "").toLowerCase();

    // Keywords to search for matching accessories
    const accessoryKeywords = ["ქეისი", "case", "დამტენი", "charger", "მინა", "glass", "კაბელი", "cable", "airpods", "buds", "ადაპტერი", "adapter", "powerbank", "უსადენო"];

    // 1. Try to find matching accessories in database by brand & title
    const matchingDB = allProducts.filter((p) => {
      const pTitleLower = p.title.toLowerCase();
      const isAccessory = accessoryKeywords.some((kw) => pTitleLower.includes(kw)) || p.categoryId === "accessories" || p.categoryId === "audio";
      const matchesBrandOrModel = (brandLower && pTitleLower.includes(brandLower)) || mainTitleLower.split(" ").some((word) => word.length > 3 && pTitleLower.includes(word));
      return isAccessory || matchesBrandOrModel;
    });

    const items: BundleItem[] = [];

    if (matchingDB.length >= 2) {
      items.push({
        id: matchingDB[0].id,
        title: matchingDB[0].title,
        price: matchingDB[0].price,
        discountPrice: matchingDB[0].discountPrice || Math.round(matchingDB[0].price * 0.85),
        image: matchingDB[0].images?.[0] || matchingDB[0].image || "/placeholder.png",
        badge: "აქსესუარი 1",
      });
      items.push({
        id: matchingDB[1].id,
        title: matchingDB[1].title,
        price: matchingDB[1].price,
        discountPrice: matchingDB[1].discountPrice || Math.round(matchingDB[1].price * 0.85),
        image: matchingDB[1].images?.[0] || matchingDB[1].image || "/placeholder.png",
        badge: "აქსესუარი 2",
      });
    } else {
      // Smart tailored fallbacks based on main product title
      const brand = product.brandName || "Spilo";
      let acc1Title = `${product.title} - პრემიუმ დამცავი შალითა (Silicone Case)`;
      let acc2Title = `${brand} Fast Charger 20W - სწრაფი დამტენი & USB-C კაბელი`;

      if (mainTitleLower.includes("iphone") || brandLower.includes("apple")) {
        acc1Title = `${product.title} MagSafe Silicone Case - შავ ფერში`;
        acc2Title = `Apple 20W USB-C Power Adapter & Type-C კაბელი`;
      } else if (mainTitleLower.includes("samsung") || brandLower.includes("samsung")) {
        acc1Title = `${product.title} Clear Protection Cover Case`;
        acc2Title = `Samsung Super Fast Charging 25W Wall Charger`;
      } else if (mainTitleLower.includes("macbook") || mainTitleLower.includes("laptop")) {
        acc1Title = `პრემიუმ ნაჭრის ჩანთა / Sleeve Case`;
        acc2Title = `Multi-Port USB-C Hub 7-in-1 Adapter`;
      }

      if (matchingDB.length === 1) {
        items.push({
          id: matchingDB[0].id,
          title: matchingDB[0].title,
          price: matchingDB[0].price,
          discountPrice: matchingDB[0].discountPrice || Math.round(matchingDB[0].price * 0.85),
          image: matchingDB[0].images?.[0] || matchingDB[0].image || "/placeholder.png",
          badge: "აქსესუარი 1",
        });
      } else {
        items.push({
          id: `acc-case-${product.id}`,
          title: acc1Title,
          price: 49.0,
          discountPrice: 39.0,
          image: product.image,
          badge: "დამცავი შალითა",
        });
      }

      items.push({
        id: `acc-charger-${product.id}`,
        title: acc2Title,
        price: 59.0,
        discountPrice: 45.0,
        image: product.image,
        badge: "სწრაფი დამტენი",
      });
    }

    return items;
  }, [product]);

  // Main product + 2 accessories = 3 items total
  const mainItem: BundleItem = {
    id: product.id,
    title: product.title,
    price: product.price,
    discountPrice: product.discountPrice || product.price,
    image: product.image,
    badge: "ძირითადი ნივთი",
    isMain: true,
  };

  const allBundleItems = [mainItem, ...accessories];

  // Checked state for each item (all 3 checked by default)
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>({
    [mainItem.id]: true,
    [accessories[0].id]: true,
    [accessories[1].id]: true,
  });

  const toggleCheck = (id: string) => {
    // Keep main item always checked
    if (id === mainItem.id) return;
    setCheckedState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Calculate pricing for checked items with bundle discount
  const activeItems = allBundleItems.filter((item) => checkedState[item.id]);
  const isFullBundle = activeItems.length === 3;
  const bundleDiscountMultiplier = isFullBundle ? 0.9 : 1.0; // Extra 10% off full 3-item bundle

  const originalTotal = activeItems.reduce((sum, item) => sum + item.price, 0);
  const bundleTotal = activeItems.reduce(
    (sum, item) => sum + (item.discountPrice || item.price) * bundleDiscountMultiplier,
    0
  );
  const totalSavings = originalTotal - bundleTotal;

  const handleAddBundle = () => {
    activeItems.forEach((item) => {
      addToCart(
        {
          id: item.id,
          title: item.title,
          price: item.price,
          discountPrice: item.discountPrice,
          image: item.image,
        },
        false // openCart = false
      );
    });

    setIsBundleAdded(true);
    addToast({
      title: "კომპლექტი დაემატა!",
      message: `${activeItems.length} ნივთი დაემატა კალათაში.`,
      type: "success",
    });

    setTimeout(() => setIsBundleAdded(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-purple-50/40 via-white to-blue-50/30 rounded-3xl border border-purple-100/70 my-8 shadow-2xs flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Sparkles className="size-4" />
          </div>
          <h3 className="text-sm text-gray-900">ხშირად ერთად ყიდვადი 3-იანი კომპლექტი</h3>
        </div>

        {totalSavings > 0 && (
          <span className="text-xs text-emerald-700 bg-emerald-50/90 border border-emerald-100 px-3.5 py-1 rounded-xl shadow-2xs">
            {isFullBundle ? `სრული კომპლექტის დაზოგვა: ${totalSavings.toFixed(2)} ₾ (-10% ბონუსი!)` : `დაზოგეთ ${totalSavings.toFixed(2)} ₾`}
          </span>
        )}
      </div>

      {/* 3 Items Horizontal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        
        {/* Items Grid (9 cols) */}
        <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {allBundleItems.map((item, idx) => {
            const isChecked = checkedState[item.id];
            const displayPrice = (item.discountPrice || item.price) * bundleDiscountMultiplier;

            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                  isChecked
                    ? "bg-white border-purple-200 shadow-2xs"
                    : "bg-gray-50/60 border-gray-200/60 opacity-60 hover:opacity-80"
                }`}
              >
                {/* Top Badge & Checkbox */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                    {item.badge}
                  </span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCheck(item.id)}
                    disabled={item.isMain}
                    className="size-4 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                {/* Thumbnail & Title */}
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="size-16 bg-gray-50 rounded-xl border border-gray-100 p-1 flex items-center justify-center">
                    <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <p className="text-xs text-gray-900 line-clamp-2 leading-snug">{item.title}</p>
                </div>

                {/* Price */}
                <div className="flex items-center justify-center gap-1.5 text-xs pt-1 border-t border-gray-100">
                  <span className="text-gray-900">{displayPrice.toFixed(2)} ₾</span>
                  {item.price > displayPrice && (
                    <span className="text-gray-400 line-through text-[11px]">{item.price.toFixed(2)} ₾</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Price & CTA Button (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-3 items-center lg:items-end justify-center p-4 bg-white/80 rounded-2xl border border-purple-100 shadow-2xs">
          <div className="flex flex-col items-center lg:items-end gap-0.5">
            <span className="text-[11px] text-gray-500">არჩეული {activeItems.length} ნივთის ჯამი:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl text-gray-900 tracking-tight">{bundleTotal.toFixed(2)} ₾</span>
              {originalTotal > bundleTotal && (
                <span className="text-xs text-gray-400 line-through">{originalTotal.toFixed(2)} ₾</span>
              )}
            </div>
          </div>

          <Button
            type="button"
            onClick={handleAddBundle}
            variant="primary"
            size="md"
            leftIcon={isBundleAdded ? <Check className="size-4 text-emerald-400" /> : <ShoppingBag className="size-4" />}
            className="w-full shadow-xs bg-purple-600 hover:bg-purple-700 active:bg-purple-800"
          >
            {isBundleAdded ? "კომპლექტი დაემატა!" : `კომპლექტის ყიდვა (${activeItems.length})`}
          </Button>
        </div>

      </div>
    </div>
  );
}
