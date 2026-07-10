import { Suspense } from "react";

import { CePaymentsPage } from "@/features/customer-executive";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Payment Follow-up | BuildQuick India",
  description: "Track and verify pending customer payments.",
};

export default function CustomerExecutivePaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <CePaymentsPage />
    </Suspense>
  );
}
