"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Package, Search } from "lucide-react";

type Product = {
  id: string;
  title: string;
  sku: string;
  price: number;
  costPrice: number | null;
  discountPrice: number | null;
  stock: number;
  status: string;
  image: string | null;
};

type Filter = "ALL" | "IN" | "LOW" | "OUT";

export default function MerchantProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [savingId, setSavingId] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const load = async () => {
    const res = await fetch("/api/merchant/products");
    const json = await res.json();
    if (json.success) setProducts(json.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const saveStock = async (id: string, stock: number) => {
    const next = Math.max(0, Math.floor(stock));
    setSavingId(id);
    setError("");
    setProducts((current) => current.map((item) => (item.id === id ? { ...item, stock: next } : item)));
    try {
      const res = await fetch("/api/merchant/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, stock: next }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "მარაგი ვერ განახლდა");
        await load();
      } else {
        setDrafts((current) => {
          const next = { ...current };
          delete next[id];
          return next;
        });
      }
    } catch {
      setError("მარაგი ვერ განახლდა");
      await load();
    } finally {
      setSavingId("");
    }
  };

  const visible = useMemo(() => {
    return products.filter((product) => {
      const text = `${product.title} ${product.sku}`.toLowerCase();
      const matchesQuery = !query.trim() || text.includes(query.trim().toLowerCase());
      const matchesFilter =
        filter === "ALL" ||
        (filter === "IN" && product.stock > 3) ||
        (filter === "LOW" && product.stock > 0 && product.stock <= 3) ||
        (filter === "OUT" && product.stock <= 0);
      return matchesQuery && matchesFilter;
    });
  }, [filter, products, query]);

  const counts = {
    ALL: products.length,
    IN: products.filter((item) => item.stock > 3).length,
    LOW: products.filter((item) => item.stock > 0 && item.stock <= 3).length,
    OUT: products.filter((item) => item.stock <= 0).length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl text-slate-900">პროდუქტები</h1>
        <p className="text-sm text-slate-500 mt-1">
          დამატება და წაშლა ადმინისტრაციას შეუძლია. თქვენ შეგიძლიათ მიუთითოთ მარაგი ან რომ აღარ არის მარაგში.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="სახელი ან SKU"
            className="w-full h-11 pl-10 pr-3 bg-white rounded-2xl text-sm border border-slate-200 outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["ALL", `ყველა (${counts.ALL})`],
              ["IN", `მარაგშია (${counts.IN})`],
              ["LOW", `დაბალი (${counts.LOW})`],
              ["OUT", `ამოწურული (${counts.OUT})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`h-11 px-3 rounded-2xl text-xs border ${
                filter === key ? "bg-[#111111] text-white border-[#111111]" : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-[#FF5238]">{error}</p>}

      <div className="grid gap-3">
        {visible.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-10 text-sm text-slate-400 text-center">
            პროდუქტი არ მოიძებნა
          </div>
        ) : (
          visible.map((product) => {
            const out = product.stock <= 0;
            return (
              <div key={product.id} className="bg-white rounded-3xl border border-slate-200/80 p-4 flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden shrink-0">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link href={`/product/${product.id}`} target="_blank" className="text-sm text-slate-900 hover:text-[#FF5238] inline-flex items-center gap-1">
                      {product.title}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <p className="text-xs text-slate-400 mt-0.5">SKU {product.sku}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      ასაღები {Number(product.costPrice || 0).toFixed(2)} ₾ · საიტზე {Number(product.discountPrice || product.price).toFixed(2)} ₾
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
                  <div className="flex rounded-2xl border border-slate-200 overflow-hidden">
                    <button
                      type="button"
                      disabled={savingId === product.id || !out}
                      onClick={() => saveStock(product.id, 1)}
                      className={`h-11 px-3 text-xs ${!out ? "bg-emerald-600 text-white" : "bg-white text-slate-500"}`}
                    >
                      მარაგშია
                    </button>
                    <button
                      type="button"
                      disabled={savingId === product.id || out}
                      onClick={() => saveStock(product.id, 0)}
                      className={`h-11 px-3 text-xs ${out ? "bg-[#FF5238] text-white" : "bg-white text-slate-500"}`}
                    >
                      არ არის მარაგში
                    </button>
                  </div>
                  <label className="flex items-center gap-2 h-11 px-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-400">რაოდენობა</span>
                    <input
                      type="number"
                      min={0}
                      value={drafts[product.id] ?? String(product.stock)}
                      disabled={savingId === product.id}
                      onChange={(e) => setDrafts((current) => ({ ...current, [product.id]: e.target.value }))}
                      onBlur={() => {
                        const next = Number(drafts[product.id] ?? product.stock);
                        if (Number.isFinite(next) && next !== product.stock) saveStock(product.id, next);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                      }}
                      className="w-16 bg-transparent text-sm outline-none font-mono"
                    />
                  </label>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
