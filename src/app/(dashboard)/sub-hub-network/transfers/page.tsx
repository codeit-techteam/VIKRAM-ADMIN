import { Suspense } from "react";
import type { Metadata } from "next";

import { HubTransfersPage } from "@/components/sub-hub/transfers/HubTransfersPage";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Hub Transfers",
};

function HubTransfersFallback() {
  return (
    <div className="space-y-5">
      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

export default function HubTransfersRoute() {
  return (
    <Suspense fallback={<HubTransfersFallback />}>
      <HubTransfersPage />
    </Suspense>
  );
}
