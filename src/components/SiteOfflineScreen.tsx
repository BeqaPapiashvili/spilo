import { BrandLogo } from "@/components/BrandLogo";
import { ComingSoonCountdown } from "@/components/ComingSoonCountdown";
import type { SiteStatus } from "@/lib/siteStatusShared";
import { Wrench } from "lucide-react";

function formatLaunchDate(isoDate: string) {
  const parsed = Date.parse(isoDate);
  if (!Number.isFinite(parsed)) return "";
  try {
    return new Intl.DateTimeFormat("ka-GE", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(parsed);
  } catch {
    return "";
  }
}

export function SiteOfflineScreen({
  status,
  preview = false,
}: {
  status: SiteStatus;
  preview?: boolean;
}) {
  const shell = preview
    ? "min-h-[560px]"
    : "min-h-[100dvh] -mb-[calc(5.5rem+env(safe-area-inset-bottom))] md:mb-0";

  if (status.mode === "coming_soon") {
    const launchLabel = formatLaunchDate(status.comingSoonDate);
    return (
      <div className={`relative overflow-hidden bg-[#09090B] text-white ${shell}`}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#FF5238]/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#FF5238]/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
        </div>

        <div className={`relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center ${preview ? "py-14" : "py-16 sm:py-24"}`}>
          <BrandLogo href="" inverted imgClassName="h-9 sm:h-11 w-auto" />
          <span className="mt-10 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/70">
            {status.comingSoonEyebrow}
          </span>
          <h1 className="mt-6 text-4xl leading-tight tracking-tight text-white sm:text-6xl">
            {status.comingSoonTitle}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
            {status.comingSoonSubtitle}
          </p>
          {status.comingSoonDate ? (
            <div className="mt-10 w-full flex flex-col items-center gap-4">
              <ComingSoonCountdown isoDate={status.comingSoonDate} />
              {launchLabel ? (
                <p className="text-xs text-white/40">გახსნა: {launchLabel}</p>
              ) : null}
            </div>
          ) : null}
          {status.comingSoonFooter ? (
            <p className="mt-12 text-xs tracking-wide text-white/35">{status.comingSoonFooter}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#F6F4F2] text-slate-900 ${shell}`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#FF5238]/10 blur-3xl" />
      </div>
      <div className={`relative z-10 mx-auto flex max-w-xl flex-col items-center px-6 text-center ${preview ? "py-14" : "py-20 sm:py-28"}`}>
        <BrandLogo href="" imgClassName="h-8 sm:h-10 w-auto" />
        <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-xs border border-slate-200/80 text-[#FF5238]">
          <Wrench className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-3xl tracking-tight text-slate-900 sm:text-4xl">
          {status.maintenanceTitle}
        </h1>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-500 sm:text-base">
          {status.maintenanceMessage}
        </p>
        {status.maintenanceContact ? (
          <p className="mt-8 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-600">
            {status.maintenanceContact}
          </p>
        ) : null}
        <p className="mt-10 text-xs text-slate-400">გთხოვთ, სცადოთ მოგვიანებით</p>
      </div>
    </div>
  );
}
