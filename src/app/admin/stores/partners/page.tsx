"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type StoreOption = { id: string; name: string };
type Merchant = {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  store: { id: string; name: string; slug: string } | null;
};

export default function StorePartnersPage() {
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [storeId, setStoreId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [storeRes, merchantRes] = await Promise.all([
      fetch("/api/admin/stores"),
      fetch("/api/admin/merchants"),
    ]);
    const [storeJson, merchantJson] = await Promise.all([storeRes.json(), merchantRes.json()]);
    if (storeJson.success) {
      setStores(storeJson.data.map((s: StoreOption) => ({ id: s.id, name: s.name })));
    }
    if (merchantJson.success) setMerchants(merchantJson.data);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, name, email, password }),
      });
      const json = await res.json();
      if (!json.success) {
        setMessage(json.error || "შექმნა ვერ მოხერხდა");
        return;
      }
      setName("");
      setEmail("");
      setPassword("");
      setMessage("პარტნიორი შეიქმნა. შესასვლელი: /merchant/login");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: Merchant) => {
    if (!item.store?.id || !confirm("პარტნიორის წვდომის მოხსნა?")) return;
    const res = await fetch(
      `/api/admin/stores/${encodeURIComponent(item.store.id)}/merchants?id=${encodeURIComponent(item.id)}`,
      { method: "DELETE" }
    );
    const json = await res.json();
    if (json.success) await load();
    else setMessage(json.error || "წაშლა ვერ მოხერხდა");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80">
        <h1 className="text-2xl text-slate-900">მაღაზიის წარმომადგენლები</h1>
        <p className="text-sm text-slate-500 mt-1">
          ეს ანგარიშები არ იქმნება მომხმარებლებში. თითოეულს ენიჭება ერთი მაღაზია და ხედავს მხოლოდ იმ მაღაზიის პროდუქტებსა და შეკვეთებს. შესვლა: /merchant/login
        </p>
      </div>

      <form onSubmit={create} className="bg-white rounded-3xl p-6 border border-slate-200/80 space-y-3">
        <h2 className="text-sm text-slate-900">ახალი პარტნიორი</h2>
        <select
          required
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
        >
          <option value="">აირჩიეთ მაღაზია</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="სახელი" className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ელფოსტა" className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
        <input required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="პაროლი (მინ. 6)" className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
        <button type="submit" disabled={saving || !storeId} className="h-11 px-5 bg-[#FF5238] text-white rounded-xl text-sm disabled:opacity-50">
          ანგარიშის შექმნა
        </button>
        {message && <p className="text-sm text-slate-600">{message}</p>}
      </form>

      <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100">
        {merchants.length === 0 ? (
          <p className="p-8 text-sm text-slate-400 text-center">პარტნიორი ჯერ არ არის</p>
        ) : (
          merchants.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-400">{item.email}</p>
                <p className="text-xs text-[#FF5238] mt-1">{item.store?.name || "მაღაზია არ არის"}</p>
              </div>
              <div className="flex items-center gap-3">
                {item.store && (
                  <Link href={`/admin/stores/${item.store.id}/edit#merchant`} className="text-xs text-slate-500">
                    მაღაზია
                  </Link>
                )}
                <button type="button" onClick={() => remove(item)} className="text-xs text-[#FF5238]">
                  მოხსნა
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
