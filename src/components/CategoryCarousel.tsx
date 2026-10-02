"use client";

import { useEffect, useRef } from "react";
import { DragSafeLink } from "@/components/DragSafeLink";
import { AllCategoriesTile, HomeCategoryCardFace } from "@/components/home/HomeCategoryCardFace";
import { useStore } from "@/store/useStore";
import type { HomeCategoryCard } from "@/types/homeCategoryStrip";

export default function CategoryCarousel({ items = [] }: { items?: HomeCategoryCard[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragLockRef = useRef(false);
  const drag = useRef({ active: false, x: 0, scroll: 0, moved: false, lastX: 0, lastT: 0, velocity: 0 });
  const { toggleMegaMenu, isMegaMenuOpen } = useStore();
  const rowOne = items.filter((item) => item.row !== 2);
  const rowTwo = items.filter((item) => item.row === 2);

  useEffect(() => {
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      const state = drag.current;
      const el = scrollerRef.current;
      if (!state.active || !el) return;
      const dx = event.clientX - state.x;
      if (Math.abs(dx) > 6) {
        state.moved = true;
        dragLockRef.current = true;
      }
      el.scrollLeft = state.scroll - dx;
      const now = performance.now();
      const dt = now - state.lastT;
      if (dt > 0) state.velocity = (event.clientX - state.lastX) / dt;
      state.lastX = event.clientX;
      state.lastT = now;
    };

    const onUp = () => {
      const state = drag.current;
      const el = scrollerRef.current;
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
      window.setTimeout(() => {
        dragLockRef.current = false;
        state.moved = false;
      }, 80);
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

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const el = scrollerRef.current;
    if (!el) return;
    const now = performance.now();
    drag.current = {
      active: true,
      x: event.clientX,
      scroll: el.scrollLeft,
      moved: false,
      lastX: event.clientX,
      lastT: now,
      velocity: 0,
    };
    dragLockRef.current = false;
  };

  const renderCard = (card: HomeCategoryCard) => (
    <DragSafeLink
      key={card.id}
      href={card.href || `/catalog?category=${encodeURIComponent(card.slug)}`}
      dragLockRef={dragLockRef}
      className="shrink-0"
    >
      <HomeCategoryCardFace card={card} />
    </DragSafeLink>
  );

  return (
    <section className="w-full pt-3 sm:pt-6 select-none">
      <div className="container mx-auto max-w-[1560px] px-4 lg:px-8">
        <div
          ref={scrollerRef}
          onPointerDown={startDrag}
          className="cursor-grab overflow-x-auto overflow-y-hidden no-scrollbar active:cursor-grabbing"
        >
          <div className="flex w-max flex-col gap-3 pb-1">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => {
                  if (dragLockRef.current) return;
                  if (!isMegaMenuOpen) window.scrollTo({ top: 0, behavior: "smooth" });
                  toggleMegaMenu();
                }}
                className="shrink-0 cursor-pointer"
              >
                <AllCategoriesTile />
              </button>
              {rowOne.map(renderCard)}
            </div>
            {rowTwo.length > 0 ? (
              <div className="flex items-start gap-3">{rowTwo.map(renderCard)}</div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
