import type { Metadata } from "next";

import { BannersPageContent } from "@/features/cms/components/BannersPageContent";

export const metadata: Metadata = {
  title: "Banner Management",
};

export default function BannerManagementPage() {
  return <BannersPageContent />;
}
