"use client";

import { useEffect, useState } from "react";
import {
  CalendarClock,
  Check,
  Eye,
  Loader2,
  Power,
  Rocket,
  Save,
  Wrench,
} from "lucide-react";
import { SiteOfflineScreen } from "@/components/SiteOfflineScreen";
import { DEFAULT_SITE_STATUS, type SiteMode, type SiteStatus } from "@/lib/siteStatusShared";

export default function AdminSiteStatusPage() {
  const [form, setForm] = useState<SiteStatus>(DEFAULT_SITE_STATUS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<Exclude<SiteMode, "online">>("coming_soon");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/site-status", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setForm(json.data);
        setPreview(json.data.mode === "maintenance" ? "maintenance" : "coming_soon");
      }
    } catch {
      setError("სტატუსის ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const persist = async (next: SiteStatus) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/site-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message || json.error || "შენახვა ვერ მოხერხდა");
        return false;
      }
      setForm(json.data);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
      return true;
    } catch {
      setError("შენახვა ვერ მოხერხდა");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const setMode = (mode: SiteMode) => {
    const next = { ...form, mode };
    setForm(next);
    if (mode !== "online") setPreview(mode);
    void persist(next);
  };

  const update = <K extends keyof SiteStatus>(key: K, value: SiteStatus[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const previewStatus: SiteStatus = { ...form, mode: preview };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#FF5238]">საიტის რეჟიმი</p>
            <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight mt-1">Coming Soon & Offline</h1>
            <p className="text-sm text-slate-500 mt-1">
              სტუმრები დაინახავენ შაბლონურ Coming Soon გვერდს ან საინფორმაციო offline გვერდს. ადმინი და პარტნიორი პანელი ხელმისაწვდომი რჩება.
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs ${
              form.mode === "online"
                ? "bg-emerald-50 text-emerald-700"
                : form.mode === "coming_soon"
                  ? "bg-[#FFF5F2] text-[#FF5238]"
                  : "bg-amber-50 text-amber-700"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                form.mode === "online"
                  ? "bg-emerald-500"
                  : form.mode === "coming_soon"
                    ? "bg-[#FF5238]"
                    : "bg-amber-500"
              }`}
            />
            {form.mode === "online"
              ? "საიტი ღიაა"
              : form.mode === "coming_soon"
                ? "Coming Soon აქტიურია"
                : "Offline აქტიურია"}
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      ) : null}

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF5238]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-6">
            <section className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#111111] text-white flex items-center justify-center shrink-0">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg text-slate-900 tracking-tight">Coming Soon შაბლონი</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      პროფესიონალური გახსნის გვერდი ლოგოთი, ტექსტით და ათვლით.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMode(form.mode === "coming_soon" ? "online" : "coming_soon")}
                  className={`h-10 px-3 rounded-2xl text-xs inline-flex items-center gap-2 cursor-pointer ${
                    form.mode === "coming_soon"
                      ? "bg-[#FF5238] text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {form.mode === "coming_soon" ? "გამორთვა" : "ჩართვა"}
                </button>
              </div>

              <label className="block">
                <span className="text-xs text-slate-500">ზედა წარწერა</span>
                <input
                  value={form.comingSoonEyebrow}
                  onChange={(e) => update("comingSoonEyebrow", e.target.value)}
                  className="mt-1.5 w-full h-11 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs text-slate-500">სათაური</span>
                <input
                  value={form.comingSoonTitle}
                  onChange={(e) => update("comingSoonTitle", e.target.value)}
                  className="mt-1.5 w-full h-11 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs text-slate-500">ტექსტი</span>
                <textarea
                  value={form.comingSoonSubtitle}
                  onChange={(e) => update("comingSoonSubtitle", e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full px-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm resize-y"
                />
              </label>
              <label className="block">
                <span className="text-xs text-slate-500 inline-flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5" />
                  გახსნის თარიღი (ათვლა)
                </span>
                <input
                  type="datetime-local"
                  value={form.comingSoonDate}
                  onChange={(e) => update("comingSoonDate", e.target.value)}
                  className="mt-1.5 w-full h-11 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs text-slate-500">ქვედა ტექსტი</span>
                <input
                  value={form.comingSoonFooter}
                  onChange={(e) => update("comingSoonFooter", e.target.value)}
                  className="mt-1.5 w-full h-11 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm"
                />
              </label>
            </section>

            <section className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#FFF5F2] text-[#FF5238] flex items-center justify-center shrink-0">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg text-slate-900 tracking-tight">საინფორმაციო Offline</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      ტექნიკური სამუშაოების გვერდი, სადაც ტექსტს თქვენ წერთ.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMode(form.mode === "maintenance" ? "online" : "maintenance")}
                  className={`h-10 px-3 rounded-2xl text-xs inline-flex items-center gap-2 cursor-pointer ${
                    form.mode === "maintenance"
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {form.mode === "maintenance" ? "გამორთვა" : "ჩართვა"}
                </button>
              </div>

              <label className="block">
                <span className="text-xs text-slate-500">სათაური</span>
                <input
                  value={form.maintenanceTitle}
                  onChange={(e) => update("maintenanceTitle", e.target.value)}
                  className="mt-1.5 w-full h-11 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs text-slate-500">შეტყობინება</span>
                <textarea
                  value={form.maintenanceMessage}
                  onChange={(e) => update("maintenanceMessage", e.target.value)}
                  rows={5}
                  className="mt-1.5 w-full px-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm resize-y"
                />
              </label>
              <label className="block">
                <span className="text-xs text-slate-500">საკონტაქტო ხაზი (არასავალდებულო)</span>
                <input
                  value={form.maintenanceContact}
                  onChange={(e) => update("maintenanceContact", e.target.value)}
                  placeholder="info@briz.ge · +995 ..."
                  className="mt-1.5 w-full h-11 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm"
                />
              </label>
            </section>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={() => void persist(form)}
                className="h-11 px-5 bg-[#111111] hover:bg-black text-white rounded-2xl text-xs inline-flex items-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "ინახება..." : saved ? "შენახულია" : "ტექსტების შენახვა"}
              </button>
            </div>
          </div>

          <div className="xl:sticky xl:top-28 h-fit space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 inline-flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                გადახედვა
              </p>
              <div className="flex rounded-2xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setPreview("coming_soon")}
                  className={`h-8 px-3 rounded-xl text-xs cursor-pointer ${
                    preview === "coming_soon" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  Coming Soon
                </button>
                <button
                  type="button"
                  onClick={() => setPreview("maintenance")}
                  className={`h-8 px-3 rounded-xl text-xs cursor-pointer ${
                    preview === "maintenance" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  Offline
                </button>
              </div>
            </div>
            <div className="rounded-[28px] overflow-hidden border border-slate-200/80 shadow-xs">
              <SiteOfflineScreen status={previewStatus} preview />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
