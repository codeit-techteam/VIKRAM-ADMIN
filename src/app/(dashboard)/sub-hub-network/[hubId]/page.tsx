import type { Metadata } from "next";

import { HubDetailPage } from "@/components/sub-hub/HubDetailPage";
import { resolveSubHubs } from "@/store/sub-hub-state";
import { MOCK_DATABASE_SEED } from "@/mock/mock-database";

interface HubDetailRouteProps {
  params: Promise<{ hubId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({
  params,
}: HubDetailRouteProps): Promise<Metadata> {
  const { hubId } = await params;
  const hub = resolveSubHubs(MOCK_DATABASE_SEED.subHubs).find(
    (entry) => entry.id === hubId,
  );

  return {
    title: hub ? `${hub.name} · Sub-Hub` : "Hub Details",
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
