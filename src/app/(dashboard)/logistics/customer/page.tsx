import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/PageHeader";
import { CustomerLogisticsPage } from "@/features/logistics";

export const metadata: Metadata = {
  title: "Customer Logistics",
};

export default function CustomerLogisticsRoute() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Customer Logistics"
        subtitle="Monitor last-mile deliveries from sub-hubs to customers."
      />
      <CustomerLogisticsPage />
    </div>
  );
}
