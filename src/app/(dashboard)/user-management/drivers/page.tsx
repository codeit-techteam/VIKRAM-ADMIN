import type { Metadata } from "next";

import { DriversPageContent } from "@/features/user-management/components/drivers";

export const metadata: Metadata = {
  title: "Drivers · User Management",
  description:
    "Manage fleet drivers, vehicle assignments, hub transfers, and trip readiness.",
};

export default function UserManagementDriversPage() {
  return <DriversPageContent />;
}
