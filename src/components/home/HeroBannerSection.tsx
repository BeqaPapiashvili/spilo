"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import CategoryCarousel from "@/components/CategoryCarousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { HeroSlideItem, DEFAULT_HERO_SLIDES } from "@/types/storefront";
import type { HomeCategoryCard } from "@/types/homeCategoryStrip";

interface HeroBannerSectionProps {
  title?: string | null;
  subtitle?: string | null;
  heroSlides?: HeroSlideItem[];
  config?: any;
  categoryStrip?: HomeCategoryCard[];
}

export default function HeroBannerSection({
  heroSlides,
  config,
  categoryStrip,
}: HeroBannerSectionProps = {}) {
  const router = useRouter();
  const slides: HeroSlideItem[] =
    heroSlides && heroSlides.length > 0
      ? heroSlides
      : config?.heroSlides && Array.isArray(config.heroSlides) && config.heroSlides.length > 0
      ? config.heroSlides
      : config?.bannerUrl
      ? [
          {
            id: "slide-1",
            image: config.bannerUrl,
            title: config.title || "",
            link: config.link || config.targetLink || "/catalog",
          },
        ]
      : DEFAULT_HERO_SLIDES;

  const count = slides.length;
  const looped = count > 1;
  const frameRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(looped ? 1 : 0);
  const moveToken = useRef(0);
  const drag = useRef({
    active: false,
    x: 0,
    moved: false,
    lastX: 0,
    lastT: 0,
    velocity: 0,
  });

  const [width, setWidth] = useState(0);
  const [pos, setPos] = useState(looped ? 1 : 0);
  const [offset, setOffset] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mobile, setMobile] = useState(false);
  const hoverRef = useRef(false);
  const offsetRef = useRef(0);
  const widthRef = useRef(0);
  offsetRef.current = offset;
  widthRef.current = width;

  const autoplay = config?.autoplay !== false;
  const autoplayInterval = (config?.autoplaySpeed || 5) * 1000;
  const maxPos = looped ? count + 1 : 0;
  const boundedPos = Math.min(maxPos, Math.max(0, pos));
  const realIndex = looped ? (boundedPos - 1 + count) % count : 0;

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      setWidth(frame.clientWidth);
      setMobile(frame.clientWidth < 640);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    const enable = requestAnimationFrame(() => {
      requestAnimationFrame(() => setSliding(true));
    });
    return () => {
      cancelAnimationFrame(enable);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    slides.forEach((slide) => {
      if (slide.image) {
        const img = new Image();
        img.src = slide.image;
      }
      if (slide.mobileImage) {
        const img = new Image();
        img.src = slide.mobileImage;
      }
    });
  }, [slides]);

  const place = useCallback((next: number, animate: boolean) => {
    const safe = Math.min(maxPos, Math.max(0, next));
    posRef.current = safe;
    offsetRef.current = 0;
    setOffset(0);
    setSliding(animate);
    setPos(safe);
  }, [maxPos]);

  const settleLoop = useCallback(() => {
    if (!looped) return;
    const current = posRef.current;
    if (current === 0) place(count, false);
    else if (current === maxPos) place(1, false);
  }, [count, looped, maxPos, place]);

  useEffect(() => {
    if (sliding) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setSliding(true));
    });
    return () => cancelAnimationFrame(id);
  }, [sliding, pos]);

  const go = useCallback(
    (step: number) => {
      if (!looped || step === 0) return;
      const dir = step > 0 ? 1 : -1;
      let current = posRef.current;
      const onClone = current <= 0 || current >= maxPos;
      if (onClone) {
        const rebased = current <= 0 ? count : 1;
        const next = Math.min(maxPos, Math.max(0, rebased + dir));
        const token = ++moveToken.current;
        flushSync(() => place(rebased, false));
        trackRef.current?.getBoundingClientRect();
        requestAnimationFrame(() => {
          if (moveToken.current !== token) return;
          place(next, true);
        });
        return;
      }
      moveToken.current += 1;
      place(Math.min(maxPos, Math.max(0, current + dir)), true);
    },
    [count, looped, maxPos, place]
  );

  const goTo = useCallback(
    (index: number) => {
      if (!looped) return;
      const target = Math.min(count, Math.max(1, index + 1));
      const current = posRef.current;
      const visual = current <= 0 ? count : current >= maxPos ? 1 : current;
      moveToken.current += 1;
      if (visual === target) {
        if (current !== target) place(target, false);
        return;
      }
      place(target, true);
    },
    [count, looped, maxPos, place]
  );

  useEffect(() => {
    if (!autoplay || paused || !looped) return;
    const timer = window.setInterval(() => go(1), autoplayInterval);
    return () => window.clearInterval(timer);
  }, [autoplay, autoplayInterval, go, looped, paused]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const state = drag.current;
      if (!state.active) return;
      const dx = event.clientX - state.x;
      if (Math.abs(dx) > 6) state.moved = true;
      offsetRef.current = dx;
      setOffset(dx);
      const now = performance.now();
      const dt = now - state.lastT;
      if (dt > 0) state.velocity = (event.clientX - state.lastX) / dt;
      state.lastX = event.clientX;
      state.lastT = now;
    };

    const onUp = () => {
      const state = drag.current;
      if (!state.active) return;
      state.active = false;
      const dx = offsetRef.current;
      const frameWidth = widthRef.current || 1;
      const flung = Math.abs(state.velocity) > 0.45;
      const passed = Math.abs(dx) > frameWidth * 0.14;
      if (state.moved && (passed || flung)) {
        const forward = passed ? dx < 0 : state.velocity < 0;
        go(forward ? 1 : -1);
      } else {
        offsetRef.current = 0;
        setSliding(true);
        setOffset(0);
      }
      if (!hoverRef.current) setPaused(false);
      window.setTimeout(() => {
        state.moved = false;
      }, 80);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [go]);

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!looped || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("[data-slider-control]")) return;
    const now = performance.now();
    drag.current = {
      active: true,
      x: event.clientX,
      moved: false,
      lastX: event.clientX,
      lastT: now,
      velocity: 0,
    };
    setSliding(false);
    setPaused(true);
  };

  const openSlide = (slide: HeroSlideItem) => {
    if (drag.current.moved) return;
    router.push(slide.link || "/catalog");
  };

  const track = looped ? [slides[count - 1], ...slides, slides[0]] : slides;
  const shift = width ? -boundedPos * width + offset : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <CategoryCarousel items={categoryStrip} />

      {count > 0 && (
        <section className="relative">
          <div className="container mx-auto max-w-[1560px] px-4 lg:px-8">
            <div
              ref={frameRef}
              onMouseEnter={() => {
                hoverRef.current = true;
                setPaused(true);
              }}
              onMouseLeave={() => {
                hoverRef.current = false;
                if (!drag.current.active) setPaused(false);
              }}
              onPointerDown={startDrag}
              className={`relative overflow-hidden rounded-[22px] bg-[#0e1015] shadow-[0_18px_50px_rgba(14,16,21,0.12)] select-none h-[180px] sm:h-[280px] md:h-[350px] xl:h-[400px] ${
                looped ? "cursor-grab active:cursor-grabbing" : ""
              }`}
            >
              {width > 0 && (
              <div
                ref={trackRef}
                className="flex h-full will-change-transform"
                style={{
                  transform: `translate3d(${shift}px, 0, 0)`,
                  transition: sliding ? "transform 560ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
                }}
                onTransitionEnd={(event) => {
                  if (event.target !== event.currentTarget) return;
                  settleLoop();
                }}
              >
                {track.map((slide, index) => {
                  const src = (mobile && slide.mobileImage) || slide.image;
                  return (
                    <button
                      key={`${slide.id}-${index}`}
                      type="button"
                      onClick={() => openSlide(slide)}
                      className="relative h-full w-full shrink-0 cursor-pointer"
                      style={{ width: width || "100%" }}
                      aria-label={slide.title || "ბანერი"}
                    >
                      <img
                        src={src}
                        alt={slide.title || ""}
                        draggable={false}
                        className="h-full w-full object-cover pointer-events-none"
                      />
                    </button>
                  );
                })}
              </div>
              )}

              {looped && (
                <>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      go(-1);
                    }}
                    data-slider-control
                    className="absolute left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-lg transition hover:bg-black/55 sm:grid"
                    aria-label="წინა ბანერი"
                  >
                    <ChevronLeft size={22} strokeWidth={2.4} />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      go(1);
                    }}
                    data-slider-control
                    className="absolute right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-lg transition hover:bg-black/55 sm:grid"
                    aria-label="შემდეგი ბანერი"
                  >
                    <ChevronRight size={22} strokeWidth={2.4} />
                  </button>

                  <div data-slider-control className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/45 px-3 py-2 backdrop-blur-md">
                    {slides.map((slide, index) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          goTo(index);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          index === realIndex ? "w-7 bg-white" : "w-1.5 bg-white/45 hover:bg-white/80"
                        }`}
                        aria-label={`სლაიდი ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
