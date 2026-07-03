import type { Metadata } from "next";
import { Suspense } from "react";

import { AllocationWorkflow } from "@/components/allocation/workflow/AllocationWorkflow";
import { DataTableSkeleton } from "@/components/tables/data-table-skeleton";

export const metadata: Metadata = {
  title: "Material Allocation Workflow",
};

export default function AllocationWorkflowPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-gray-100 bg-white p-6">
          <DataTableSkeleton columns={4} rows={6} />
        </div>
      }
    >
      <AllocationWorkflow />
    </Suspense>
  );
}
