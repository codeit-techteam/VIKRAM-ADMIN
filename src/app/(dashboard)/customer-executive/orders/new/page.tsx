import { Suspense } from "react";

import { CeNewOrderPage } from "@/features/customer-executive";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Create Order | BuildQuick India",
  description: "Place a new order on behalf of a B2B customer.",
};

export default function CustomerExecutiveNewOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <CeNewOrderPage />
    </Suspense>
  );
}
