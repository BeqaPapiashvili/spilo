"use client";

import { useEffect, useState } from "react";

export default function MerchantStorePage() {
  const [form, setForm] = useState({
    description: "",
    phone: "",
    address: "",
    city: "",
    email: "",
    workingHours: "",
    mapUrl: "",
    pickupEnabled: false,
    pickupNote: "",
    facebookUrl: "",
    instagramUrl: "",
    websiteUrl: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/merchant/store")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setForm({
            description: json.data.description || "",
            phone: json.data.phone || "",
            address: json.data.address || "",
            city: json.data.city || "",
            email: json.data.email || "",
            workingHours: json.data.workingHours || "",
            mapUrl: json.data.mapUrl || "",
            pickupEnabled: Boolean(json.data.pickupEnabled),
            pickupNote: json.data.pickupNote || "",
            facebookUrl: json.data.facebookUrl || "",
            instagramUrl: json.data.instagramUrl || "",
            websiteUrl: json.data.websiteUrl || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  const setField = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/merchant/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      setMessage(json.success ? "მაღაზია შენახულია" : json.error || "შენახვა ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/merchant/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await res.json();
    setMessage(json.success ? "პაროლი შეიცვალა" : json.error || "პაროლი ვერ შეიცვალა");
    if (json.success) {
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl text-slate-900">მაღაზიის პროფილი</h1>
        <p className="text-sm text-slate-500 mt-1">ეს ინფორმაცია ჩანს საიტზე, თქვენი მაღაზიის გვერდზე</p>
      </div>
      <form onSubmit={saveStore} className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 space-y-3">
        {[
          ["phone", "ტელეფონი"],
          ["city", "ქალაქი"],
          ["address", "მისამართი"],
          ["email", "ელფოსტა"],
          ["workingHours", "სამუშაო საათები"],
          ["mapUrl", "რუკის ბმული"],
          ["facebookUrl", "Facebook"],
          ["instagramUrl", "Instagram"],
          ["websiteUrl", "ვებსაიტი"],
        ].map(([key, label]) => (
          <label key={key} className="block space-y-1">
            <span className="text-xs text-slate-500">{label}</span>
            <input
              value={String(form[key as keyof typeof form] || "")}
              onChange={(e) => setField(key as keyof typeof form, e.target.value)}
              className="w-full h-10 px-3 bg-[#F4F5F7] rounded-xl text-sm"
            />
          </label>
        ))}
        <label className="block space-y-1">
          <span className="text-xs text-slate-500">აღწერა</span>
          <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={3} className="w-full px-3 py-2 bg-[#F4F5F7] rounded-xl text-sm" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.pickupEnabled} onChange={(e) => setField("pickupEnabled", e.target.checked)} />
          თვითგატანა ხელმისაწვდომია
        </label>
        {form.pickupEnabled && (
          <input value={form.pickupNote} onChange={(e) => setField("pickupNote", e.target.value)} placeholder="თვითგატანის შენიშვნა" className="w-full h-10 px-3 bg-[#F4F5F7] rounded-xl text-sm" />
        )}
        <button type="submit" disabled={saving} className="h-11 px-4 bg-[#FF5238] text-white rounded-2xl text-sm">შენახვა</button>
      </form>

      <form onSubmit={savePassword} className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 space-y-3">
        <h2 className="text-sm text-slate-900">პაროლის შეცვლა</h2>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="მიმდინარე პაროლი" className="w-full h-10 px-3 bg-[#F4F5F7] rounded-xl text-sm" />
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="ახალი პაროლი" className="w-full h-10 px-3 bg-[#F4F5F7] rounded-xl text-sm" />
        <button type="submit" className="h-10 px-4 bg-slate-900 text-white rounded-xl text-sm">პაროლის შეცვლა</button>
      </form>
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  );
}
