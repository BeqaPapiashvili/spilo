"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50/50 py-16 px-4">
      <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center space-y-5 border border-gray-100 shadow-2xs">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl text-gray-900">შეცდომა გვერდის ჩატვირთვისას</h1>
        <p className="text-xs text-gray-500">
          დაფიქსირდა ტექნიკური ხარვეზი. გთხოვთ სცადოთ ხელახლა.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            variant="primary"
            className="flex-1"
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            ხელახლა ცდა
          </Button>
          <Link href="/" className="flex-1">
            <Button variant="secondary" className="w-full" leftIcon={<Home className="w-4 h-4" />}>
              მთავარი გვერდი
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
