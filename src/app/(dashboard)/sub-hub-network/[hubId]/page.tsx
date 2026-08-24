import type { Metadata } from "next";

import { HubDetailPage } from "@/components/sub-hub/HubDetailPage";

interface HubDetailRouteProps {
  params: Promise<{ hubId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Hub Profile",
  };
}

export default async function SubHubDetailRoute({
  params,
  searchParams,
}: HubDetailRouteProps) {
  const { hubId } = await params;
  const { tab } = await searchParams;

  return <HubDetailPage hubId={hubId} initialTab={tab} />;
}
