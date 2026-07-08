import type { Metadata } from "next";

import { DispatchLoadingClient } from "@/components/dispatch/DispatchRouteClients";

export const metadata: Metadata = {
  title: "Loading Confirmation",
};

export default function DispatchLoadingPage() {
  return <DispatchLoadingClient />;
}
