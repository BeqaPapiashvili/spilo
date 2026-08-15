"use client";

import { 
  Truck, 
  Package, 
  ShieldCheck, 
  FileText, 
  Sliders
} from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";

interface SpecGroup {
  title: string;
  items: { label: string; value: string }[];
}

interface ProductTabsSectionProps {
  specs?: SpecGroup[];
  description: string;
  warrantyMonths?: number;
  activeTab: "specs" | "description" | "delivery";
  onTabChange: (tab: "specs" | "description" | "delivery") => void;
}

export function ProductTabsSection({
  specs,
  description,
  warrantyMonths = 12,
  activeTab,
  onTabChange,
}: ProductTabsSectionProps) {
  return (
    <div className="mt-16 border-t border-gray-100 pt-8 flex flex-col gap-6">
      {/* Tabs Header */}
      <Tabs
        tabs={[
          { id: "specs", label: "ტექნიკური მახასიათებლები" },
          { id: "description", label: "აღწერა" },
          { id: "delivery", label: "მიწოდება & გარანტია" },
        ]}
        activeTab={activeTab}
        onChange={(id) => onTabChange(id as any)}
        className="mb-2"
      />

      {/* Tab Content Container */}
      <div className="p-6 md:p-8 bg-gray-50/60 rounded-3xl border border-gray-100 shadow-2xs">
        
        {/* Specifications Tab */}
        {activeTab === "specs" && (
          <div className="flex flex-col gap-6">
            {specs && specs.length > 0 ? (
              specs.map((group, idx) => (
                <div key={idx} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                    <Sliders className="size-4 text-blue-600" />
                    <h4 className="text-sm text-gray-900">{group.title}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex justify-between items-center text-xs py-2 px-3 bg-white rounded-xl border border-gray-100/80"
                      >
                        <span className="text-gray-500">{item.label}</span>
                        <span className="text-gray-900 text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-gray-400">
                ტექნიკური მახასიათებლები მალე დაემატება.
              </div>
            )}
          </div>
        )}

        {/* Description Tab */}
        {activeTab === "description" && (
          <div className="flex flex-col gap-4 text-xs md:text-sm text-gray-700 leading-relaxed max-w-none">
            <div className="flex items-center gap-2 text-gray-900 border-b border-gray-200 pb-2 mb-2">
              <FileText className="size-4 text-blue-600" />
              <h3 className="text-sm text-gray-900">პროდუქტის დეტალური მიმოხილვა</h3>
            </div>
            <p className="whitespace-pre-line">{description}</p>
          </div>
        )}

        {/* Delivery & Warranty Tab */}
        {activeTab === "delivery" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="p-4 bg-white rounded-2xl border border-gray-100 flex flex-col gap-2">
                <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Truck className="size-5" />
                </div>
                <h4 className="text-xs text-gray-900">თბილისში მიწოდება</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  იმავე დღეს ან მეორე დღეს (უფასო 50 ₾-ზე მეტი შეკვეთისას).
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-gray-100 flex flex-col gap-2">
                <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Package className="size-5" />
                </div>
                <h4 className="text-xs text-gray-900">რეგიონებში მიწოდება</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  1-3 სამუშაო დღის ვადაში საქართველოს ნებისმიერ წერტილში.
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-gray-100 flex flex-col gap-2">
                <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="size-5" />
                </div>
                <h4 className="text-xs text-gray-900">ოფიციალური გარანტია</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {warrantyMonths} თვიანი სერვის ცენტრის გარანტია და ტექნიკური მხარდაჭერა.
                </p>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
