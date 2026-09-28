"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import CategoryCarousel from "@/components/CategoryCarousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { HeroSlideItem, DEFAULT_HERO_SLIDES } from "@/types/storefront";

interface HeroBannerSectionProps {
  title?: string | null;
  subtitle?: string | null;
  heroSlides?: HeroSlideItem[];
  config?: any;
}

interface SliderDimensions {
  centerW: number;
  centerH: number;
  sideW: number;
  sideH: number;
  D: number;
  hasSides: boolean;
  mobile: boolean;
  measured: boolean;
}

export default function HeroBannerSection({
  heroSlides,
  config,
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
            link: config.link || config.targetLink || "/catalog",
          },
        ]
      : DEFAULT_HERO_SLIDES;

  const [isPaused, setIsPaused] = useState(false);
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(0);
  const touchRef = useRef<{ x: number; y: number; basePos: number; axis: "x" | "y" | null } | null>(null);

  // Dimensions state for positioning the continuous conveyor
  const [dimensions, setDimensions] = useState<SliderDimensions>({
    centerW: 1020,
    centerH: 400,
    sideW: 260,
    sideH: 380,
    D: 664,
    hasSides: true,
    mobile: false,
    measured: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Physics animation values for continuous conveyor
  const posRef = useRef(0);
  const targetRef = useRef(0);
  const velRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // References to the 5 physical conveyor card slots
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const leftArrowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightArrowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const autoplay = config?.autoplay !== false;
  const autoplayInterval = (config?.autoplaySpeed || 5) * 1000;

  // Responsive dimension calculator matching the exact design specifications
  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;

    let centerW: number;
    let centerH: number;
    let sideW: number;
    let sideH: number;
    let D: number;
    let hasSides: boolean;

    if (containerWidth >= 1536) {
      // 2xl screens (matching 2xl:w-[260px] 2xl:h-[380px] and max-w-[1020px] 2xl:h-[400px])
      centerW = 1020;
      centerH = 400;
      sideW = 260;
      sideH = 380;
      const gap = 24;
      D = (centerW + sideW) / 2 + gap; // 664px
      hasSides = true;
    } else if (containerWidth >= 1280) {
      // xl screens (matching xl:w-[220px] xl:h-[340px] and md:h-[380px])
      sideW = 220;
      sideH = 340;
      const gap = 24;
      centerW = Math.min(1020, containerWidth - 2 * sideW - 2 * gap - 16);
      centerH = 380;
      D = (centerW + sideW) / 2 + gap;
      hasSides = true;
    } else if (containerWidth >= 640) {
      // sm / md tablet screens
      centerW = containerWidth - 32;
      centerH = 340;
      sideW = 0;
      sideH = 340;
      D = centerW + 20;
      hasSides = false;
    } else {
      // mobile screens
      centerW = containerWidth;
      centerH = Math.round(Math.min(240, Math.max(170, containerWidth * 0.52)));
      sideW = 0;
      sideH = centerH;
      D = centerW + 16;
      hasSides = false;
    }

    setDimensions({ centerW, centerH, sideW, sideH, D, hasSides, mobile: containerWidth < 640, measured: true });
  }, []);

  // Preload all slide images into memory
  useEffect(() => {
    if (!slides || slides.length === 0) return;
    slides.forEach((slide) => {
      if (slide.image) {
        const img = new Image();
        img.src = slide.image;
      }
      if (slide.mobileImage) {
        const mImg = new Image();
        mImg.src = slide.mobileImage;
      }
    });
  }, [slides]);

  // Direct DOM update on each animation frame (zero React re-renders during motion)
  const applyCardStyles = useCallback((pos: number) => {
    const N = slides.length;
    if (N === 0) return;

    const { centerW, centerH, sideW, sideH, D, hasSides, mobile } = dimensions;
    const baseIndex = Math.round(pos);

    // Update each of the 5 conveyor slots: k = -2, -1, 0, 1, 2
    for (let s = 0; s < 5; s++) {
      const k = s - 2;
      const cardEl = cardRefs.current[s];
      const contentEl = contentRefs.current[s];
      const imgEl = imgRefs.current[s];
      const overlayEl = overlayRefs.current[s];
      const leftArrowEl = leftArrowRefs.current[s];
      const rightArrowEl = rightArrowRefs.current[s];
      if (!cardEl) continue;

      const virtualIndex = baseIndex + k;
      const slideIndex = ((virtualIndex % N) + N) % N;
      const slide = slides[slideIndex];

      // Update image source if needed
      const src = (mobile && slide.mobileImage) || slide.image;
      if (imgEl && imgEl.dataset.currentSrc !== src) {
        imgEl.src = src;
        imgEl.dataset.currentSrc = src;
      }

      // Exact continuous distance from the center focus point
      const cardDiff = virtualIndex - pos;
      const absDiff = Math.abs(cardDiff);

      let x: number;
      let w: number;
      let h: number;
      let opacity: number;
      let zIndex: number;
      let overlayOpacity: number;

      if (hasSides) {
        // Desktop / 3-Card Carousel Mode
        if (absDiff <= 1) {
          // Continuous interpolation between Center (t=0) and Side (t=1)
          const t = absDiff;
          x = cardDiff * D;
          w = centerW - (centerW - sideW) * t;
          h = centerH - (centerH - sideH) * t;
          opacity = 1 - 0.3 * t; // 1.0 down to 0.70
          overlayOpacity = 0.25 * t; // 0 down to 0.25
          zIndex = t < 0.5 ? 30 : 15;
        } else if (absDiff <= 2) {
          // Continuous interpolation between Side (u=0) and Off-screen (u=1)
          const u = absDiff - 1;
          const sign = cardDiff > 0 ? 1 : -1;
          x = sign * (D + u * D * 0.75);
          w = sideW;
          h = sideH;
          opacity = Math.max(0, 0.7 - u * 0.7);
          overlayOpacity = 0.25;
          zIndex = 5;
        } else {
          // Off-screen buffer
          x = cardDiff > 0 ? D * 2.5 : -D * 2.5;
          w = sideW;
          h = sideH;
          opacity = 0;
          overlayOpacity = 0.25;
          zIndex = 0;
        }
      } else {
        // Mobile / Single Card Mode
        x = cardDiff * D;
        w = centerW;
        h = centerH;
        opacity = absDiff < 1.5 ? 1 : 0;
        overlayOpacity = 0;
        zIndex = absDiff < 0.5 ? 30 : 5;
      }

      // Apply GPU-accelerated translate3d with interpolated width, height and opacity
      cardEl.style.transform = `translate3d(calc(-50% + ${x}px), -50%, 0)`;
      cardEl.style.width = `${w}px`;
      cardEl.style.height = `${h}px`;
      cardEl.style.opacity = `${opacity}`;
      cardEl.style.zIndex = `${zIndex}`;

      if (overlayEl) {
        overlayEl.style.opacity = `${overlayOpacity}`;
      }

      // Dynamic circular cutout / notch masking on side cards
      if (contentEl) {
        if (hasSides && N > 1) {
          if (absDiff <= 0.25) {
            contentEl.style.webkitMaskImage = "none";
            contentEl.style.maskImage = "none";
          } else if (cardDiff < 0) {
            // Left banner: notch carved into its LEFT edge (0% 50%)
            const r = Math.min(27, Math.max(0, (absDiff - 0.25) / 0.5 * 27));
            const mask = `radial-gradient(circle ${r}px at 0% 50%, transparent ${Math.max(0, r - 0.5)}px, black ${r}px)`;
            contentEl.style.webkitMaskImage = mask;
            contentEl.style.maskImage = mask;
          } else {
            // Right banner: notch carved into its RIGHT edge (100% 50%)
            const r = Math.min(27, Math.max(0, (absDiff - 0.25) / 0.5 * 27));
            const mask = `radial-gradient(circle ${r}px at 100% 50%, transparent ${Math.max(0, r - 0.5)}px, black ${r}px)`;
            contentEl.style.webkitMaskImage = mask;
            contentEl.style.maskImage = mask;
          }
        } else {
          contentEl.style.webkitMaskImage = "none";
          contentEl.style.maskImage = "none";
        }
      }

      // Synchronized navigation controls attached directly to side cards
      if (leftArrowEl && rightArrowEl) {
        if (hasSides && N > 1) {
          if (cardDiff < -0.2) {
            // Left-side banner: left arrow attached and visible, right arrow hidden
            const t = Math.min(1, Math.max(0, (absDiff - 0.25) / 0.5));
            leftArrowEl.style.opacity = `${t}`;
            leftArrowEl.style.display = t > 0.01 ? "flex" : "none";
            rightArrowEl.style.opacity = "0";
            rightArrowEl.style.display = "none";
          } else if (cardDiff > 0.2) {
            // Right-side banner: right arrow attached and visible, left arrow hidden
            const t = Math.min(1, Math.max(0, (absDiff - 0.25) / 0.5));
            rightArrowEl.style.opacity = `${t}`;
            rightArrowEl.style.display = t > 0.01 ? "flex" : "none";
            leftArrowEl.style.opacity = "0";
            leftArrowEl.style.display = "none";
          } else {
            // Center banner: both arrows hidden
            leftArrowEl.style.opacity = "0";
            leftArrowEl.style.display = "none";
            rightArrowEl.style.opacity = "0";
            rightArrowEl.style.display = "none";
          }
        } else {
          leftArrowEl.style.opacity = "0";
          leftArrowEl.style.display = "none";
          rightArrowEl.style.opacity = "0";
          rightArrowEl.style.display = "none";
        }
      }
    }
  }, [slides, dimensions]);

  // Start / maintain the continuous critically damped spring physics loop
  const startPhysicsLoop = useCallback(() => {
    if (rafIdRef.current !== null) return; // Loop already active and smoothly heading to target

    lastTimeRef.current = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = currentTime;

      // Critically damped spring physics: smooth, no sudden stops, no bounce
      const stiffness = 140;
      const damping = 24;

      const diff = posRef.current - targetRef.current;
      const force = -stiffness * diff - damping * velRef.current;
      velRef.current += force * dt;
      posRef.current += velRef.current * dt;

      // Update card styles on this exact display frame
      applyCardStyles(posRef.current);

      // Settle check
      if (Math.abs(diff) < 0.001 && Math.abs(velRef.current) < 0.01) {
        posRef.current = targetRef.current;
        velRef.current = 0;
        applyCardStyles(posRef.current);
        rafIdRef.current = null;
        setCurrentDisplayIndex(((Math.round(posRef.current) % slides.length) + slides.length) % slides.length);
        return;
      }

      // Update indicator dot in real-time as card crosses center
      const realIndex = ((Math.round(posRef.current) % slides.length) + slides.length) % slides.length;
      setCurrentDisplayIndex(realIndex);

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
  }, [applyCardStyles, slides.length]);

  // Initial setup and resize observer
  useEffect(() => {
    updateDimensions();

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [updateDimensions]);

  // Apply styles whenever dimensions change
  useEffect(() => {
    applyCardStyles(posRef.current);
  }, [dimensions, applyCardStyles]);

  // Navigation actions (immediately updates continuous target and smoothly accelerates)
  const handleNext = useCallback(() => {
    targetRef.current += 1;
    startPhysicsLoop();
  }, [startPhysicsLoop]);

  const handlePrev = useCallback(() => {
    targetRef.current -= 1;
    startPhysicsLoop();
  }, [startPhysicsLoop]);

  // Clicking dots in the pagination capsule
  const handleDotClick = useCallback((dotIdx: number) => {
    const N = slides.length;
    if (N <= 1) return;

    const currentActive = ((Math.round(posRef.current) % N) + N) % N;
    let step = dotIdx - currentActive;
    if (step > N / 2) step -= N;
    if (step < -N / 2) step += N;

    targetRef.current += step;
    startPhysicsLoop();
  }, [slides.length, startPhysicsLoop]);

  // Clicking an individual card on the conveyor
  const handleCardClick = useCallback((slotIdx: number) => {
    const k = slotIdx - 2;
    const baseIndex = Math.round(posRef.current);
    const virtualIndex = baseIndex + k;
    const cardDiff = virtualIndex - posRef.current;
    const absDiff = Math.abs(cardDiff);

    if (absDiff < 0.35) {
      // Center card clicked -> navigate to link
      const N = slides.length;
      const slideIndex = ((virtualIndex % N) + N) % N;
      const slide = slides[slideIndex];
      router.push(slide.link || "/catalog");
    } else if (cardDiff > 0.35) {
      // Right side card clicked -> smoothly glide to it
      handleNext();
    } else {
      // Left side card clicked -> smoothly glide to it
      handlePrev();
    }
  }, [slides, router, handleNext, handlePrev]);

  // Autoplay timer
  useEffect(() => {
    if (!autoplay || isPaused || slides.length <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, [autoplay, isPaused, slides.length, autoplayInterval, handleNext]);

  // Touch swipe: the card follows the finger, then springs to the nearest slide
  const handleTouchStart = (e: React.TouchEvent) => {
    if (slides.length <= 1) return;
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    velRef.current = 0;
    targetRef.current = posRef.current;
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, basePos: posRef.current, axis: null };
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = touchRef.current;
    if (!touch) return;
    const dx = e.touches[0].clientX - touch.x;
    const dy = e.touches[0].clientY - touch.y;
    if (!touch.axis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      touch.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (touch.axis !== "x") return;
    posRef.current = touch.basePos - dx / dimensions.D;
    applyCardStyles(posRef.current);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = touchRef.current;
    touchRef.current = null;
    setIsPaused(false);
    if (!touch) return;
    const dx = e.changedTouches[0].clientX - touch.x;
    const base = Math.round(touch.basePos);
    if (touch.axis === "x" && Math.abs(dx) > 40) {
      targetRef.current = dx < 0 ? base + 1 : base - 1;
    } else {
      targetRef.current = base;
    }
    startPhysicsLoop();
  };

  const suppressClickAfterSwipe = (e: React.MouseEvent) => {
    if (Math.abs(posRef.current - targetRef.current) > 0.05) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <CategoryCarousel />
      </div>
    );
  }

  const isMultiple = slides.length > 1;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Top Category Carousel */}
      <CategoryCarousel />

      {/* 2. Triple Showcase Pure Image Carousel with Harmonized Frosted Glass Navigation Buttons */}
      <section className="relative overflow-hidden py-1 sm:py-2">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1560px] relative select-none">
          <div
            ref={containerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onClickCapture={suppressClickAfterSwipe}
            className={`relative w-full flex items-center justify-center select-none touch-pan-y ${
              dimensions.measured ? "" : "h-[180px] sm:h-[340px] md:h-[380px] 2xl:h-[400px]"
            }`}
            style={dimensions.measured ? { height: `${Math.max(dimensions.centerH, dimensions.sideH)}px` } : undefined}
          >
            {/* 5 PHYSICAL CONVEYOR CARD SLOTS (Continuously interpolated at 60/120fps) */}
            {[0, 1, 2, 3, 4].map((slotIdx) => (
              <div
                key={slotIdx}
                ref={(el) => {
                  cardRefs.current[slotIdx] = el;
                }}
                onClick={() => handleCardClick(slotIdx)}
                className="absolute bg-transparent will-change-transform cursor-pointer select-none group border-0 p-0"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate3d(-50%, -50%, 0)",
                  width: `${dimensions.centerW}px`,
                  height: `${dimensions.centerH}px`,
                }}
              >
                <div
                  ref={(el) => {
                    contentRefs.current[slotIdx] = el;
                  }}
                  className="w-full h-full relative rounded-[20px] sm:rounded-[28px] overflow-hidden sm:shadow-md bg-zinc-100"
                >
                  <img
                    ref={(el) => {
                      imgRefs.current[slotIdx] = el;
                    }}
                    alt="Banner"
                    draggable={false}
                    className="w-full h-full object-cover pointer-events-none group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  {/* Continuous smooth dimming overlay */}
                  <div
                    ref={(el) => {
                      overlayRefs.current[slotIdx] = el;
                    }}
                    className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300"
                    style={{ opacity: 0 }}
                  />
                </div>

                {/* Embedded Previous / Left Navigation Control attached to this card */}
                <div
                  ref={(el) => {
                    leftArrowRefs.current[slotIdx] = el;
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  role="button"
                  className="hidden xl:flex absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/2 w-[42px] h-[42px] rounded-full bg-neutral-900/40 group-hover:bg-neutral-900/60 backdrop-blur-md shadow-[0_4px_14px_rgba(0,0,0,0.22)] items-center justify-center transition-colors duration-200 pointer-events-auto cursor-pointer z-20"
                  style={{ opacity: 0, display: "none" }}
                  title="წინა ბანერი"
                  aria-label="Previous banner"
                >
                  <ChevronLeft
                    size={20}
                    strokeWidth={2.5}
                    className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                  />
                </div>

                {/* Embedded Next / Right Navigation Control attached to this card */}
                <div
                  ref={(el) => {
                    rightArrowRefs.current[slotIdx] = el;
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  role="button"
                  className="hidden xl:flex absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 w-[42px] h-[42px] rounded-full bg-neutral-900/40 group-hover:bg-neutral-900/60 backdrop-blur-md shadow-[0_4px_14px_rgba(0,0,0,0.22)] items-center justify-center transition-colors duration-200 pointer-events-auto cursor-pointer z-20"
                  style={{ opacity: 0, display: "none" }}
                  title="შემდეგი ბანერი"
                  aria-label="Next banner"
                >
                  <ChevronRight
                    size={20}
                    strokeWidth={2.5}
                    className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </div>
            ))}

            {/* REFINED MOBILE / TABLET FLOATING CHEVRONS (Only when sides are not present) */}
            {isMultiple && !dimensions.hasSides && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="hidden sm:flex xl:hidden absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-35 w-[42px] h-[42px] rounded-full bg-neutral-900/40 hover:bg-neutral-900/60 active:bg-neutral-900/75 backdrop-blur-md shadow-[0_4px_14px_rgba(0,0,0,0.22)] text-white items-center justify-center transition-colors duration-200 cursor-pointer"
                  title="წინა ბანერი"
                  aria-label="Previous banner"
                >
                  <ChevronLeft
                    size={20}
                    strokeWidth={2.5}
                    className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                  />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="hidden sm:flex xl:hidden absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-35 w-[42px] h-[42px] rounded-full bg-neutral-900/40 hover:bg-neutral-900/60 active:bg-neutral-900/75 backdrop-blur-md shadow-[0_4px_14px_rgba(0,0,0,0.22)] text-white items-center justify-center transition-colors duration-200 cursor-pointer"
                  title="შემდეგი ბანერი"
                  aria-label="Next banner"
                >
                  <ChevronRight
                    size={20}
                    strokeWidth={2.5}
                    className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                  />
                </button>
              </>
            )}

            {/* BOTTOM FROSTED DOTS PAGINATION */}
            {isMultiple && (
              <div className="hidden sm:block absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
                <div className="bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-white/15 shadow-sm">
                  {slides.map((_, dotIdx) => {
                    const isCurrent = dotIdx === currentDisplayIndex;
                    return (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDotClick(dotIdx);
                        }}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${
                          isCurrent
                            ? "w-2.5 h-2.5 bg-white ring-2 ring-white/50"
                            : "w-1.5 h-1.5 bg-white/45 hover:bg-white/80"
                        }`}
                        aria-label={`Go to slide ${dotIdx + 1}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {isMultiple && (
            <div className="sm:hidden flex items-center justify-center gap-1.5 pt-3">
              {slides.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => handleDotClick(dotIdx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    dotIdx === currentDisplayIndex ? "w-5 bg-[#FF5238]" : "w-1.5 bg-zinc-300"
                  }`}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
