import type { Metadata } from "next";

import { BulkProcurementPageContent } from "@/features/bulk-procurement/components/BulkProcurementPageContent";

export const metadata: Metadata = {
  title: "Bulk Procurement · Customer Executive",
};

export default function BulkProcurementPage() {
  return <BulkProcurementPageContent />;
}
