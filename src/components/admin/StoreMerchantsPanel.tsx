"use client";

import { useEffect, useState } from "react";

type Merchant = { id: string; name: string | null; email: string | null; createdAt: string };

export function StoreMerchantsPanel({ storeId }: { storeId: string }) {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/admin/stores/${encodeURIComponent(storeId)}/merchants`);
    const json = await res.json();
    if (json.success) setMerchants(json.data);
  };

  useEffect(() => {
    load();
  }, [storeId]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/stores/${encodeURIComponent(storeId)}/merchants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json();
      if (!json.success) setMessage(json.error || "შექმნა ვერ მოხერხდა");
      else {
        setName("");
        setEmail("");
        setPassword("");
        setMessage("პარტნიორი შეიქმნა. შესასვლელი: /merchant/login");
        await load();
      }
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async (id: string) => {
    const next = prompt("ახალი პაროლი (მინ. 6 სიმბოლო)");
    if (!next) return;
    const res = await fetch(`/api/admin/stores/${encodeURIComponent(storeId)}/merchants`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password: next }),
    });
    const json = await res.json();
    setMessage(json.success ? "პაროლი განახლდა" : json.error || "ვერ შეიცვალა");
  };

  const remove = async (id: string) => {
    if (!confirm("პარტნიორის წვდომის მოხსნა?")) return;
    const res = await fetch(`/api/admin/stores/${encodeURIComponent(storeId)}/merchants?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.success) await load();
    else setMessage(json.error || "წაშლა ვერ მოხერხდა");
  };

  return (
    <div id="merchant" className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 space-y-4 max-w-3xl">
      <div>
        <h2 className="text-lg text-slate-900">ამ მაღაზიის წარმომადგენელი</h2>
        <p className="text-sm text-slate-500 mt-1">
          აქ შექმნილი ანგარიში შედის მხოლოდ /merchant/login-ზე და ხედავს ამ მაღაზიის პროდუქტებსა და შეკვეთებს. მომხმარებლებში ნუ შექმნი.
        </p>
      </div>
      <form onSubmit={create} className="grid sm:grid-cols-3 gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="სახელი" className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ელფოსტა" className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="პაროლი" className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
        <button type="submit" disabled={saving} className="sm:col-span-3 h-10 bg-[#FF5238] text-white rounded-xl text-sm">ანგარიშის შექმნა</button>
      </form>
      <ul className="divide-y divide-slate-100">
        {merchants.map((item) => (
          <li key={item.id} className="py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-400">{item.email}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => resetPassword(item.id)} className="text-xs text-slate-500">პაროლი</button>
              <button type="button" onClick={() => remove(item.id)} className="text-xs text-[#FF5238]">მოხსნა</button>
            </div>
          </li>
        ))}
      </ul>
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  );
}
