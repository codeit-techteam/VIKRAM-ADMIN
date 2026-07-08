import type { Metadata } from "next";

import { DispatchConfirmClient } from "@/components/dispatch/DispatchRouteClients";

export const metadata: Metadata = {
  title: "Confirm Dispatch",
};

export default function DispatchConfirmPage() {
  return <DispatchConfirmClient />;
}
