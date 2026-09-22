"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { useStore } from "@/store/useStore";

function FailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId") || "";
  const { addToast } = useStore();
  const [retrying, setRetrying] = useState(false);

  const retry = async () => {
    if (!orderId) {
      router.push("/checkout");
      return;
    }
    setRetrying(true);
    try {
      const payRes = await fetch("/api/checkout/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const payData = await payRes.json();
      if (!payRes.ok || !payData.success || !payData.redirectUrl) {
        addToast({
          title: "გადახდა ვერ გაიმეორდა",
          message: payData.error || "სცადეთ ხელახლა",
          type: "error",
        });
        setRetrying(false);
        return;
      }
      window.location.href = payData.redirectUrl;
    } catch {
      setRetrying(false);
      addToast({ title: "შეცდომა", message: "სერვერთან კავშირი ვერ დამყარდა", type: "error" });
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-xs p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="text-xl text-gray-900">გადახდა ვერ შესრულდა</h1>
        <p className="text-sm text-gray-600">
          {orderId
            ? `შეკვეთა ${orderId} დარჩა მოლოდინში. შეგიძლიათ ხელახლა სცადოთ ბარათით გადახდა.`
            : "ტრანზაქცია ვერ დასრულდა. დაბრუნდით ჩექაუთზე და სცადეთ სხვა მეთოდი."}
        </p>
        <div className="flex flex-col gap-2.5 pt-2">
          {orderId && (
            <button
              type="button"
              onClick={retry}
              disabled={retrying}
              className="h-12 rounded-2xl bg-[#FF5238] text-white text-sm cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {retrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              ხელახლა გადახდა
            </button>
          )}
          <Link href="/checkout" className="h-12 rounded-2xl bg-[#F4F5F7] text-gray-800 text-sm flex items-center justify-center">
            ჩექაუთზე დაბრუნება
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <FailedContent />
    </Suspense>
  );
}
