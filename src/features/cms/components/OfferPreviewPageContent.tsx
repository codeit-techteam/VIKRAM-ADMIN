"use client";

import { ArrowLeft, Clock3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  formatOfferDate,
  formatOfferPrice,
  OFFER_TYPE_LABELS,
} from "@/features/cms/constants/offer.mock";
import type { Offer } from "@/features/cms/types/offer.types";

interface OfferPreviewPageContentProps {
  offer: Offer;
}

function getMockCountdown(endDate: string): string {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return `${days}d ${hours}h ${minutes}m`;
}

export function OfferPreviewPageContent({
  offer,
}: OfferPreviewPageContentProps) {
  const countdown = useMemo(
    () => getMockCountdown(offer.endDate),
    [offer.endDate],
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Customer App CMS", href: "/customer-app-cms" },
          { label: "Offer Management", href: "/customer-app-cms/offers" },
          { label: "Preview Offer" },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            Preview · {offer.name}
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Full customer-app style preview for this offer.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="h-10 gap-2 px-4"
            render={<Link href="/customer-app-cms/offers" />}
          >
            <ArrowLeft className="size-4" />
            Back to Offers
          </Button>
          <Button
            className="h-10 px-4"
            render={<Link href={`/customer-app-cms/offers/${offer.id}/edit`} />}
          >
            Edit Offer
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-[2rem] border-8 border-gray-900 bg-black p-2 shadow-2xl">
          <div className="overflow-hidden rounded-[1.5rem] bg-[#F5F6F8]">
            <div className="flex items-center justify-between bg-white px-4 py-3">
              <span className="text-[10px] text-gray-400">9:41</span>
              <span className="text-sm font-semibold text-[#1A1A1A]">
                Bajriwala
              </span>
              <span className="text-[10px] text-gray-400">LTE</span>
            </div>

            <div className="relative aspect-[16/10] bg-gray-200">
              <Image
                src={offer.mobileBanner}
                alt={offer.name}
                fill
                className="object-cover"
                sizes="400px"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
                <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase backdrop-blur">
                  {OFFER_TYPE_LABELS[offer.offerType]}
                </span>
                <h2 className="mt-2 text-lg font-bold text-white">
                  {offer.name}
                </h2>
              </div>
            </div>

            <div className="space-y-4 p-4">
              <div className="flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-3 py-2.5">
                <Clock3 className="text-primary size-4 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold tracking-wide text-orange-700 uppercase">
                    Offer ends in
                  </p>
                  <p className="text-sm font-bold text-[#1A1A1A]">
                    {countdown}
                  </p>
                </div>
                <p className="ml-auto text-right text-[10px] text-[#64748B]">
                  {formatOfferDate(offer.startDate)}
                  <br />→ {formatOfferDate(offer.endDate)}
                </p>
              </div>

              <p className="text-sm leading-relaxed text-[#64748B]">
                {offer.description}
              </p>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#1A1A1A]">
                  Products in this offer
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {offer.products.map((product) => (
                    <div
                      key={product.id}
                      className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                    >
                      <div className="relative aspect-square bg-gray-100">
                        <Image
                          src={product.thumbnailUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="160px"
                        />
                      </div>
                      <div className="p-2.5">
                        <p className="line-clamp-2 text-xs font-semibold text-[#1A1A1A]">
                          {product.name}
                        </p>
                        <p className="text-primary mt-1 text-xs font-bold">
                          {formatOfferPrice(product.price, product.priceUnit)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="bg-primary w-full rounded-xl py-3 text-sm font-semibold text-white shadow-sm"
              >
                {offer.ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
