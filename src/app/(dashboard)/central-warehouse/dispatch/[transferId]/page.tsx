import type { Metadata } from "next";

import { DispatchTransferDetailClient } from "@/components/dispatch/DispatchRouteClients";

export const metadata: Metadata = {
  title: "Dispatch Details",
};

export default function DispatchTransferDetailPage() {
  return <DispatchTransferDetailClient />;
}
