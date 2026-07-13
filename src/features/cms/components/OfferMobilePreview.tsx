"use client";

import Image from "next/image";

import {
  formatOfferPrice,
  OFFER_TYPE_LABELS,
} from "@/features/cms/constants/offer.mock";
import type {
  OfferCtaLabel,
  OfferProduct,
  OfferType,
} from "@/features/cms/types/offer.types";
import { cn } from "@/lib/utils";

interface OfferMobilePreviewProps {
  name: string;
  bannerUrl?: string;
  ctaLabel: OfferCtaLabel | string;
  products: OfferProduct[];
  offerType?: OfferType;
  className?: string;
}

export function OfferMobilePreview({
  name,
  bannerUrl,
  ctaLabel,
  products,
  offerType,
  className,
}: OfferMobilePreviewProps) {
  const displayName = name.trim() || "Offer title";
  const previewProducts = products.slice(0, 4);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <p className="mb-4 text-center text-xs font-medium tracking-wide text-gray-400 uppercase">
        Live Mobile Preview
      </p>

      <div className="w-[280px] rounded-[2rem] border-8 border-gray-900 bg-black p-2 shadow-xl">
        <div className="overflow-hidden rounded-[1.4rem] bg-[#F5F6F8]">
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

          <div className="relative aspect-[16/9] bg-gray-200">
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
            {offerType ? (
              <span className="absolute top-2 left-2 rounded bg-black/55 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-white uppercase">
                {OFFER_TYPE_LABELS[offerType]}
              </span>
            ) : null}
          </div>

          <div className="space-y-3 p-3">
            <div>
              <h3 className="line-clamp-2 text-sm font-bold text-[#1A1A1A]">
                {displayName}
              </h3>
              <p className="mt-0.5 text-[10px] text-[#64748B]">
                {products.length} product{products.length === 1 ? "" : "s"} in
                this offer
              </p>
            </div>

            <button
              type="button"
              className="bg-primary w-full rounded-lg py-2 text-xs font-semibold text-white"
            >
              {ctaLabel || "Shop Now"}
            </button>

            <div>
              <p className="mb-2 text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
                Products Preview
              </p>
              {previewProducts.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-4 text-center text-[10px] text-gray-400">
                  Select products to preview
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {previewProducts.map((product) => (
                    <div
                      key={product.id}
                      className="overflow-hidden rounded-lg border border-gray-100 bg-white"
                    >
                      <div className="relative aspect-square bg-gray-100">
                        <Image
                          src={product.thumbnailUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      </div>
                      <div className="p-1.5">
                        <p className="line-clamp-1 text-[10px] font-medium text-[#1A1A1A]">
                          {product.name}
                        </p>
                        <p className="text-primary text-[9px] font-semibold">
                          {formatOfferPrice(product.price, product.priceUnit)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
