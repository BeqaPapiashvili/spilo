"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Crosshair,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

export type StoreCoords = { lat: number; lng: number };

type NominatimResult = { lat: string; lon: string; display_name: string; address?: Record<string, string> };

type Suggestion = {
  lat: number;
  lng: number;
  label: string;
  address: string;
  city: string;
  source: "google" | "osm";
  approximate: boolean;
};

type GoogleGeocode = {
  lat: number;
  lng: number;
  address: string;
  shortAddress: string;
  city: string;
  precise: boolean;
};

type PinOptions = { focus?: boolean; zoom?: number; reverse?: boolean };

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const DEFAULT_CENTER: StoreCoords = { lat: 41.7151, lng: 44.8271 };
const NOMINATIM = "https://nominatim.openstreetmap.org";
const NUDGE_STEPS = [2, 10, 50];

declare global {
  interface Window {
    google?: any;
    __spiloGmapsLoading?: Promise<any>;
  }
}

function loadGoogleMaps(key: string): Promise<any> {
  if (window.google?.maps?.Map) return Promise.resolve(window.google);
  if (window.__spiloGmapsLoading) return window.__spiloGmapsLoading;
  window.__spiloGmapsLoading = new Promise((resolve, reject) => {
    const callbackName = "__spiloGmapsReady";
    (window as any)[callbackName] = () => resolve(window.google);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&language=ka&region=GE&loading=async&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });
  return window.__spiloGmapsLoading;
}

/** Accepts "41.7151, 44.8271" or a pasted Google Maps link (@lat,lng / q=lat,lng / !3dlat!4dlng). */
function parseCoords(text: string): StoreCoords | null {
  let value = text.trim();
  try {
    value = decodeURIComponent(value);
  } catch {}
  const patterns = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&](?:q|query|ll|center|destination)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /^(-?\d{1,2}(?:\.\d+)?)\s*[,\s]\s*(-?\d{1,3}(?:\.\d+)?)$/,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) {
      const lat = Number(match[1]);
      const lng = Number(match[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
    }
  }
  return null;
}

const KEEP_ADDRESS_RADIUS_M = 150;

