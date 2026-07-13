import type { Metadata } from "next";

import { OfferForm } from "@/features/cms/components/OfferForm";

export const metadata: Metadata = {
  title: "Create Offer",
};

export default function CreateOfferPage() {
  return <OfferForm mode="create" />;
}
