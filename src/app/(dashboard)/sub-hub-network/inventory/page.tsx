import { Suspense } from "react";
import type { Metadata } from "next";

import { HubInventoryOverviewPage } from "@/components/sub-hub/inventory/HubInventoryOverviewPage";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Hub Inventory Overview",
};

function HubInventoryFallback() {
  return (
    <div className="space-y-5">
      <div>
        <Skeleton className="h-8 w-72" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-16 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

export default function HubInventoryPage() {
  return (
    <Suspense fallback={<HubInventoryFallback />}>
      <HubInventoryOverviewPage />
    </Suspense>
  );
}
