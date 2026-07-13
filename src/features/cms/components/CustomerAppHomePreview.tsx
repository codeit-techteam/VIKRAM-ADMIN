"use client";

import { ArrowLeft, ChevronRight, Gift, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { OFFER_TYPE_LABELS } from "@/features/cms/constants/offer.mock";
import { getPublishedCarouselOffers } from "@/features/cms/services/offer.mock-api";
import type { Offer } from "@/features/cms/types/offer.types";

const HOME_BANNER = "https://picsum.photos/seed/bajriwala-home-banner/1200/480";

export function CustomerAppHomePreview() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void getPublishedCarouselOffers().then((rows) => {
      setOffers(rows);
      setIsLoading(false);
    });
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
            Published offers appear in the Offer Carousel below the home banner
            and above the loyalty card.
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
          <div className="max-h-[720px] overflow-y-auto rounded-[1.5rem] bg-[#F5F6F8]">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-[10px] text-gray-400">Good morning</p>
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  BuildQuick Contractor
                </p>
              </div>
              <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full text-xs font-bold">
                BC
              </div>
            </div>

            {/* Home Banner */}
            <section className="p-3 pb-0">
              <div className="relative aspect-[2.4/1] overflow-hidden rounded-2xl">
                <Image
                  src={HOME_BANNER}
                  alt="Home banner"
                  fill
                  className="object-cover"
                  sizes="400px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent p-4">
                  <p className="text-[10px] font-semibold tracking-wide text-white/80 uppercase">
                    Featured
                  </p>
                  <p className="mt-1 max-w-[70%] text-sm font-bold text-white">
                    Bulk procurement made simple
                  </p>
                </div>
              </div>
            </section>

            {/* Offer Carousel — below banner, above loyalty */}
            <section className="mt-4 px-3">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#1A1A1A]">
                  Offers For You
                </h2>
                <span className="text-primary text-xs font-medium">
                  See all
                </span>
              </div>

              {isLoading ? (
                <div className="flex gap-3 overflow-hidden">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-36 w-44 shrink-0 animate-pulse rounded-2xl bg-gray-200"
                    />
                  ))}
                </div>
              ) : offers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center">
                  <Gift className="mx-auto size-6 text-gray-300" />
                  <p className="mt-2 text-xs text-[#64748B]">
                    No published carousel offers yet.
                  </p>
                </div>
              ) : (
                <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
                  {offers.map((offer) => (
                    <Link
                      key={offer.id}
                      href={`/customer-app-cms/offers/${offer.id}/details`}
                      className="group relative h-40 w-44 shrink-0 overflow-hidden rounded-2xl shadow-md transition-transform hover:-translate-y-0.5"
                    >
                      <Image
                        src={offer.mobileBanner}
                        alt={offer.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="176px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                      <div className="absolute top-2 left-2 rounded bg-[#ff3f6c] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase">
                        {OFFER_TYPE_LABELS[offer.offerType].replace(
                          " Offer",
                          "",
                        )}
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-2.5">
                        <p className="line-clamp-2 text-xs font-bold text-white">
                          {offer.name}
                        </p>
                        <p className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-[#ffda79]">
                          {offer.ctaLabel}
                          <ChevronRight className="size-3" />
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Loyalty Card */}
            <section className="mt-4 px-3 pb-6">
              <div className="rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#3a3a3a] p-4 text-white shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-medium tracking-wide text-white/60 uppercase">
                      Bajriwala Loyalty
                    </p>
                    <p className="mt-1 text-lg font-bold">Gold Partner</p>
                    <p className="mt-1 text-xs text-white/70">
                      2,450 points available
                    </p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-white/10">
                    <Wallet className="size-5 text-[#ffda79]" />
                  </div>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15">
                  <div className="bg-primary h-full w-2/3 rounded-full" />
                </div>
                <p className="mt-2 text-[10px] text-white/50">
                  550 points to Platinum
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
