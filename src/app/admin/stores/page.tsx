"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, Pencil, Plus, Store, Trash2 } from "lucide-react";

type AdminStore = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  coverImage: string | null;
  isActive: boolean;
  productCount: number;
  merchantCount?: number;
};

export default function AdminStoresPage() {
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stores");
      const json = await res.json();
      if (json.success) setStores(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (store: AdminStore) => {
    if (!confirm(`წავშალოთ "${store.name}"?`)) return;
    const res = await fetch(`/api/admin/stores?id=${encodeURIComponent(store.id)}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) load();
    else alert(json.error || "წაშლა ვერ მოხერხდა");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight">მაღაზიები ({stores.length})</h1>
          <p className="text-sm text-slate-500 mt-1">პარტნიორი მაღაზიები, ბრენდირებული გვერდები და პროდუქცია</p>
        </div>
        <Link
          href="/admin/stores/new"
          className="h-11 px-5 bg-[#FF5238] hover:bg-[#EA3A20] text-white rounded-2xl text-xs inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          ახალი მაღაზია
        </Link>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF5238]" />
        </div>
      ) : stores.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 py-16 text-center">
          <Store className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="mt-3 text-sm text-slate-700">მაღაზია ჯერ არ არის</p>
          <Link href="/admin/stores/new" className="mt-4 inline-flex text-sm text-[#FF5238]">
            პირველი მაღაზიის დამატება
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div key={store.id} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
              <div className="h-24 bg-[#F4F5F7]">
                {store.coverImage ? <img src={store.coverImage} alt="" className="w-full h-full object-cover" /> : null}
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white border border-gray-200 overflow-hidden -mt-8 shrink-0">
                    {store.logo ? (
                      <img src={store.logo} alt="" className="w-full h-full object-contain p-1" />
                    ) : (
                      <Store className="w-5 h-5 m-3.5 text-gray-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-900 truncate">{store.name}</p>
                    <Link
                      href={`/stores/${store.slug}`}
                      target="_blank"
                      className="text-[11px] text-slate-400 font-mono hover:text-[#FF5238]"
                    >
                      /stores/{store.slug}
                    </Link>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{store.productCount} პროდუქტი · {store.merchantCount || 0} პარტნიორი</span>
                  <span className={store.isActive ? "text-emerald-600" : "text-slate-400"}>
                    {store.isActive ? "აქტიური" : "გამორთული"}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Link href={`/stores/${store.slug}`} target="_blank" className="p-2 rounded-lg hover:bg-slate-50 text-slate-400">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <Link href={`/admin/stores/${store.id}/edit`} className="p-2 rounded-lg hover:bg-slate-50 text-slate-400">
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/admin/stores/${store.id}/edit#merchant`}
                    className="h-8 px-2.5 rounded-lg bg-[#FFF5F2] text-[#FF5238] text-[11px] inline-flex items-center"
                  >
                    პარტნიორი
                  </Link>
                  <button type="button" onClick={() => handleDelete(store)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
