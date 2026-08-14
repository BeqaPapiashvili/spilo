"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "line" | "pills";
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = "line",
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-1 border-b border-gray-200 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (variant === "pills") {
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`px-4 py-2 text-sm rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                    isActive ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative py-3 px-4 text-sm transition-colors cursor-pointer border-b-2 -mb-[2px] ${
              isActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                  isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
