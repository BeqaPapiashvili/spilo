"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type ProductRow = {
  id: string;
  title: string;
  sku?: string;
  storeId?: string;
};

export function StoreProductsPanel({ storeId }: { storeId: string }) {
  const [assigned, setAssigned] = useState<ProductRow[]>([]);
  const [catalog, setCatalog] = useState<ProductRow[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [assignedRes, catalogRes] = await Promise.all([
        fetch(`/api/products?store=${encodeURIComponent(storeId)}&limit=200`),
        fetch("/api/products?limit=200"),
      ]);
      const [assignedJson, catalogJson] = await Promise.all([assignedRes.json(), catalogRes.json()]);
      setAssigned(assignedJson.success ? assignedJson.data : []);
      setCatalog(catalogJson.success ? catalogJson.data : []);
      setChecked([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [storeId]);

  const run = async (productIds: string[], action: "assign" | "unassign") => {
    if (productIds.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/stores/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, productIds, action }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "ოპერაცია ვერ შესრულდა");
      await load();
    } catch (error) {
      alert(error instanceof Error ? error.message : "ოპერაცია ვერ შესრულდა");
    } finally {
      setSaving(false);
    }
  };

  const unassigned = catalog.filter((item) => item.storeId !== storeId);
  const toggle = (id: string) => {
    setChecked((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 space-y-4 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg text-slate-900">მაღაზიის პროდუქტები</h2>
          <p className="text-sm text-slate-500 mt-1">კატალოგიდან პროდუქტების მინიჭება ამ მაღაზიაზე</p>
        </div>
        <Link
          href={`/admin/products/new?storeId=${encodeURIComponent(storeId)}`}
          className="h-10 px-4 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-xl text-sm inline-flex items-center"
        >
          ახალი პროდუქტი
        </Link>
      </div>

      {loading ? (
        <div className="py-8 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-[#FF5238]" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">არამინიჭებული კატალოგი</p>
            <button
              type="button"
              disabled={checked.length === 0 || saving}
              onClick={() => run(checked, "assign")}
              className="text-sm text-[#FF5238] disabled:opacity-40"
            >
              მონიშნულის მინიჭება ({checked.length})
            </button>
          </div>
          <ul className="max-h-56 overflow-auto divide-y divide-slate-100 border border-slate-100 rounded-2xl">
            {unassigned.map((item) => (
              <li key={item.id} className="px-3 py-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={checked.includes(item.id)}
                  onChange={() => toggle(item.id)}
                />
                <span className="text-sm text-slate-800 truncate">{item.title}</span>
              </li>
            ))}
          </ul>

          {assigned.length === 0 ? (
            <p className="text-sm text-slate-500">პროდუქტი ჯერ არ არის მინიჭებული</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {assigned.map((item) => (
                <li key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-800 truncate">{item.title}</span>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => run([item.id], "unassign")}
                    className="text-xs text-slate-400 hover:text-[#FF5238]"
                  >
                    მოხსნა
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
