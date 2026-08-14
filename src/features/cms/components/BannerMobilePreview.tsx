"use client";

import { cn } from "@/lib/utils";

export type BannerPreviewVariant = "promo" | "hero";

interface BannerMobilePreviewProps {
  title?: string;
  subtitle?: string | null;
  badge?: string | null;
  ctaLabel?: string | null;
  imageUrl?: string | null;
  backgroundColor?: string | null;
  ctaColor?: string | null;
  className?: string;
  framed?: boolean;
  /** Home promo = composed card. Home hero = full-bleed uploaded artwork. */
  variant?: BannerPreviewVariant;
}

function isPreviewableImageUrl(url?: string | null): boolean {
  if (!url?.trim()) return false;
  const value = url.trim();
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("data:")
  );
}

function splitHeadline(title: string): { lead: string; accent: string } {
  const trimmed = title.trim();
  if (!trimmed) return { lead: "Banner title", accent: "" };
  if (trimmed.includes("|")) {
    const [lead, ...rest] = trimmed.split("|");
    return { lead: lead.trim() || "Banner title", accent: rest.join("|").trim() };
  }
  const match = trimmed.match(
    /^(.*?)\s+((?:bigger|flat|off|save|bid|win|saving).+)$/i,
  );
  if (match?.[1] && match[2]) {
    return { lead: match[1].trim(), accent: match[2].trim() };
  }
  return { lead: trimmed, accent: "" };
}

function isLightHex(hex: string): boolean {
  const value = hex.replace("#", "");
  if (value.length !== 6) return true;
  const n = Number.parseInt(value, 16);
  if (!Number.isFinite(n)) return true;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 168;
}

export function BannerMobilePreview({
  title,
  subtitle,
  badge,
  ctaLabel,
  imageUrl,
  backgroundColor,
  ctaColor,
  className,
  framed = true,
  variant = "promo",
}: BannerMobilePreviewProps) {
  const hasRemoteImage = isPreviewableImageUrl(imageUrl);
  const { lead, accent } = splitHeadline(title ?? "");
  const bg = backgroundColor?.trim() || "#FFF6E8";
  const ctaBg = ctaColor?.trim() || "#111111";
  const ctaText = isLightHex(ctaBg) ? "#C62828" : "#FEB623";
  const button = ctaLabel?.trim() || "Shop Now";
  const isHero = variant === "hero";

  const imageBanner = isHero ? (
    <div className="relative aspect-[343/180] overflow-hidden rounded-[18px] bg-[#E8E8E8] shadow-md">
      {hasRemoteImage ? (
        <img
          src={imageUrl!}
          alt={title?.trim() || "Hero banner"}
          className="h-full w-full object-cover object-center"
        />
      ) : (
        <div className="flex h-full items-center justify-center px-4">
          <p className="text-center text-[10px] leading-4 text-gray-400">
            Upload a full hero banner. It fills this card edge-to-edge in the
            app.
          </p>
        </div>
      )}
    </div>
  ) : (
    <div
      className="relative flex aspect-[2.15/1] overflow-hidden rounded-[18px] shadow-md"
      style={{ background: `linear-gradient(90deg, ${bg} 0%, ${bg} 100%)` }}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-3 pr-2 pl-3">
        {badge?.trim() ? (
          <span className="w-fit rounded-full bg-[#C62828] px-2 py-0.5 text-[8px] font-extrabold tracking-wide text-white uppercase">
            {badge}
          </span>
        ) : null}
        <p className="text-[13px] leading-4 font-extrabold tracking-wide text-[#111111] uppercase">
          {lead}
        </p>
        {accent ? (
          <p className="text-[13px] leading-4 font-extrabold tracking-wide text-[#C62828] uppercase">
            {accent}
          </p>
        ) : null}
        {subtitle?.trim() ? (
          <p className="line-clamp-2 text-[9px] leading-3 font-semibold text-zinc-600">
            {subtitle}
          </p>
        ) : null}
        <span
          className="mt-1 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-extrabold tracking-wide uppercase"
          style={{ backgroundColor: ctaBg, color: ctaText }}
        >
          {button}
          <span
            className="inline-flex size-3.5 items-center justify-center rounded-full text-[8px]"
            style={{ backgroundColor: ctaText, color: ctaBg }}
          >
            →
          </span>
        </span>
      </div>
      <div className="flex w-[40%] items-center justify-center py-2 pr-2">
        {hasRemoteImage ? (
          <img
            src={imageUrl!}
            alt={title?.trim() || "Promotional banner"}
            className="h-full w-full object-contain object-center"
          />
        ) : (
          <p className="px-2 text-center text-[9px] leading-3 text-gray-400">
            Product image appears here, fully visible
          </p>
        )}
      </div>
    </div>
  );

  if (!framed) {
    return <div className={cn("overflow-hidden", className)}>{imageBanner}</div>;
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <p className="mb-3 text-center text-xs font-medium tracking-wide text-gray-400 uppercase">
        Customer App preview
      </p>
      <div className="w-[280px] rounded-[2rem] border-8 border-gray-900 bg-black p-2 shadow-xl">
        <div className="overflow-hidden rounded-[1.4rem] bg-[#F5F5F5]">
          <div className="flex items-center justify-between bg-white px-4 py-3">
            <span className="text-[10px] font-medium text-gray-400">9:41</span>
            <span className="text-xs font-semibold text-[#1A1A1A]">
              Bajriwala
            </span>
            <div className="flex items-center gap-0.5">
              <span className="size-1 rounded-full bg-gray-400" />
              <span className="size-1 rounded-full bg-gray-400" />
              <span className="size-1 rounded-full bg-gray-300" />
            </div>
          </div>
          <div className="space-y-2 px-3 py-3">{imageBanner}</div>
          <div className="space-y-2 px-3 pb-3">
            <div className="h-12 rounded-2xl bg-white" />
            <div className="h-16 rounded-2xl border border-gray-200 bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
