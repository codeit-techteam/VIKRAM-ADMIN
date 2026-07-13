import type { Metadata } from "next";

import { OffersPageContent } from "@/features/cms/components/OffersPageContent";

export const metadata: Metadata = {
  title: "Offer Management",
};

export default function OffersPage() {
  return <OffersPageContent />;
}
