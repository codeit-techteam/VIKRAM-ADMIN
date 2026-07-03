import { DevModuleScreen } from "@/components/shared/DevModuleScreen";

export default function TransferManagementPage() {
  return (
    <DevModuleScreen
      title="Transfer Management"
      subtitle="Create and track inter-warehouse and hub-to-hub stock transfers."
      features={[
        "Create Transfer",
        "In-Transit Tracking",
        "Transfer Receipt",
        "Transfer History",
        "Route Optimization",
      ]}
    />
  );
}
