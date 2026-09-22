"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { StoreForm, type StoreFormValues } from "@/components/admin/StoreForm";
import { StoreProductsPanel } from "@/components/admin/StoreProductsPanel";
import { StoreStats } from "@/components/admin/StoreStats";
import { StoreMerchantsPanel } from "@/components/admin/StoreMerchantsPanel";

export default function EditStorePage() {
  const params = useParams<{ id: string }>();
  const [store, setStore] = useState<StoreFormValues | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/stores");
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "მაღაზია ვერ ჩაიტვირთა");
        return;
      }
      const found = (json.data as StoreFormValues[]).find((item) => item.id === params.id);
      if (!found) setError("მაღაზია ვერ მოიძებნა");
      else setStore(found);
    };
    load();
  }, [params.id]);

  if (error) return <p className="text-sm text-[#FF5238]">{error}</p>;
  if (!store) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF5238]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StoreForm initialStore={store} />
      <StoreStats storeId={store.id || params.id} />
      <StoreMerchantsPanel storeId={store.id || params.id} />
      <StoreProductsPanel storeId={store.id || params.id} />
    </div>
  );
}
