"use client";

import { useEffect, useMemo, useState } from "react";

function pad(value: number) {
  return String(Math.max(0, value)).padStart(2, "0");
}

function diffParts(targetMs: number) {
  const total = Math.max(0, targetMs - Date.now());
  const days = Math.floor(total / 86_400_000);
  const hours = Math.floor((total % 86_400_000) / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);
  return { days, hours, minutes, seconds, done: total <= 0 };
}

export function ComingSoonCountdown({ isoDate }: { isoDate: string }) {
  const targetMs = useMemo(() => {
    const parsed = Date.parse(isoDate);
    return Number.isFinite(parsed) ? parsed : NaN;
  }, [isoDate]);

  const [parts, setParts] = useState(() =>
    Number.isFinite(targetMs) ? diffParts(targetMs) : null
  );

  useEffect(() => {
    if (!Number.isFinite(targetMs)) {
      setParts(null);
      return;
    }
    setParts(diffParts(targetMs));
    const id = window.setInterval(() => setParts(diffParts(targetMs)), 1000);
    return () => window.clearInterval(id);
  }, [targetMs]);

  if (!parts || parts.done) return null;

  const items = [
    { label: "დღე", value: pad(parts.days) },
    { label: "საათი", value: pad(parts.hours) },
    { label: "წუთი", value: pad(parts.minutes) },
    { label: "წამი", value: pad(parts.seconds) },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-lg">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-white/10 bg-white/5 px-2 py-3 sm:px-3 sm:py-4 text-center backdrop-blur-sm"
        >
          <div className="font-mono text-xl sm:text-3xl tracking-tight text-white tabular-nums">
            {item.value}
          </div>
          <div className="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.18em] text-white/45">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
