import type { Metadata } from "next";

import { ExecutiveDashboardPage } from "@/features/dashboard/components/ExecutiveDashboardPage";

export const metadata: Metadata = {
  title: "Executive Dashboard",
};

export default function DashboardPage() {
  return <ExecutiveDashboardPage />;
}
