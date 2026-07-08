import type { Metadata } from "next";

import { DispatchControl } from "@/components/dispatch/DispatchControl";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Dispatch Control",
};

export default function DispatchControlPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Dispatch Control"
        subtitle="Manage and orchestrate outbound material dispatches for Mumbai Hub."
      />

      <DispatchControl />
    </div>
  );
}
