"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface SpecGroup {
  title: string;
  items: { label: string; value: string }[];
}

interface ProductSpecsAndTabsProps {
  productId?: string;
  specs?: SpecGroup[];
  description: string;
  warrantyMonths?: number;
}

export function ProductSpecsAndTabs({
  specs,
  description,
}: ProductSpecsAndTabsProps) {
  const [activeSection, setActiveSection] = useState<"specs" | "description">("specs");

  const isGenericTitle = (title: string) => {
    const t = title.trim().toLowerCase();
    return (
      t === "ძირითადი მახასიათებლები" ||
      t === "ძირითადი პარამეტრები" ||
      t === "მახასიათებლები" ||
      t === "ზოგადი მახასიათებლები" ||
      t === "general specs" ||
      t === "specifications"
    );
  };

  return (
    <div className="mt-8 flex flex-col gap-6">

      {/* Underline Navigation Bar with only Specifications and Description */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center gap-6 md:gap-8 overflow-x-auto scrollbar-none px-2">
          {[
            { id: "specs", label: "მახასიათებლები" },
            { id: "description", label: "აღწერა" },
          ].map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as "specs" | "description")}
                className={`py-3.5 px-1 text-xs md:text-sm shrink-0 relative transition-colors cursor-pointer ${
                  isActive ? "text-[#1D1D1F]" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D1D1F] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Specifications Section - Seamless 2-Column Grid */}
      {activeSection === "specs" && (
        <div className="flex flex-col gap-6">
          {specs && specs.length > 0 ? (
            <div className="flex flex-col gap-6">
              {specs.map((group, idx) => (
                <div key={idx} className="flex flex-col gap-2.5">
                  {!isGenericTitle(group.title) && (
                    <h4 className="text-xs text-gray-900 px-1">
                      {group.title}
                    </h4>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1 bg-white rounded-3xl p-6 md:p-8">
                    {group.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-center justify-between gap-4 py-2.5 border-b border-gray-100 last:border-b-0 text-xs"
                      >
                        <span className="text-gray-500 shrink-0">{item.label}</span>
                        <span className="text-gray-900 text-right leading-snug">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-gray-400">
              მახასიათებლები მალე დაემატება.
            </div>
          )}
        </div>
      )}

      {/* Description Section */}
      {activeSection === "description" && (
        <div className="bg-white rounded-3xl p-6 md:p-8 text-xs md:text-sm text-gray-700 leading-relaxed">
          <p className="whitespace-pre-line">{description || "აღწერა მალე დაემატება."}</p>
        </div>
      )}

    </div>
  );
}
