import type { Metadata } from "next";

import { TransferPage } from "@/components/transfers/TransferPage";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Transfer Management",
};

function formatOperationalDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function TransferManagementPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Transfer Management"
        subtitle="Monitor inter-warehouse and hub-to-hub stock transfers across the network."
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

      <TransferPage />
    </div>
  );
}
