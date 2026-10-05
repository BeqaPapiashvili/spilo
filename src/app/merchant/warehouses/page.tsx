"use client";

import { useEffect, useState } from "react";
import { MapPin, Pencil, Plus, Trash2, Warehouse, X } from "lucide-react";
import { StoreLocationPicker, type StoreCoords } from "@/components/admin/StoreLocationPicker";
import { storeMapLink } from "@/lib/storeHours";

type WarehouseRow = {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
};

type FormState = {
  id?: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
};

const emptyForm: FormState = {
  name: "",
  address: "",
  city: "",
  phone: "",
  latitude: null,
  longitude: null,
  isDefault: false,
};

export default function MerchantWarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch("/api/merchant/warehouses");
    const json = await res.json();
    if (json.success) setWarehouses(json.data || []);
    else setError(json.error || "საწყობები ვერ ჩაიტვირთა");
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form) return;
    if (form.latitude == null || form.longitude == null) {
      setError("რუკაზე მონიშნე საწყობის ზუსტი წერტილი");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(form.id ? `/api/merchant/warehouses/${form.id}` : "/api/merchant/warehouses", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "შენახვა ვერ მოხერხდა");
        return;
      }
      setForm(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (warehouse: WarehouseRow) => {
    if (!window.confirm(`წავშალო „${warehouse.name}“?`)) return;
    setError("");
    const res = await fetch(`/api/merchant/warehouses/${warehouse.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) setError(json.error || "წაშლა ვერ მოხერხდა");
    else await load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl text-slate-900">საწყობები</h1>
          <p className="text-sm text-slate-500 mt-1">აქედან აიღებს კურიერი ან მომხმარებელი შეკვეთას</p>
        </div>
        <button
          type="button"
          onClick={() => setForm({ ...emptyForm, isDefault: warehouses.length === 0 })}
          className="h-11 px-4 bg-[#FF5238] text-white rounded-2xl text-sm inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          საწყობის დამატება
        </button>
      </div>

      {error && <p className="text-sm text-[#FF5238]">{error}</p>}

      {warehouses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-2">
          <Warehouse className="w-6 h-6 mx-auto text-slate-300" />
          <p className="text-sm text-slate-500">საწყობი ჯერ არ გაქვს. დაამატე, რომ შეკვეთაზე აღების ადგილი აირჩიო.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {warehouses.map((warehouse) => (
            <article key={warehouse.id} className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base text-slate-900">{warehouse.name}</h2>
                  {warehouse.isDefault && (
                    <span className="mt-1 inline-flex text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">ძირითადი</span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="რედაქტირება"
                    onClick={() => setForm({
                      id: warehouse.id,
                      name: warehouse.name,
                      address: warehouse.address,
                      city: warehouse.city,
                      phone: warehouse.phone || "",
                      latitude: warehouse.latitude,
                      longitude: warehouse.longitude,
                      isDefault: warehouse.isDefault,
                    })}
                    className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600"
                  >
                    <Pencil className="w-3.5 h-3.5 mx-auto" />
                  </button>
                  <button
                    type="button"
                    aria-label="წაშლა"
                    onClick={() => remove(warehouse)}
                    className="w-9 h-9 rounded-xl border border-slate-200 text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5 mx-auto" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-700">{warehouse.city}, {warehouse.address}</p>
              <p className="text-sm text-slate-500">{warehouse.phone || "ტელეფონი არ არის"}</p>
              {warehouse.latitude != null && warehouse.longitude != null ? (
                <a
                  href={storeMapLink(null, warehouse.latitude, warehouse.longitude) || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#FF5238] inline-flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  რუკაზე ნახვა · {warehouse.latitude.toFixed(6)}, {warehouse.longitude.toFixed(6)}
                </a>
              ) : (
                <p className="text-xs text-amber-700">რუკის წერტილი არ არის. შეცვალე და მონიშნე პინი.</p>
              )}
            </article>
          ))}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <form onSubmit={save} className="w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base text-slate-900">{form.id ? "საწყობის შეცვლა" : "ახალი საწყობი"}</h2>
              <button type="button" aria-label="დახურვა" onClick={() => setForm(null)} className="w-8 h-8 rounded-xl text-slate-400">
                <X className="w-4 h-4 mx-auto" />
              </button>
            </div>
            {[
              ["name", "სახელი"],
              ["city", "ქალაქი"],
              ["address", "სრული მისამართი"],
              ["phone", "საკონტაქტო ტელეფონი"],
            ].map(([key, label]) => (
              <label key={key} className="block space-y-1">
                <span className="text-xs text-slate-500">{label}</span>
                <input
                  required
                  value={form[key as keyof FormState] as string}
                  onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                  className="w-full h-10 px-3 bg-[#F4F5F7] rounded-xl text-sm"
                />
              </label>
            ))}
            <StoreLocationPicker
              geocodeUrl="/api/merchant/geocode"
              value={form.latitude != null && form.longitude != null ? { lat: form.latitude, lng: form.longitude } : null}
              onChange={(coords: StoreCoords | null) => setForm({
                ...form,
                latitude: coords?.lat ?? null,
                longitude: coords?.lng ?? null,
              })}
              onAddressDetected={(detectedAddress, detectedCity) => setForm((current) => current ? {
                ...current,
                address: detectedAddress || current.address,
                city: detectedCity || current.city,
              } : current)}
            />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(event) => setForm({ ...form, isDefault: event.target.checked })}
              />
              ძირითადი საწყობი
            </label>
            <button type="submit" disabled={saving} className="h-11 w-full bg-[#FF5238] text-white rounded-2xl text-sm disabled:opacity-60">
              {saving ? "ინახება..." : "შენახვა"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
