"use client";

import { Moon, CreditCard, Sparkles, HelpCircle } from "lucide-react";

interface ProductPriceCalculatorProps {
  price: number;
  discountPrice?: number;
  selectedBank: "TBC" | "BOG" | "Credo";
  installmentMonths: number;
  onBankChange: (bank: "TBC" | "BOG" | "Credo") => void;
  onMonthsChange: (months: number) => void;
}

export function ProductPriceCalculator({
  price,
  discountPrice,
  selectedBank,
  installmentMonths,
  onBankChange,
  onMonthsChange,
}: ProductPriceCalculatorProps) {
  const currentPrice = discountPrice || price;
  const savings = discountPrice ? price - discountPrice : 0;
  const monthlyAmount = (currentPrice / installmentMonths).toFixed(2);

  const bankColors = {
    TBC: "border-sky-200 bg-sky-50/50 text-sky-700",
    BOG: "border-orange-200 bg-orange-50/50 text-orange-700",
    Credo: "border-red-200 bg-red-50/50 text-red-700",
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Primary Price Card */}
      <div className="p-5 bg-gradient-to-br from-gray-50/90 via-white to-gray-50/90 rounded-3xl border border-gray-100 shadow-2xs flex flex-col gap-3">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl text-gray-900 tracking-tight">
              {currentPrice.toFixed(2)} ₾
            </span>
            {discountPrice && (
              <span className="text-sm text-gray-400 line-through">
                {price.toFixed(2)} ₾
              </span>
            )}
          </div>

          {savings > 0 && (
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl">
              დაზოგეთ {savings.toFixed(2)} ₾
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 pt-1 border-t border-gray-100">
          <CreditCard className="size-4 text-blue-600" />
          <span>ფასი მოიცავს დღგ-ს | გარანტირებული საუკეთესო შეთავაზება</span>
        </div>
      </div>

      {/* 0% Interactive Bank Installment Calculator Widget */}
      <div className="p-5 bg-gradient-to-br from-blue-50/40 via-white to-sky-50/30 rounded-3xl border border-blue-100/80 shadow-2xs flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-900">
            <div className="size-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Moon className="size-4" />
            </div>
            <span>0% ონლაინ განვადების კალკულატორი</span>
          </div>

          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
            <Sparkles className="size-3" /> 0% კომისია
          </span>
        </div>

        {/* Bank Selection Buttons */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-gray-500">აირჩიეთ ბანკი:</span>
          <div className="grid grid-cols-3 gap-2">
            {(["TBC", "BOG", "Credo"] as const).map((bank) => {
              const isSelected = selectedBank === bank;
              return (
                <button
                  key={bank}
                  type="button"
                  onClick={() => onBankChange(bank)}
                  className={`py-2 rounded-2xl text-xs border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  {bank} Bank
                </button>
              );
            })}
          </div>
        </div>

        {/* Months Slider / Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-gray-500">განვადების ვადა (თვე):</span>
          <div className="grid grid-cols-5 gap-2">
            {[3, 6, 12, 24, 36].map((months) => {
              const isSelected = installmentMonths === months;
              return (
                <button
                  key={months}
                  type="button"
                  onClick={() => onMonthsChange(months)}
                  className={`py-1.5 rounded-xl text-xs border transition-all cursor-pointer ${isSelected
                    ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                >
                  {months} თვე
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Payment Calculation Summary Box */}
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${bankColors[selectedBank]}`}>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-600">ყოველთვიური შენატანი ({selectedBank}):</span>
            <span className="text-sm text-gray-900">
              {monthlyAmount} ₾ / თვეში
            </span>
          </div>

          <div className="text-right flex flex-col gap-0.5">
            <span className="text-[11px] text-gray-500">სულ ვადა:</span>
            <span className="text-xs text-gray-900">{installmentMonths} თვე</span>
          </div>
        </div>
      </div>
    </div>
  );
}
