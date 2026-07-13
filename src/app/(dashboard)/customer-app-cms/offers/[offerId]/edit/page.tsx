"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { OfferForm } from "@/features/cms/components/OfferForm";
import { getOfferById } from "@/features/cms/services/offer.mock-api";
import type { Offer } from "@/features/cms/types/offer.types";

interface EditOfferPageProps {
  params: Promise<{ offerId: string }>;
}

export default function EditOfferPage({ params }: EditOfferPageProps) {
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
        <p className="text-sm text-[#64748B]">Loading offer...</p>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-base font-semibold text-[#1A1A1A]">
          Offer not found
        </p>
        <p className="mt-1 text-sm text-[#64748B]">
          This offer may have been deleted.
        </p>
        <Button
          className="mt-4"
          render={<Link href="/customer-app-cms/offers" />}
        >
          Back to Offers
        </Button>
      </div>
    );
  }

  return <OfferForm mode="edit" initialOffer={offer} />;
}
