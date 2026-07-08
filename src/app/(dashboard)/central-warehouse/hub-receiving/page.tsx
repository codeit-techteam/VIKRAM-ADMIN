import type { Metadata } from "next";

import { HubReceivingPage } from "@/components/hub-receiving/HubReceivingPage";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Hub Receiving",
};

export default function HubReceivingRoutePage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Hub Receiving"
        subtitle="Verify inbound transfers and confirm material receipt at destination hubs."
      />

      <HubReceivingPage />
    </div>
  );
}
