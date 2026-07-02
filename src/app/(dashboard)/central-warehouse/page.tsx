import { DevModuleScreen } from "@/components/shared/DevModuleScreen";

export default function CentralWarehousePage() {
  return (
    <DevModuleScreen
      title="Central Warehouse"
      subtitle="Monitor stock levels, inbound/outbound movements, and warehouse operations."
      features={[
        "Stock Overview",
        "Inbound GRN",
        "Outbound Dispatch",
        "Low Stock Alerts",
        "Warehouse Zones",
      ]}
    />
  );
}
