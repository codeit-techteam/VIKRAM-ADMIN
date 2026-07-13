"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { OfferDetailsPageContent } from "@/features/cms/components/OfferDetailsPageContent";
import { getOfferById } from "@/features/cms/services/offer.mock-api";
import type { Offer } from "@/features/cms/types/offer.types";

interface OfferDetailsPageProps {
  params: Promise<{ offerId: string }>;
}

export default function OfferDetailsPage({ params }: OfferDetailsPageProps) {
  const { offerId } = use(params);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void getOfferById(offerId).then((result) => {
      setOffer(result);
      setIsLoading(false);
    });
  }, [offerId]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-[#64748B]">Loading offer details...</p>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-base font-semibold text-[#1A1A1A]">
          Offer not found
        </p>
        <Button
          className="mt-4"
          render={<Link href="/customer-app-cms/offers/customer-home" />}
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return <OfferDetailsPageContent offer={offer} />;
}
