import type { Metadata } from "next";

import { EmergencyBannerPageContent } from "@/features/cms/components/EmergencyBannerPageContent";

export const metadata: Metadata = {
  title: "Emergency Banner",
};

export default function EmergencyBannerPage() {
  return <EmergencyBannerPageContent />;
}
