import type { Metadata } from "next";

import { BrandAdsPageContent } from "@/features/cms/components/BrandAdsPageContent";

export const metadata: Metadata = {
  title: "Brand Advertisements",
};

export default function BrandAdsPage() {
  return <BrandAdsPageContent />;
}
