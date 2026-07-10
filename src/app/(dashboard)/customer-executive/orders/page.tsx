import { Suspense } from "react";

import { CeOrdersPage } from "@/features/customer-executive";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Orders | BuildQuick India",
  description: "Manage and track active B2B procurement orders.",
};

export default function CustomerExecutiveOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <CeOrdersPage />
    </Suspense>
  );
}
