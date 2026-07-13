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

interface OfferDetailsPageContentProps {
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

export function OfferDetailsPageContent({
  offer,
}: OfferDetailsPageContentProps) {
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
          {
            label: "Customer App Home",
            href: "/customer-app-cms/offers/customer-home",
          },
          { label: "Offer Details" },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            Offer Details · {offer.name}
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Customer app view showing only products mapped to this offer.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-10 gap-2 px-4"
          render={<Link href="/customer-app-cms/offers/customer-home" />}
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Button>
      </div>

      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-[2rem] border-8 border-gray-900 bg-black p-2 shadow-2xl">
          <div className="max-h-[740px] overflow-y-auto rounded-[1.5rem] bg-[#F5F6F8]">
            <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-3 py-3 shadow-sm">
              <Link
                href="/customer-app-cms/offers/customer-home"
                className="flex size-8 items-center justify-center rounded-full bg-gray-100"
              >
                <ArrowLeft className="size-4 text-[#1A1A1A]" />
              </Link>
              <p className="truncate text-sm font-semibold text-[#1A1A1A]">
                Offer Details
              </p>
            </div>

            <div className="relative aspect-[16/10] bg-gray-200">
              <Image
                src={offer.mobileBanner}
                alt={offer.name}
                fill
                className="object-cover"
                sizes="400px"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-12">
                <span className="rounded bg-[#ff3f6c] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                  {OFFER_TYPE_LABELS[offer.offerType]}
                </span>
                <h2 className="mt-2 text-xl font-bold text-white">
                  {offer.name}
                </h2>
              </div>
            </div>

            <div className="space-y-4 p-4">
              <div className="flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-3 py-2.5">
                <Clock3 className="text-primary size-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold tracking-wide text-orange-700 uppercase">
                    Ends in {countdown}
                  </p>
                  <p className="truncate text-xs text-[#64748B]">
                    {formatOfferDate(offer.startDate)} –{" "}
                    {formatOfferDate(offer.endDate)}
                  </p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#64748B]">
                {offer.description}
              </p>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#1A1A1A]">
                    Offer Products
                  </h3>
                  <span className="text-xs text-[#64748B]">
                    {offer.products.length} items
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {offer.products.map((product) => (
                    <article
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
                      <div className="space-y-1 p-2.5">
                        <p className="line-clamp-2 text-xs font-semibold text-[#1A1A1A]">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-[#64748B]">
                          {product.brand}
                        </p>
                        <p className="text-primary text-xs font-bold">
                          {formatOfferPrice(product.price, product.priceUnit)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="bg-primary sticky bottom-0 w-full rounded-xl py-3 text-sm font-semibold text-white shadow-lg"
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
