import { DevModuleScreen } from "@/components/shared/DevModuleScreen";

export default function AnalyticsReportsPage() {
  return (
    <DevModuleScreen
      title="Analytics & Reports"
      subtitle="Business intelligence dashboards, exports, and scheduled reports."
      features={[
        "Revenue Analytics",
        "Order Trends",
        "Hub Performance",
        "Custom Reports",
        "Data Exports",
      ]}
    />
  );
}
