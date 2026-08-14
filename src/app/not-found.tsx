"use client";

import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-gray-50/50 py-16 px-4">
      <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center space-y-5 border border-gray-100 shadow-2xs">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">
          404
        </div>
        <h1 className="text-2xl text-gray-900">გვერდი ვერ მოიძებნა</h1>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          სამწუხაროდ, გვერდი რომელსაც ეძებთ არ არსებობს ან შეცვლილია მისამართი.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link href="/" className="flex-1">
            <Button variant="primary" className="w-full" leftIcon={<Home className="w-4 h-4" />}>
              მთავარი გვერდი
            </Button>
          </Link>
          <Link href="/catalog" className="flex-1">
            <Button variant="secondary" className="w-full" leftIcon={<Search className="w-4 h-4" />}>
              კატალოგი
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
