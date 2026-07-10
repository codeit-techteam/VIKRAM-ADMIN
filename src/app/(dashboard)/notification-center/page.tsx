import { Suspense } from "react";

import { NotificationCenterPage } from "@/features/notification-center";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Notification Center | BuildQuick India",
  description:
    "View and manage enterprise notifications across orders, payments, inventory, and operations.",
};

export default function NotificationCenterRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      }
    >
      <NotificationCenterPage />
    </Suspense>
  );
}
