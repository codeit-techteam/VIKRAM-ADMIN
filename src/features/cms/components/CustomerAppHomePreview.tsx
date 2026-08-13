"use client";

import { ArrowLeft, ChevronRight, Gift } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { getPublishedCarouselOffers } from "@/features/cms/services/offer.mock-api";
import type { Offer } from "@/features/cms/types/offer.types";

export function CustomerAppHomePreview() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getPublishedCarouselOffers()
      .then((rows) => {
        if (cancelled) return;
        setOffers(rows);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setOffers([]);
        setError(
          err instanceof Error ? err.message : "Could not load published offers",
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Customer App CMS", href: "/customer-app-cms" },
          { label: "Offer Management", href: "/customer-app-cms/offers" },
          { label: "Customer App Home" },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">
            Customer App Home Preview
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Published Offer Management items appear in Offers For You. Promotional
            Banners stay in the home banner area above.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-10 gap-2 px-4"
          render={<Link href="/customer-app-cms/offers" />}
        >
          <ArrowLeft className="size-4" />
          Back to Offers
        </Button>
      </div>

      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-[2rem] border-8 border-gray-900 bg-black p-2 shadow-2xl">
          <div className="max-h-[720px] overflow-y-auto rounded-[1.5rem] bg-white">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-[10px] text-gray-400">Good morning</p>
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  BuildQuick Contractor
                </p>
              </div>
              <div className="flex size-8 items-center justify-center rounded-full bg-[#FFF4D1] text-xs font-bold text-[#1A1A1A]">
                BC
              </div>
            </div>

            <section className="p-3 pb-0">
              <div className="relative aspect-[2.4/1] overflow-hidden rounded-2xl bg-[#FFCB05]">
                <div className="absolute inset-0 p-4">
                  <p className="text-[10px] font-semibold tracking-wide text-[#1A1A1A]/70 uppercase">
                    Promotional Banner
                  </p>
                  <p className="mt-1 max-w-[80%] text-sm font-bold text-[#1A1A1A]">
                    Home promo banners stay separate from Offers For You
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-4 px-3 pb-6">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#1A1A1A]">
                  Offers For You
                </h2>
                <span className="text-xs font-semibold text-[#E5A01F]">
                  See all →
                </span>
              </div>

              {isLoading ? (
                <div className="flex gap-3 overflow-hidden">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-52 w-56 shrink-0 animate-pulse rounded-2xl bg-gray-100"
                    />
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-dashed border-red-100 bg-red-50 px-4 py-8 text-center">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              ) : offers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#F5F5F5] px-4 py-8 text-center">
                  <Gift className="mx-auto size-6 text-gray-300" />
                  <p className="mt-2 text-xs text-[#64748B]">
                    No active published offers yet.
                  </p>
                </div>
              ) : (
                <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
                  {offers.map((offer) => {
                    const banner =
                      offer.mobileBanner || offer.desktopBanner || "";
                    const fromPrice = offer.products.length
                      ? Math.min(...offer.products.map((p) => p.price))
                      : null;
                    return (
                      <Link
                        key={offer.id}
                        href={`/customer-app-cms/offers/${offer.id}/details`}
                        className="w-56 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-transform hover:-translate-y-0.5"
                      >
                        <div className="relative aspect-[16/10] bg-[#F5F5F5]">
                          {banner ? (
                            <Image
                              src={banner}
                              alt={offer.name}
                              fill
                              className="object-cover"
                              sizes="224px"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-gray-400">
                              Bajriwala
                            </div>
                          )}
                          {offer.badge ? (
                            <span className="absolute top-2 left-2 rounded-md bg-[#FEB623] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[#1A1A1A] uppercase">
                              {offer.badge}
                            </span>
                          ) : null}
                        </div>
                        <div className="space-y-1 p-2.5">
                          <p className="line-clamp-2 text-xs font-bold text-[#1A1A1A]">
                            {offer.name}
                          </p>
                          <p className="line-clamp-2 text-[10px] text-[#666666]">
                            {offer.description}
                          </p>
                          {fromPrice ? (
                            <p className="text-[11px] font-semibold text-[#1A1A1A]">
                              From ₹{fromPrice.toLocaleString("en-IN")}
                            </p>
                          ) : null}
                          <p className="text-[10px] text-[#64748B]">
                            {offer.products.length} products included
                          </p>
                          <p className="flex items-center gap-0.5 text-[11px] font-bold text-[#E5A01F]">
                            {offer.ctaLabel}
                            <ChevronRight className="size-3" />
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
