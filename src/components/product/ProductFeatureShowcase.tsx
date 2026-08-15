"use client";

import { Cpu, Zap, BatteryCharging, Shield, Sparkles } from "lucide-react";

interface ProductFeatureShowcaseProps {
  features?: {
    icon?: string;
    title: string;
    description: string;
    badge?: string;
  }[];
}

export function ProductFeatureShowcase({ features }: ProductFeatureShowcaseProps) {
  const defaultFeatures = [
    {
      icon: Cpu,
      title: "მძლავრი პროცესორი",
      description: "ულტრა სწრაფი წარმადობა რთული დავალებებისა და თამაშებისთვის 0% შეფერხებით.",
      badge: "Flagship Chip",
      color: "from-blue-50/70 via-white to-sky-50/40 border-blue-100/70 text-blue-600",
    },
    {
      icon: BatteryCharging,
      title: "ხანგრძლივი ელემენტი",
      description: "მთელი დღის ავტონომიური მუშაობა და სწრაფი 30-წუთიანი 80%-მდე დამუხტვის მხარდაჭერა.",
      badge: "All-Day Power",
      color: "from-emerald-50/70 via-white to-teal-50/40 border-emerald-100/70 text-emerald-600",
    },
    {
      icon: Zap,
      title: "სწრაფი ეკრანის განახლება",
      description: "120Hz დინამიური ეკრანის სიხშირე მაქსიმალურად გლუვი გამოსახულების მისაღებად.",
      badge: "120Hz ProMotion",
      color: "from-purple-50/70 via-white to-indigo-50/40 border-purple-100/70 text-purple-600",
    },
    {
      icon: Shield,
      title: "გაძლიერებული დაცვა",
      description: "წყალგამძლე და დარტყმაგამძლე კორპუსის კონსტრუქცია ოფიციალური გარანტიით.",
      badge: "IP68 Certified",
      color: "from-amber-50/70 via-white to-orange-50/40 border-amber-100/70 text-amber-600",
    },
  ];

  const list = features && features.length > 0 ? features : defaultFeatures;

  return (
    <div className="py-10 border-t border-gray-100 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Sparkles className="size-4" />
          </div>
          <h3 className="text-base text-gray-900">მთავარი ტექნოლოგიური ინოვაციები</h3>
        </div>
        <span className="text-xs text-gray-400">შექმნილია უმაღლესი სტანდარტებით</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {list.map((item: any, idx: number) => {
          const Icon = item.icon || Cpu;
          const bgGradient = item.color || "from-gray-50/80 via-white to-slate-50/50 border-gray-200/80 text-blue-600";
          return (
            <div
              key={idx}
              className={`p-6 rounded-3xl border bg-gradient-to-br transition-all duration-300 hover:scale-[1.02] flex flex-col gap-3.5 shadow-2xs hover:shadow-xs group ${bgGradient}`}
            >
              <div className="flex items-center justify-between">
                <div className="size-11 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform duration-300">
                  <Icon className="size-5" />
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase tracking-wider px-3 py-1 rounded-xl bg-white/90 border border-gray-200/60 text-gray-700 shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="text-sm text-gray-900 leading-snug">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
