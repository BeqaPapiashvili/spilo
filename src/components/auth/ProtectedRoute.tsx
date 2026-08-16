"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { Lock, ArrowLeft, LogIn } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function ProtectedRoute({
  children,
  title = "შეკვეთის გასაფორმებლად საჭიროა ავტორიზაცია",
  description = "თქვენი შეკვეთის უსაფრთხოების, მიწოდების დეტალებისა და სტატუსის თვალყურის სადევნებლად, გთხოვთ გაიაროთ ავტორიზაცია.",
}: ProtectedRouteProps) {
  const { user, _hasHydrated, toggleAuthModal } = useStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Loading state during hydration
  if (!isMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Clear, non-silent authentication prompt screen without unsolicited modal popup
  if (!user) {
    return (
      <div className="min-h-[70vh] container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl text-gray-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => toggleAuthModal(true)}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>ავტორიზაცია / რეგისტრაცია</span>
            </button>

            <Link
              href="/cart"
              className="h-12 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>კალათაში დაბრუნება</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
