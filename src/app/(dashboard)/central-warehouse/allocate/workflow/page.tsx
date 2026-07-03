import type { Metadata } from "next";

import { AllocationWorkflow } from "@/components/allocation/workflow/AllocationWorkflow";

export const metadata: Metadata = {
  title: "Material Allocation Workflow",
};

export default function AllocationWorkflowPage() {
  return <AllocationWorkflow />;
}
