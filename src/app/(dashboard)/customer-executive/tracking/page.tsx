import { Suspense } from "react";

import { CeTrackingPage } from "@/features/customer-executive";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Order Tracking | BuildQuick India",
  description: "Real-time logistics command center for order tracking.",
};

export default function CustomerExecutiveTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <CeTrackingPage />
    </Suspense>
  );
}
