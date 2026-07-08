import type { Metadata } from "next";
import { Suspense } from "react";

import { TransferWorkflow } from "@/components/transfers/workflow/TransferWorkflow";
import { DataTableSkeleton } from "@/components/tables/data-table-skeleton";

export const metadata: Metadata = {
  title: "Create Transfer",
};

export default function CreateTransferPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-gray-100 bg-white p-6">
          <DataTableSkeleton columns={4} rows={6} />
        </div>
      }
    >
      <TransferWorkflow />
    </Suspense>
  );
}