function distanceMeters(a: StoreCoords, b: StoreCoords) {
  const dLat = (b.lat - a.lat) * 111_320;
  const dLng = (b.lng - a.lng) * 111_320 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

function round6(value: number) {
  return Math.round(value * 1e6) / 1e6;
}

function cityFrom(address?: Record<string, string>) {
  if (!address) return "";
  return address.city || address.town || address.village || address.municipality || address.state || "";
}

function streetFrom(result: NominatimResult) {
  const a = result.address;
  if (!a) return result.display_name;
  const street = [a.road || a.pedestrian || a.footway, a.house_number].filter(Boolean).join(" ");
  const area = a.suburb || a.neighbourhood || a.quarter || "";
  return [street, area].filter(Boolean).join(", ") || result.display_name;
}

/** Full interactive Google Maps (requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY): click or drag to place the pin. */
function GoogleInteractiveMap({
  pin,
  focus,
  satellite,
  onPick,
}: {
  pin: StoreCoords | null;
  focus: { lat: number; lng: number; zoom: number; seq: number } | null;
  satellite: boolean;
  onPick: (coords: StoreCoords) => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps(GOOGLE_MAPS_KEY)
      .then((google) => {
        if (cancelled || !elRef.current || mapRef.current) return;
        const start = pin || DEFAULT_CENTER;
        const map = new google.maps.Map(elRef.current, {
          center: start,
          zoom: pin ? 18 : 12,
          mapTypeId: satellite ? "hybrid" : "roadmap",
          streetViewControl: false,
          mapTypeControl: false,
          clickableIcons: false,
          gestureHandling: "greedy",
        });
        map.addListener("click", (e: any) => onPickRef.current({ lat: e.latLng.lat(), lng: e.latLng.lng() }));
        mapRef.current = map;
        if (pin) {
          markerRef.current = new google.maps.Marker({ map, position: pin, draggable: true });
          markerRef.current.addListener("dragend", (e: any) =>
            onPickRef.current({ lat: e.latLng.lat(), lng: e.latLng.lng() })
          );
        }
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const google = window.google;
    const map = mapRef.current;
    if (!google || !map) return;
    if (!pin) {
      markerRef.current?.setMap(null);
      markerRef.current = null;
      return;
    }
    if (!markerRef.current) {
      markerRef.current = new google.maps.Marker({ map, position: pin, draggable: true });
      markerRef.current.addListener("dragend", (e: any) =>
        onPickRef.current({ lat: e.latLng.lat(), lng: e.latLng.lng() })
      );
    } else {
      markerRef.current.setPosition(pin);
    }
  }, [pin]);

  useEffect(() => {
    if (!focus || !mapRef.current) return;
    mapRef.current.setCenter({ lat: focus.lat, lng: focus.lng });
    mapRef.current.setZoom(focus.zoom);
  }, [focus]);

  useEffect(() => {
    mapRef.current?.setMapTypeId(satellite ? "hybrid" : "roadmap");
  }, [satellite]);

  if (failed) {
    return (
      <div className="w-full h-[380px] flex items-center justify-center text-xs text-slate-500 bg-slate-50">
        Google Maps ვერ ჩაიტვირთა. შეამოწმეთ API გასაღები.
      </div>
    );
  }
  return <div ref={elRef} className="w-full h-[380px] bg-slate-100" />;
}

/** Keyless Google Maps embed: native zoom/pan inside the map, pin set via search, link, coordinates or nudge arrows. */
function GoogleEmbedMap({
  pin,
  zoom,
  satellite,
}: {
  pin: StoreCoords | null;
  zoom: number;
  satellite: boolean;
}) {
  const center = pin || DEFAULT_CENTER;
  const q = pin ? `${pin.lat},${pin.lng}` : "Tbilisi";
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(q)}&ll=${center.lat},${center.lng}&z=${pin ? zoom : 12}&t=${satellite ? "k" : "m"}&hl=ka&output=embed`;
  return (
    <iframe
      key={src}
      src={src}
      title="Google Maps"
      className="w-full h-[380px] border-0 bg-slate-100"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

export function StoreLocationPicker({
  value,
  onChange,
  onAddressDetected,
}: {
  value: StoreCoords | null;
  onChange: (coords: StoreCoords | null) => void;
  onAddressDetected: (address: string, city: string) => void;
}) {
  const interactive = Boolean(GOOGLE_MAPS_KEY);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [satellite, setSatellite] = useState(false);
  const [zoom, setZoom] = useState(18);
  const [nudgeStep, setNudgeStep] = useState(NUDGE_STEPS[1]);
  const [focus, setFocus] = useState<{ lat: number; lng: number; zoom: number; seq: number } | null>(null);
  const [detected, setDetected] = useState<{ address: string; city: string; approximate?: boolean } | null>(null);
  const [latInput, setLatInput] = useState(value ? String(value.lat) : "");
  const [lngInput, setLngInput] = useState(value ? String(value.lng) : "");
  const addressAnchorRef = useRef<StoreCoords | null>(value);

  const reverseGeocode = async (coords: StoreCoords) => {
    const anchor = addressAnchorRef.current;
    if (anchor && distanceMeters(anchor, coords) <= KEEP_ADDRESS_RADIUS_M) return;
    addressAnchorRef.current = null;
    const google = window.google;
    if (interactive && google?.maps?.Geocoder) {
      try {
        const { results: found } = await new google.maps.Geocoder().geocode({ location: coords, language: "ka" });
        const best = found?.[0];
        if (best) {
          const locality = best.address_components?.find((c: any) => c.types.includes("locality"))?.long_name || "";
          const street = best.formatted_address.replace(/,\s*საქართველო$/, "").replace(`, ${locality}`, "");
          setDetected({ address: street, city: locality });
          return;
        }
      } catch {}
    }
    try {
      const res = await fetch(
        `${NOMINATIM}/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1&accept-language=ka`
      );
      const data: NominatimResult = await res.json();
      if (data?.display_name) setDetected({ address: streetFrom(data), city: cityFrom(data.address), approximate: true });
    } catch {
      setDetected(null);
    }
  };

  const setPin = (coords: StoreCoords, opts: PinOptions = {}) => {
    const rounded = { lat: round6(coords.lat), lng: round6(coords.lng) };
    onChange(rounded);
    setLatInput(String(rounded.lat));
    setLngInput(String(rounded.lng));
    if (opts.zoom) setZoom(opts.zoom);
    if (opts.focus) setFocus({ ...rounded, zoom: opts.zoom || zoom, seq: Date.now() });
    if (opts.reverse) reverseGeocode(rounded);
  };

  useEffect(() => {
    const q = query.trim();
    const pasted = parseCoords(q);
    if (pasted) {
      setResults([]);
      setQuery("");
      setPin(pasted, { focus: true, zoom: 19, reverse: true });
      return;
    }
    if (q.length < 3) {
      setResults([]);
      setSearching(false);
      return;
    }
    let stale = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      const googleQuery = /საქართველო|georgia/i.test(q) ? q : `${q}, საქართველო`;
      const [google, osm] = await Promise.all([
        fetch(`/api/admin/stores/geocode?q=${encodeURIComponent(googleQuery)}`)
          .then((res) => res.json())
          .then((json): GoogleGeocode | null => (json.success ? json.result : null))
          .catch(() => null),
        fetch(
          `${NOMINATIM}/search?format=json&addressdetails=1&limit=4&countrycodes=ge&accept-language=ka&q=${encodeURIComponent(q)}`
        )
          .then((res) => res.json() as Promise<NominatimResult[]>)
          .catch(() => [] as NominatimResult[]),
      ]);
      if (stale) return;

      const list: Suggestion[] = [];
      if (google) {
        list.push({
          lat: google.lat,
          lng: google.lng,
          label: google.precise ? google.address : `${q} · მიახლოებითი, პინი დააზუსტეთ`,
          address: google.shortAddress,
          city: google.city,
          source: "google",
          approximate: !google.precise,
        });
      }
      for (const r of osm) {
        list.push({
          lat: Number(r.lat),
          lng: Number(r.lon),
          label: r.display_name,
          address: streetFrom(r),
          city: cityFrom(r.address),
          source: "osm",
          approximate: true,
        });
      }
      setResults(list);
      setSearching(false);
    }, 500);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const selectResult = (result: Suggestion) => {
    setResults([]);
    setQuery("");
    const coords = { lat: result.lat, lng: result.lng };
    if (result.address) {
      addressAnchorRef.current = coords;
      setDetected({ address: result.address, city: result.city, approximate: result.approximate });
      setPin(coords, { focus: true, zoom: 19 });
    } else {
      addressAnchorRef.current = null;
      setPin(coords, { focus: true, zoom: 19, reverse: true });
    }
  };

  const locateMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setPin({ lat: pos.coords.latitude, lng: pos.coords.longitude }, { focus: true, zoom: 19, reverse: true });
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const nudge = (dy: number, dx: number) => {
    if (!value) return;
    const metersPerDegLat = 111_320;
    const metersPerDegLng = 111_320 * Math.cos((value.lat * Math.PI) / 180);
    setPin({
      lat: value.lat + (dy * nudgeStep) / metersPerDegLat,
      lng: value.lng + (dx * nudgeStep) / metersPerDegLng,
    });
  };

  const applyManualCoords = () => {
    if (!latInput.trim() || !lngInput.trim()) return;
    const lat = Number(latInput.replace(",", "."));
    const lng = Number(lngInput.replace(",", "."));
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return;
    if (value && round6(lat) === value.lat && round6(lng) === value.lng) return;
    setPin({ lat, lng }, { focus: true, zoom: 19, reverse: true });
  };

  const clearPin = () => {
    setLatInput("");
    setLngInput("");
    setDetected(null);
    addressAnchorRef.current = null;
    onChange(null);
  };

  const arrowButton = "w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-slate-50 text-slate-700 cursor-pointer disabled:opacity-40";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-xs text-slate-600">ზუსტი მდებარეობა რუკაზე</span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {interactive
              ? "მოძებნეთ მისამართი ან დააჭირეთ რუკას. პინი შეგიძლიათ გადაათრიოთ ზუსტ ადგილზე."
              : "მოძებნეთ მისამართი ან ჩასვით Google Maps-ის ბმული. პინი ისრებით დააზუსტეთ."}
          </p>
        </div>
        <div className="flex p-0.5 bg-slate-100 rounded-xl text-[11px] shrink-0">
          <button
            type="button"
            onClick={() => setSatellite(false)}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${!satellite ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"}`}
          >
            რუკა
          </button>
          <button
            type="button"
            onClick={() => setSatellite(true)}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${satellite ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"}`}
          >
            სატელიტი
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (results[0]) selectResult(results[0]);
            }
          }}
          placeholder="მოძებნეთ მისამართი ან ჩასვით Google Maps-ის ბმული / კოორდინატები"
          className="w-full h-11 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#FF5238]"
        />
        {searching && <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />}
        {results.length > 0 && (
          <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            {results.map((r, i) => (
              <button
                key={`${r.source}-${r.lat}-${r.lng}-${i}`}
                type="button"
                onClick={() => selectResult(r)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-start gap-2 text-xs text-slate-700 cursor-pointer border-b border-slate-100 last:border-0"
              >
                <MapPin className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${r.source === "google" ? "text-[#FF5238]" : "text-slate-400"}`} />
                <span className="line-clamp-2 flex-1">{r.label}</span>
                {r.source === "google" && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-[#FFF5F2] text-[#FF5238] text-[10px]">Google</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-slate-200">
        {interactive ? (
          <GoogleInteractiveMap
            pin={value}
            focus={focus}
            satellite={satellite}
            onPick={(coords) => setPin(coords, { reverse: true })}
          />
        ) : (
          <GoogleEmbedMap pin={value} zoom={zoom} satellite={satellite} />
        )}

        <button
          type="button"
          onClick={locateMe}
          disabled={locating}
          className="absolute z-10 top-3 left-3 h-9 px-3 bg-white rounded-xl shadow-md text-xs text-slate-700 flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 disabled:opacity-60"
        >
          {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
          ჩემი მდებარეობა
        </button>

        {!interactive && value && (
          <div className="absolute z-10 bottom-3 right-3 bg-slate-100/95 rounded-2xl shadow-md p-2 flex items-center gap-2">
            <div className="grid grid-cols-3 gap-1">
              <span />
              <button type="button" onClick={() => nudge(1, 0)} className={arrowButton} title="ჩრდილოეთით">
                <ArrowUp className="w-4 h-4" />
              </button>
              <span />
              <button type="button" onClick={() => nudge(0, -1)} className={arrowButton} title="დასავლეთით">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="w-8 h-8 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-[#FF5238]" />
              </span>
              <button type="button" onClick={() => nudge(0, 1)} className={arrowButton} title="აღმოსავლეთით">
                <ArrowRight className="w-4 h-4" />
              </button>
              <span />
              <button type="button" onClick={() => nudge(-1, 0)} className={arrowButton} title="სამხრეთით">
                <ArrowDown className="w-4 h-4" />
              </button>
              <span />
            </div>
            <div className="flex flex-col gap-1">
              <button type="button" onClick={() => setZoom((z) => Math.min(21, z + 1))} className={arrowButton} title="მიახლოება">
                <Plus className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setZoom((z) => Math.max(10, z - 1))} className={arrowButton} title="დაშორება">
                <Minus className="w-4 h-4" />
              </button>
              <select
                value={nudgeStep}
                onChange={(e) => setNudgeStep(Number(e.target.value))}
                className="h-8 w-8 text-[10px] bg-white rounded-lg text-center cursor-pointer appearance-none"
                title="ნაბიჯი მეტრებში"
              >
                {NUDGE_STEPS.map((step) => (
                  <option key={step} value={step}>
                    {step}მ
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {detected && (
        <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400">
              პინის მისამართი
              {detected.approximate && <span className="text-amber-600"> · მიახლოებითი, გადაამოწმეთ</span>}
            </p>
            <p className="text-xs text-slate-800 truncate">
              {[detected.address, detected.city].filter(Boolean).join(", ")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAddressDetected(detected.address, detected.city)}
            className="h-8 px-3 shrink-0 bg-white border border-slate-200 hover:border-[#FF5238] hover:text-[#FF5238] rounded-lg text-[11px] text-slate-700 cursor-pointer transition-colors"
          >
            ველებში ჩასმა
          </button>
        </div>
      )}

      <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-end">
        <label className="block space-y-1">
          <span className="text-[11px] text-slate-500">განედი (Latitude)</span>
          <input
            value={latInput}
            onChange={(e) => setLatInput(e.target.value)}
            onBlur={applyManualCoords}
            placeholder="41.715100"
            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-[11px] text-slate-500">გრძედი (Longitude)</span>
          <input
            value={lngInput}
            onChange={(e) => setLngInput(e.target.value)}
            onBlur={applyManualCoords}
            placeholder="44.827100"
            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
          />
        </label>
        <button
          type="button"
          onClick={applyManualCoords}
          className="h-10 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs text-slate-700 cursor-pointer"
        >
          ჩვენება
        </button>
        <button
          type="button"
          onClick={clearPin}
          disabled={!value}
          title="პინის წაშლა"
          className="h-10 w-10 flex items-center justify-center bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-xl text-slate-500 cursor-pointer disabled:opacity-40"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
