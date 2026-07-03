import { DevModuleScreen } from "@/components/shared/DevModuleScreen";

export default function RequisitionApprovalPage() {
  return (
    <DevModuleScreen
      title="Requisition Approval"
      subtitle="Review and approve material requisitions from sub-hubs across the network."
      features={[
        "Pending Queue",
        "Priority Sorting",
        "Bulk Approval",
        "Requisition History",
        "Hub Request Tracking",
      ]}
    />
  );
}
