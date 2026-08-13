"use client";

import { Search } from "lucide-react";

import { SafeRemoteImage } from "@/components/shared/SafeRemoteImage";
import type { DeliveryPromotion } from "@/features/cms/types/delivery-promotion.types";

interface DeliveryPromotionHomePreviewProps {
  promotion?: DeliveryPromotion | null;
  imageUrl?: string | null;
  headline?: string;
  subtitle?: string;
}

export function DeliveryPromotionHomePreview({
  promotion,
  imageUrl,
  headline,
  subtitle,
}: DeliveryPromotionHomePreviewProps) {
  const banner =
    imageUrl ||
    promotion?.mobileBannerImage ||
    promotion?.bannerImage ||
    "";
  const title = headline || promotion?.headline || "Delivery promotion";
  const sub = subtitle ?? promotion?.subtitle ?? "";

  return (
    <div className="mx-auto w-[320px] overflow-hidden rounded-[2rem] border-8 border-gray-900 bg-black p-1.5 shadow-2xl">
      <div className="overflow-hidden rounded-[1.4rem] bg-[#F5F5F5]">
        <div className="bg-white px-3 pb-2 pt-3">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-semibold tracking-wide text-[#16A34A] uppercase">
                60 Mins
              </p>
              <p className="text-[11px] font-semibold text-[#1A1A1A]">
                Deliver to 560035
              </p>
            </div>
            <div className="flex size-7 items-center justify-center rounded-md bg-[#FFCB05] text-[10px] font-black">
              ⚡
            </div>
          </div>
          <div className="flex h-8 items-center gap-2 rounded-full bg-[#F3F4F6] px-3 text-[#94A3B8]">
            <Search className="size-3.5" />
            <span className="text-[11px]">Search cement, sand…</span>
          </div>
        </div>

        <div className="px-3 pt-2">
          <div className="overflow-hidden rounded-2xl bg-[#FFCB05] shadow-sm">
            {banner ? (
              <div className="relative aspect-[1024/174] w-full">
                <SafeRemoteImage
                  src={banner}
                  alt={title}
                  fill
                  className="object-contain"
                  sizes="320px"
                />
              </div>
            ) : (
              <div className="flex aspect-[1024/174] flex-col justify-center px-4">
                <p className="text-sm font-extrabold text-[#1A1A1A]">{title}</p>
                {sub ? (
                  <p className="text-[11px] text-[#1A1A1A]/80">{sub}</p>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="px-3 pt-2 pb-4">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-[#E8F0E4]">
            <div className="absolute inset-0 p-3">
              <p className="text-[10px] font-semibold tracking-wide text-[#64748B] uppercase">
                Main Promotional Banner
              </p>
              <p className="mt-1 text-sm font-bold text-[#1A1A1A]">
                Wholesale prices. Now live.
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs font-bold text-[#1A1A1A]">Offers For You</p>
          <div className="mt-2 flex gap-2">
            <div className="h-16 flex-1 rounded-xl bg-white" />
            <div className="h-16 flex-1 rounded-xl bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
