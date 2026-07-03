import type { Metadata } from "next";

import { RequisitionPage } from "@/components/requisitions/RequisitionPage";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Requisition Approval Center",
};

function formatOperationalDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function RequisitionApprovalPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Requisition Approval Center"
        subtitle="Manage and authorize material requests across regional hubs."
        actions={
          <div className="text-right">
            <p className="text-[10px] font-semibold tracking-[0.12em] text-gray-400 uppercase">
              Operational Status
            </p>
            <p className="text-primary mt-0.5 text-lg font-bold">
              {formatOperationalDate(new Date())}
            </p>
          </div>
        }
      />

      <RequisitionPage />
    </div>
  );
}
