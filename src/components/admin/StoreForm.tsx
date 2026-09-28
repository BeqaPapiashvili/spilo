"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { CustomToggle } from "@/components/admin/ui/CustomToggle";
import { slugifyStoreName } from "@/lib/storeSlug";
import { StoreLocationPicker, type StoreCoords } from "@/components/admin/StoreLocationPicker";

export type StoreFormValues = {
  id?: string;
  name: string;
  slug: string;
  logo?: string | null;
  coverImage?: string | null;
  description?: string | null;
  phone?: string | null;
  address?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  websiteUrl?: string | null;
  city?: string | null;
  email?: string | null;
  workingHours?: string | null;
  mapUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  pickupEnabled?: boolean;
  pickupNote?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export function StoreForm({ initialStore }: { initialStore?: StoreFormValues }) {
  const router = useRouter();
  const isEdit = Boolean(initialStore?.id);
  const [name, setName] = useState(initialStore?.name || "");
  const [slug, setSlug] = useState(initialStore?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!isEdit);
  const [logo, setLogo] = useState(initialStore?.logo || "");
  const [coverImage, setCoverImage] = useState(initialStore?.coverImage || "");
  const [description, setDescription] = useState(initialStore?.description || "");
  const [phone, setPhone] = useState(initialStore?.phone || "");
  const [address, setAddress] = useState(initialStore?.address || "");
  const [facebookUrl, setFacebookUrl] = useState(initialStore?.facebookUrl || "");
  const [instagramUrl, setInstagramUrl] = useState(initialStore?.instagramUrl || "");
  const [websiteUrl, setWebsiteUrl] = useState(initialStore?.websiteUrl || "");
  const [city, setCity] = useState(initialStore?.city || "");
  const [email, setEmail] = useState(initialStore?.email || "");
  const [workingHours, setWorkingHours] = useState(initialStore?.workingHours || "");
  const [mapUrl, setMapUrl] = useState(initialStore?.mapUrl || "");
  const [coords, setCoords] = useState<StoreCoords | null>(
    initialStore?.latitude != null && initialStore?.longitude != null
      ? { lat: initialStore.latitude, lng: initialStore.longitude }
      : null
  );
  const [pickupEnabled, setPickupEnabled] = useState(Boolean(initialStore?.pickupEnabled));
  const [pickupNote, setPickupNote] = useState(initialStore?.pickupNote || "");
  const [isActive, setIsActive] = useState(initialStore?.isActive !== false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (autoSlug) setSlug(slugifyStoreName(name));
  }, [name, autoSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("მაღაზიის სახელი აუცილებელია");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        id: initialStore?.id,
        name: name.trim(),
        slug: slug.trim() || slugifyStoreName(name),
        logo,
        coverImage,
        description,
        phone,
        address,
        facebookUrl,
        instagramUrl,
        websiteUrl,
        city,
        email,
        workingHours,
        mapUrl,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        pickupEnabled,
        pickupNote,
        isActive,
      };
      const res = await fetch("/api/admin/stores", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "შენახვა ვერ მოხერხდა");
      }
      router.push("/admin/stores");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "შენახვა ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin/stores" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#FF5238]">
          <ArrowLeft className="w-4 h-4" />
          მაღაზიების სია
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div>
          <h1 className="text-2xl text-slate-900 tracking-tight">
            {isEdit ? "მაღაზიის რედაქტირება" : "ახალი მაღაზია"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">ლოგო, ქავერი, აღწერა და საკონტაქტო ინფორმაცია</p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs text-slate-600">სახელი</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="მაგ: Techno Shop"
            className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#FF5238]"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs text-slate-600">Slug / URL</span>
          <input
            value={slug}
            onChange={(e) => {
              setAutoSlug(false);
              setSlug(e.target.value);
            }}
            placeholder="techno-shop"
            className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:border-[#FF5238]"
          />
          <span className="text-[11px] text-slate-400">გვერდი: /stores/{slug || "techno-shop"}</span>
        </label>

        <ImageUploader
          multiple={false}
          label="ლოგო"
          images={logo ? [logo] : []}
          onChange={(images) => setLogo(images[0] || "")}
        />

        <ImageUploader
          multiple={false}
          label="ქავერ ბანერი"
          images={coverImage ? [coverImage] : []}
          onChange={(images) => setCoverImage(images[0] || "")}
        />

        <label className="block space-y-1.5">
          <span className="text-xs text-slate-600">აღწერა</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#FF5238]"
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5">
            <span className="text-xs text-slate-600">ქალაქი</span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs text-slate-600">ელფოსტა</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs text-slate-600">სამუშაო საათები</span>
            <input
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              placeholder="10:00-20:00"
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs text-slate-600">რუკის ბმული</span>
            <input
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs text-slate-600">ტელეფონი</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs text-slate-600">მისამართი</span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ქუჩა, ნომერი, სართული / ოფისი"
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs text-slate-600">ფეისბუქი</span>
            <input
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs text-slate-600">ინსტაგრამი</span>
            <input
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs text-slate-600">ვებსაიტი</span>
            <input
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </label>
        </div>

        <div className="pt-5 border-t border-slate-100">
          <StoreLocationPicker
            value={coords}
            onChange={setCoords}
            onAddressDetected={(detectedAddress, detectedCity) => {
              if (detectedAddress) setAddress(detectedAddress);
              if (detectedCity) setCity(detectedCity);
            }}
          />
        </div>

        <CustomToggle
          checked={pickupEnabled}
          onChange={setPickupEnabled}
          label="თვითგატანა ხელმისაწვდომია"
          description="მომხმარებელს შეუძლია პროდუქტის გატანა მაღაზიიდან"
        />
        {pickupEnabled && (
          <label className="block space-y-1.5">
            <span className="text-xs text-slate-600">თვითგატანის შენიშვნა</span>
            <input
              value={pickupNote}
              onChange={(e) => setPickupNote(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </label>
        )}

        <CustomToggle
          checked={isActive}
          onChange={setIsActive}
          label="აქტიური მაღაზია"
          description="გამოჩნდება /stores კატალოგში"
        />

        {error && <p className="text-sm text-[#FF5238]">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="h-11 px-5 bg-[#FF5238] hover:bg-[#EA3A20] disabled:opacity-70 text-white rounded-2xl text-sm inline-flex items-center gap-2 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          შენახვა
        </button>
      </div>
    </form>
  );
}
