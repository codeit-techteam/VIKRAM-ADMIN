import { Suspense } from "react";

import { CeComplaintsPage } from "@/features/customer-executive";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Complaint Management | BuildQuick India",
  description: "Track and resolve customer complaints efficiently.",
};

export default function CustomerExecutiveComplaintsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <CeComplaintsPage />
    </Suspense>
  );
}
