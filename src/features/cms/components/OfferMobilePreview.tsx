"use client";

import Image from "next/image";

import type {
  OfferCtaLabel,
  OfferProduct,
  OfferType,
} from "@/features/cms/types/offer.types";
import { cn } from "@/lib/utils";

interface OfferMobilePreviewProps {
  name: string;
  description?: string;
  bannerUrl?: string;
  ctaLabel: OfferCtaLabel | string;
  badge?: string;
  products: OfferProduct[];
  offerType?: OfferType;
  className?: string;
}

export function OfferMobilePreview({
  name,
  description,
  bannerUrl,
  ctaLabel,
  badge,
  products,
  className,
}: OfferMobilePreviewProps) {
  const displayName = name.trim() || "Offer title";
  const displayDescription =
    description?.trim() || "Short description appears here";
  const startingFrom = products.length
    ? Math.min(...products.map((product) => product.price))
    : null;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <p className="mb-4 text-center text-xs font-medium tracking-wide text-gray-400 uppercase">
        Live Mobile Preview
      </p>

      <div className="w-[280px] rounded-[2rem] border-8 border-gray-900 bg-black p-2 shadow-xl">
        <div className="overflow-hidden rounded-[1.4rem] bg-white">
          <div className="flex items-center justify-between bg-white px-4 py-3">
            <span className="text-[10px] font-medium text-gray-400">9:41</span>
            <span className="text-xs font-semibold text-[#1A1A1A]">
              Offers For You
            </span>
            <span className="text-[10px] font-semibold text-[#E5A01F]">
              See all →
            </span>
          </div>

          <div className="px-3 pb-3">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="relative aspect-[16/10] bg-[#F5F5F5]">
                {bannerUrl ? (
                  <Image
                    src={bannerUrl}
                    alt={displayName}
                    fill
                    className="object-cover"
                    sizes="264px"
                    unoptimized={bannerUrl.startsWith("blob:")}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">
                    Banner preview
                  </div>
                )}
                {badge ? (
                  <span className="absolute top-2 left-2 rounded-md bg-[#FEB623] px-2 py-0.5 text-[9px] font-bold tracking-wide text-[#1A1A1A] uppercase">
                    {badge}
                  </span>
                ) : null}
              </div>
              <div className="space-y-2 p-3">
                <h3 className="line-clamp-2 text-sm font-bold text-[#1A1A1A]">
                  {displayName}
                </h3>
                <p className="line-clamp-2 text-[11px] text-[#666666]">
                  {displayDescription}
                </p>
                {startingFrom ? (
                  <p className="text-xs font-semibold text-[#1A1A1A]">
                    From ₹{startingFrom.toLocaleString("en-IN")}
                  </p>
                ) : null}
                <p className="text-[10px] text-[#64748B]">
                  {products.length} product{products.length === 1 ? "" : "s"}{" "}
                  included
                </p>
                <button
                  type="button"
                  className="w-full rounded-lg bg-[#FEB623] py-2 text-xs font-bold text-[#1A1A1A]"
                >
                  {ctaLabel || "Shop Now"} →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
