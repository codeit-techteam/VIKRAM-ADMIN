import type { Metadata } from "next";

import { DispatchSuccessClient } from "@/components/dispatch/DispatchRouteClients";

export const metadata: Metadata = {
  title: "Dispatch Success",
};

export default function DispatchSuccessPage() {
  return <DispatchSuccessClient />;
}
