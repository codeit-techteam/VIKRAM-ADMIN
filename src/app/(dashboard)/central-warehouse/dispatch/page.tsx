import type { Metadata } from "next";

import { DispatchQueue } from "@/components/dispatch/DispatchQueue";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Dispatch Control",
};

export default function DispatchControlPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Dispatch Control"
        subtitle="Monitor and manage outbound dispatches from the central warehouse."
      />

      <DispatchQueue />
    </div>
  );
}
