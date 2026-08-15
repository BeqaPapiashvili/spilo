"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Truck, 
  ShieldCheck, 
  ChevronDown, 
  PackageCheck 
} from "lucide-react";

interface SpecGroup {
  title: string;
  items: { label: string; value: string }[];
}

interface ProductSpecsAndTabsProps {
  specs?: SpecGroup[];
  description: string;
  warrantyMonths?: number;
}

export function ProductSpecsAndTabs({
  specs,
  description,
  warrantyMonths = 12,
}: ProductSpecsAndTabsProps) {
  const [activeSection, setActiveSection] = useState<"specs" | "description" | "delivery" | "faq">("specs");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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

  const faqs = [
    {
      q: "რა შედის პროდუქტის კომპლექტაციაში (ყუთში)?",
      a: "ყუთში მოყვება პროდუქტი, ოფიციალური დამტენი კაბელი, საგარანტიო ტალონი და ინსტრუქცია.",
    },
    {
      q: "როგორ მოქმედებს 0%-იანი განვადება?",
      a: "ონლაინ განვადება ფორმდება 0%-იანი ეფექტური განაკვეთით 3-დან 36 თვემდე ვადით TBC, BOG, Credo ან Space ბანკის მეშვეობით.",
    },
    {
      q: "როგორ ხდება გარანტიით სარგებლობა შეკეთების შემთხვევაში?",
      a: "საგარანტიო შემთხვევისას შეგიძლიათ მიმართოთ Spilo-ს ოფიციალურ სერვის ცენტრს ან ნებისმიერ ავტორიზებულ სერვისს საქართველოს მასშტაბით.",
    },
  ];

  return (
    <div className="mt-10 flex flex-col gap-8">
      
      {/* Clean Human-Designed Underline Navigation Bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-2xs">
        <div className="flex items-center gap-6 md:gap-8 overflow-x-auto scrollbar-none px-2">
          {[
            { id: "specs", label: "მახასიათებლები" },
            { id: "description", label: "აღწერა" },
            { id: "delivery", label: "მიწოდება & გარანტია" },
            { id: "faq", label: "ხშირად დასმული კითხვები" },
          ].map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as any)}
                className={`py-3.5 px-1 text-xs md:text-sm shrink-0 relative transition-colors cursor-pointer ${
                  isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Specifications Section - Clean 2-Column Grid Layout */}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1 bg-white rounded-2xl border border-gray-200/80 p-5 md:p-6 shadow-2xs">
                    {group.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-center justify-between gap-4 py-2.5 border-b border-gray-100/70 last:border-b-0 text-xs"
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
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 text-xs md:text-sm text-gray-700 leading-relaxed shadow-2xs">
          <p className="whitespace-pre-line">{description}</p>
        </div>
      )}

      {/* Delivery & Warranty Section */}
      {activeSection === "delivery" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-white rounded-2xl border border-gray-200/80 flex flex-col gap-3 shadow-2xs">
            <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Truck className="size-5" />
            </div>
            <h4 className="text-xs text-gray-900">თბილისში მიწოდება</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              იმავე დღეს ან მეორე დღეს კურიერის მიერ პირდაპირ თქვენს კარამდე.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-200/80 flex flex-col gap-3 shadow-2xs">
            <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <PackageCheck className="size-5" />
            </div>
            <h4 className="text-xs text-gray-900">რეგიონებში მიწოდება</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              1-3 სამუშაო დღის ვადაში საქართველოს ნებისმიერ ქალაქსა და სოფელში.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-200/80 flex flex-col gap-3 shadow-2xs">
            <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="size-5" />
            </div>
            <h4 className="text-xs text-gray-900">ოფიციალური გარანტია</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              {warrantyMonths} თვიანი სრული სერვისული გარანტია და ტექნიკური მხარდაჭერა.
            </p>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {activeSection === "faq" && (
        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left text-xs md:text-sm text-gray-900 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`size-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs md:text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
