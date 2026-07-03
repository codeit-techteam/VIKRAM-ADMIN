import { DevModuleScreen } from "@/components/shared/DevModuleScreen";

export default function AllocationCenterPage() {
  return (
    <DevModuleScreen
      title="Allocation Center"
      subtitle="Allocate available inventory to approved requisitions and regional hubs."
      features={[
        "Stock Allocation",
        "Hub Priority Rules",
        "Reservation Management",
        "Allocation History",
        "Capacity Planning",
      ]}
    />
  );
}
