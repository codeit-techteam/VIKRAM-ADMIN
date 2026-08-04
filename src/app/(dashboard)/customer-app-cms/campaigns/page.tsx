import type { Metadata } from "next";

import { CampaignsPageContent } from "@/features/cms/components/CampaignsPageContent";

export const metadata: Metadata = {
  title: "Campaign Scheduler",
};

export default function CampaignsPage() {
  return <CampaignsPageContent />;
}
