"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Loader2, Plus, RotateCw, Search, Trash2 } from "lucide-react";
import { AllCategoriesTile, HomeCategoryCardFace } from "@/components/home/HomeCategoryCardFace";
import {
  homeCategoryCardWidth,
  resolveHomeCategoryFrame,
  type HomeCategoryCard,
  type HomeCategoryImage,
} from "@/types/homeCategoryStrip";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  parentName: string | null;
  href: string;
};

function categoryPath(category: CategoryOption) {
  return category.parentName ? `${category.parentName} / ${category.name}` : category.name;
}

function CategoryPicker({
  categories,
  onPick,
}: {
  categories: CategoryOption[];
  onPick: (category: CategoryOption) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((category) => (
      `${category.name} ${category.parentName || ""} ${category.slug}`.toLowerCase().includes(q)
    ));
  }, [categories, query]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-2">
      <div className="relative mb-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="კატეგორიის ძებნა"
          className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-800 outline-none focus:border-[#FF5238]"
        />
      </div>
      <div className="max-h-64 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-2 py-3 text-xs text-slate-500">
            {categories.length === 0 ? "ყველა კატეგორია უკვე დამატებულია" : "კატეგორია ვერ მოიძებნა"}
          </p>
        ) : filtered.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onPick(category)}
            className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-800 hover:bg-white"
          >
            {category.name}
            {category.parentName ? <span className="text-slate-400"> · {category.parentName}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

const EDITOR_SCALE = 2.4;
const STAGE_TOP = 16;

type DragState = {
  pointerId: number;
  mode: "move" | "scale" | "rotate" | "width" | "height";
  x: number;
  y: number;
  layerId: string;
  layer: HomeCategoryImage;
  width: number;
  height: number;
  startDist: number;
};

export default function AdminHomeCategoriesPage() {
  const [items, setItems] = useState<HomeCategoryCard[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pickerRow, setPickerRow] = useState<1 | 2 | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [layerId, setLayerId] = useState<string | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewDrag = useRef({ active: false, x: 0, scroll: 0, moved: false, lastX: 0, lastT: 0, velocity: 0 });

  useEffect(() => {
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      const state = previewDrag.current;
      const el = previewRef.current;
      if (!state.active || !el) return;
      const dx = event.clientX - state.x;
      if (Math.abs(dx) > 6) state.moved = true;
      el.scrollLeft = state.scroll - dx;
      const now = performance.now();
      const dt = now - state.lastT;
      if (dt > 0) state.velocity = (event.clientX - state.lastX) / dt;
      state.lastX = event.clientX;
      state.lastT = now;
    };
    const onUp = () => {
      const state = previewDrag.current;
      const el = previewRef.current;
      if (!state.active || !el) return;
      state.active = false;
      let velocity = state.velocity * 16;
      const glide = () => {
        if (!el || Math.abs(velocity) < 0.4) return;
        el.scrollLeft -= velocity;
        velocity *= 0.92;
        frame = window.requestAnimationFrame(glide);
      };
      glide();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/home-categories");
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "ვერ ჩაიტვირთა");
        const next = (json.data.items || []) as HomeCategoryCard[];
        setItems(next);
        setCategories(json.data.categories || []);
        setSelectedId(next[0]?.id || null);
        setLayerId(next[0]?.images?.at(-1)?.id || null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "ვერ ჩაიტვირთა");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const usedIds = useMemo(() => new Set(items.map((item) => item.categoryId).filter(Boolean)), [items]);
  const available = categories.filter((category) => !usedIds.has(category.id));
  const selected = items.find((item) => item.id === selectedId) || null;
  const linkedCategory = selected ? categories.find((entry) => entry.id === selected.categoryId) : undefined;
  const selectedFrame = selected ? resolveHomeCategoryFrame(selected) : null;
  const activeLayer = selectedFrame?.images.find((image) => image.id === layerId) || selectedFrame?.images.at(-1) || null;

  const updateItem = (id: string, patch: Partial<HomeCategoryCard>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const updateLayer = (cardId: string, id: string, patch: Partial<HomeCategoryImage>) => {
    setItems((prev) => prev.map((item) => {
      if (item.id !== cardId) return item;
      return {
        ...item,
        images: item.images.map((image) => (image.id === id ? { ...image, ...patch } : image)),
      };
    }));
  };

  const move = (id: string, direction: -1 | 1) => {
    setItems((prev) => {
      const current = prev.find((item) => item.id === id);
      if (!current) return prev;
      const rowItems = prev.filter((item) => item.row === current.row);
      const index = rowItems.findIndex((item) => item.id === id);
      const neighbor = rowItems[index + direction];
      if (!neighbor) return prev;
      const next = [...prev];
      const from = next.findIndex((item) => item.id === id);
      const to = next.findIndex((item) => item.id === neighbor.id);
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  const shiftLayer = (card: HomeCategoryCard, id: string, direction: -1 | 1) => {
    const index = card.images.findIndex((image) => image.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= card.images.length) return;
    const images = [...card.images];
    [images[index], images[nextIndex]] = [images[nextIndex], images[index]];
    updateItem(card.id, { images });
  };

  const addCategory = (category: CategoryOption, row: 1 | 2) => {
    const label = category.name;
    const width = homeCategoryCardWidth(label);
    const card: HomeCategoryCard = {
      id: `card-${category.id}`,
      categoryId: category.id,
      slug: category.slug,
      href: category.href,
      label,
      row,
      width,
      height: 100,
      images: [],
    };
    setItems((prev) => [...prev, card]);
    setSelectedId(card.id);
    setLayerId(null);
    setPickerRow(null);
  };

  const uploadImages = async (list: FileList | null) => {
    if (!selected || !list?.length) return;
    setUploading(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of Array.from(list)) {
        if (!file.type.startsWith("image/")) continue;
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!data.success || !data.url) throw new Error(data.error || "ატვირთვა ვერ მოხერხდა");
        urls.push(data.url);
      }
      if (urls.length === 0) return;
      let lastId = "";
      setItems((prev) => prev.map((item) => {
        if (item.id !== selected.id) return item;
        const room = Math.max(0, 6 - item.images.length);
        const added = urls.slice(0, room).map((src, index) => {
          const id = `img-${Date.now()}-${index}`;
          lastId = id;
          return {
            id,
            src,
            x: 28 + (item.images.length + index) * 16,
            y: 8,
            w: 88,
            h: 88,
            rotate: 0,
          };
        });
        return { ...item, images: [...item.images, ...added] };
      }));
      if (lastId) setLayerId(lastId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ატვირთვა ვერ მოხერხდა");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/home-categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "შენახვა ვერ მოხერხდა");
      setItems(json.data.items);
      setMessage("შენახულია. მთავარ გვერდზე ზუსტად ეს ჩანს.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "შენახვა ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  };

  const startDrag = (
    event: React.PointerEvent,
    mode: DragState["mode"],
    card: HomeCategoryCard,
    layer?: HomeCategoryImage,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const frame = resolveHomeCategoryFrame(card);
    const current = layer || frame.images.find((image) => image.id === layerId) || frame.images.at(-1);
    if ((mode === "move" || mode === "scale" || mode === "rotate") && current) setLayerId(current.id);
    const stage = stageRef.current?.getBoundingClientRect();
    const centerX = current && stage ? stage.left + (current.x + current.w / 2) * EDITOR_SCALE : 0;
    const centerY = current && stage ? stage.top + STAGE_TOP + (current.y + current.h / 2) * EDITOR_SCALE : 0;
    const startDist = current && stage
      ? Math.hypot(event.clientX - centerX, event.clientY - centerY)
      : 1;
    dragRef.current = {
      pointerId: event.pointerId,
      mode,
      x: event.clientX,
      y: event.clientY,
      layerId: current?.id || "",
      layer: current || { id: "", src: "", x: 0, y: 0, w: 88, h: 88, rotate: 0 },
      width: frame.width,
      height: frame.height,
      startDist: Math.max(8, startDist),
    };
  };

  const onDrag = (event: React.PointerEvent, card: HomeCategoryCard) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = (event.clientX - drag.x) / EDITOR_SCALE;
    const dy = (event.clientY - drag.y) / EDITOR_SCALE;
    if (drag.mode === "width") {
      updateItem(card.id, { width: Math.round(Math.min(360, Math.max(110, drag.width + dx))) });
      return;
    }
    if (drag.mode === "height") {
      updateItem(card.id, { height: Math.round(Math.min(220, Math.max(72, drag.height + dy))) });
      return;
    }
    if (!drag.layerId) return;
    if (drag.mode === "move") {
      updateLayer(card.id, drag.layerId, {
        x: Math.round(drag.layer.x + dx),
        y: Math.round(drag.layer.y + dy),
      });
      return;
    }
    const stage = stageRef.current?.getBoundingClientRect();
    if (!stage) return;
    const cx = stage.left + (drag.layer.x + drag.layer.w / 2) * EDITOR_SCALE;
    const cy = stage.top + STAGE_TOP + (drag.layer.y + drag.layer.h / 2) * EDITOR_SCALE;
    if (drag.mode === "rotate") {
      const degrees = Math.atan2(event.clientX - cx, -(event.clientY - cy)) * (180 / Math.PI);
      updateLayer(card.id, drag.layerId, { rotate: Math.round(Math.max(-180, Math.min(180, degrees))) });
      return;
    }
    const dist = Math.hypot(event.clientX - cx, event.clientY - cy);
    const nextW = Math.round(Math.min(320, Math.max(24, drag.layer.w * (dist / drag.startDist))));
    const ratio = drag.layer.h / drag.layer.w;
    const nextH = Math.round(Math.min(320, Math.max(24, nextW * ratio)));
    const centerX = drag.layer.x + drag.layer.w / 2;
    const centerY = drag.layer.y + drag.layer.h / 2;
    updateLayer(card.id, drag.layerId, {
      w: nextW,
      h: nextH,
      x: Math.round(centerX - nextW / 2),
      y: Math.round(centerY - nextH / 2),
    });
  };

  const endDrag = (event: React.PointerEvent) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  const selectCard = (item: HomeCategoryCard) => {
    if (previewDrag.current.moved) {
      previewDrag.current.moved = false;
      return;
    }
    setSelectedId(item.id);
    setLayerId(item.images.at(-1)?.id || null);
  };

  const startPreviewDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const el = previewRef.current;
    if (!el) return;
    const now = performance.now();
    previewDrag.current = {
      active: true,
      x: event.clientX,
      scroll: el.scrollLeft,
      moved: false,
      lastX: event.clientX,
      lastT: now,
      velocity: 0,
    };
  };

  const renderPreviewRow = (row: 1 | 2) => (
    <div className="flex items-start gap-3">
      {row === 1 ? <AllCategoriesTile /> : null}
      {items.filter((item) => item.row === row).map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => selectCard(item)}
          className={`shrink-0 rounded-[10px] ${selectedId === item.id ? "ring-2 ring-[#FF5238] ring-offset-2" : ""}`}
        >
          <HomeCategoryCardFace card={item} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl text-slate-900 tracking-tight">პოპულარული კატეგორიები</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            ზოლი ზუსტად ისე ჩანს, როგორც საიტზე. ბარათზე რამდენიმე სურათი ჩასვი, გადაათრიე, კუთხიდან გაზარდე და ზედა წრით გადაახარე.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving || loading}
          className="h-11 px-5 bg-[#FF5238] hover:bg-[#EA3A20] disabled:opacity-60 text-white rounded-2xl text-xs inline-flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          შენახვა
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF5238]" />
        </div>
      ) : (
        <>
          <section className="min-w-0 overflow-hidden bg-white rounded-3xl border border-slate-200/80 p-5 md:p-6">
            <p className="text-xs text-slate-500 mb-4">საიტზე ასე გამოჩნდება. მაუსით გადააწიე, რომ მთელი ზოლი ნახო.</p>
            <div
              ref={previewRef}
              onPointerDown={startPreviewDrag}
              className="w-full max-w-full cursor-grab overflow-x-auto overflow-y-hidden pb-3 active:cursor-grabbing"
            >
              <div className="flex w-max flex-col gap-3 pr-2">
                {renderPreviewRow(1)}
                {renderPreviewRow(2)}
              </div>
            </div>
          </section>

          {selected && selectedFrame ? (
            <section className="bg-white rounded-3xl border border-slate-200/80 p-5 md:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg text-slate-900">{selected.label.replace(/\n/g, " ") || "ბარათი"}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    სურათი გადაათრიე. ნარინჯისფერი კუთხე ზომავს, ზედა წრე აბრუნებს. მარჯვენა და ქვედა კიდე ბარათის ზომაა.
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" aria-label="მარცხნივ" onClick={() => move(selected.id, -1)} className="w-8 h-8 rounded-xl border border-slate-200"><ArrowLeft className="w-3.5 h-3.5 mx-auto" /></button>
                  <button type="button" aria-label="მარჯვნივ" onClick={() => move(selected.id, 1)} className="w-8 h-8 rounded-xl border border-slate-200"><ArrowRight className="w-3.5 h-3.5 mx-auto" /></button>
                  <button type="button" aria-label="რიგის შეცვლა" onClick={() => updateItem(selected.id, { row: selected.row === 1 ? 2 : 1 })} className="w-8 h-8 rounded-xl border border-slate-200">
                    {selected.row === 1 ? <ArrowDown className="w-3.5 h-3.5 mx-auto" /> : <ArrowUp className="w-3.5 h-3.5 mx-auto" />}
                  </button>
                  <button
                    type="button"
                    aria-label="ზოლიდან ამოშლა"
                    onClick={() => {
                      const rest = items.filter((entry) => entry.id !== selected.id);
                      setItems(rest);
                      setSelectedId(rest[0]?.id || null);
                      setLayerId(rest[0]?.images.at(-1)?.id || null);
                    }}
                    className="w-8 h-8 rounded-xl border border-slate-200 text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5 mx-auto" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div
                  ref={stageRef}
                  className="relative"
                  style={{ width: selectedFrame.width * EDITOR_SCALE + 28, height: selectedFrame.height * EDITOR_SCALE + 36 }}
                >
                  <div className="absolute left-0 top-4 origin-top-left" style={{ transform: `scale(${EDITOR_SCALE})` }}>
                    <HomeCategoryCardFace card={selected} />
                  </div>
                  {selectedFrame.images.map((image) => {
                    const active = image.id === activeLayer?.id;
                    return (
                      <div
                        key={image.id}
                        className="absolute"
                        style={{
                          left: image.x * EDITOR_SCALE,
                          top: image.y * EDITOR_SCALE + STAGE_TOP,
                          width: image.w * EDITOR_SCALE,
                          height: image.h * EDITOR_SCALE,
                          transform: `rotate(${image.rotate}deg)`,
                          transformOrigin: "center center",
                        }}
                      >
                        <div
                          onPointerDown={(event) => startDrag(event, "move", selected, image)}
                          onPointerMove={(event) => onDrag(event, selected)}
                          onPointerUp={endDrag}
                          className={`absolute inset-0 cursor-move border border-dashed ${active ? "border-[#FF5238]" : "border-slate-400/70"}`}
                        />
                        {active ? (
                          <>
                            <div className="pointer-events-none absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 -translate-y-full bg-[#FF5238]" />
                            <div
                              onPointerDown={(event) => startDrag(event, "rotate", selected, image)}
                              onPointerMove={(event) => onDrag(event, selected)}
                              onPointerUp={endDrag}
                              className="absolute left-1/2 top-0 z-10 h-4 w-4 -translate-x-1/2 -translate-y-6 cursor-grab rounded-full border-2 border-[#FF5238] bg-white"
                              title="გადახრა"
                            />
                            <div
                              onPointerDown={(event) => startDrag(event, "scale", selected, image)}
                              onPointerMove={(event) => onDrag(event, selected)}
                              onPointerUp={endDrag}
                              className="absolute -bottom-1.5 -right-1.5 z-10 h-3.5 w-3.5 cursor-nwse-resize rounded-sm bg-[#FF5238]"
                            />
                          </>
                        ) : null}
                      </div>
                    );
                  })}
                  <div
                    onPointerDown={(event) => startDrag(event, "width", selected)}
                    onPointerMove={(event) => onDrag(event, selected)}
                    onPointerUp={endDrag}
                    className="absolute w-3 cursor-ew-resize rounded-full bg-slate-900/70"
                    style={{ left: selectedFrame.width * EDITOR_SCALE - 4, top: STAGE_TOP, height: selectedFrame.height * EDITOR_SCALE }}
                  />
                  <div
                    onPointerDown={(event) => startDrag(event, "height", selected)}
                    onPointerMove={(event) => onDrag(event, selected)}
                    onPointerUp={endDrag}
                    className="absolute left-0 h-3 cursor-ns-resize rounded-full bg-slate-900/70"
                    style={{ top: STAGE_TOP + selectedFrame.height * EDITOR_SCALE - 4, width: selectedFrame.width * EDITOR_SCALE }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
                  multiple
                  className="hidden"
                  onChange={(event) => uploadImages(event.target.files)}
                />
                <button
                  type="button"
                  disabled={uploading || selected.images.length >= 6}
                  onClick={() => fileRef.current?.click()}
                  className="h-9 px-3 rounded-2xl border border-slate-200 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  სურათის დამატება
                </button>
                {activeLayer ? (
                  <>
                    <button type="button" onClick={() => updateLayer(selected.id, activeLayer.id, { rotate: Math.max(-180, activeLayer.rotate - 15) })} className="h-9 px-3 rounded-2xl border border-slate-200 text-xs">-15°</button>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 min-w-14">
                      <RotateCw className="w-3.5 h-3.5" />
                      {activeLayer.rotate}°
                    </span>
                    <button type="button" onClick={() => updateLayer(selected.id, activeLayer.id, { rotate: Math.min(180, activeLayer.rotate + 15) })} className="h-9 px-3 rounded-2xl border border-slate-200 text-xs">+15°</button>
                    <button type="button" onClick={() => shiftLayer(selected, activeLayer.id, -1)} className="h-9 px-2 rounded-2xl border border-slate-200 text-xs">უკან</button>
                    <button type="button" onClick={() => shiftLayer(selected, activeLayer.id, 1)} className="h-9 px-2 rounded-2xl border border-slate-200 text-xs">წინ</button>
                    <button
                      type="button"
                      onClick={() => {
                        const images = selected.images.filter((image) => image.id !== activeLayer.id);
                        updateItem(selected.id, { images });
                        setLayerId(images.at(-1)?.id || null);
                      }}
                      className="h-9 px-3 rounded-2xl border border-red-200 text-xs text-red-600"
                    >
                      სურათის წაშლა
                    </button>
                  </>
                ) : null}
              </div>

              {selectedFrame.images.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedFrame.images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setLayerId(image.id)}
                      className={`h-14 w-14 rounded-xl border bg-[#fff4db] overflow-hidden ${image.id === activeLayer?.id ? "border-[#FF5238]" : "border-slate-200"}`}
                    >
                      <img src={image.src} alt="" className="h-full w-full object-contain" style={{ transform: `rotate(${image.rotate}deg)` }} />
                      <span className="sr-only">სურათი {index + 1}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">სურათი ჯერ არ არის. დაამატე ერთი ან რამდენიმე ერთად.</p>
              )}

              <label className="block space-y-1 max-w-md">
                <span className="text-[11px] text-slate-600">სახელი ბარათზე</span>
                <textarea
                  value={selected.label}
                  rows={2}
                  onChange={(event) => updateItem(selected.id, { label: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#FF5238]"
                />
              </label>
              {!selected.categoryId ? (
                <div className="max-w-md space-y-1">
                  <span className="text-[11px] text-slate-600">არსებული კატეგორია</span>
                  <CategoryPicker
                    categories={categories.filter((entry) => !usedIds.has(entry.id))}
                    onPick={(next) => updateItem(selected.id, { categoryId: next.id, slug: next.slug, href: next.href })}
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  კატალოგი: {linkedCategory ? categoryPath(linkedCategory) : selected.slug}
                </p>
              )}
            </section>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([1, 2] as const).map((row) => (
              <section key={row} className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base text-slate-900">{row === 1 ? "ზედა რიგი" : "ქვედა რიგი"}</h2>
                  <button
                    type="button"
                    onClick={() => setPickerRow(pickerRow === row ? null : row)}
                    className="h-9 px-3 rounded-2xl border border-slate-200 text-xs text-slate-700 inline-flex items-center gap-1.5 hover:border-[#FF5238] hover:text-[#FF5238]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    დამატება
                  </button>
                </div>
                {pickerRow === row ? (
                  <CategoryPicker
                    categories={available}
                    onPick={(category) => addCategory(category, row)}
                  />
                ) : null}
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
