"use client";

import { Truck, ShieldCheck, RotateCcw, Award } from "lucide-react";

interface ProductTrustBadgesProps {
  warrantyMonths?: number;
}

export function ProductTrustBadges({ warrantyMonths = 12 }: ProductTrustBadgesProps) {
  const badges = [
    {
      icon: Truck,
      title: "უფასო მიწოდება",
      subtitle: "თბილისში 24 საათში",
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      icon: ShieldCheck,
      title: `${warrantyMonths} თვე გარანტია`,
      subtitle: "ოფიციალური სერვისი",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      icon: RotateCcw,
      title: "14 დღიანი დაბრუნება",
      subtitle: "მარტივი პოლიტიკა",
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      icon: Award,
      title: "100% ორიგინალი",
      subtitle: "სერტიფიცირებული",
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-t border-b border-gray-100 my-2">
      {badges.map((b, idx) => {
        const Icon = b.icon;
        return (
          <div
            key={idx}
            className="p-3 bg-gray-50/70 hover:bg-white rounded-2xl border border-gray-100 transition-all flex flex-col items-center text-center gap-1.5 shadow-2xs hover:shadow-xs group"
          >
            <div className={`size-9 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 ${b.color}`}>
              <Icon className="size-4" />
            </div>
            <p className="text-xs text-gray-900 leading-tight">{b.title}</p>
            <p className="text-[11px] text-gray-400">{b.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}
