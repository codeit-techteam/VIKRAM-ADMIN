import type { Metadata } from "next";

import { TransferPageContent } from "@/components/transfers/TransferPageContent";

export const metadata: Metadata = {
  title: "Transfer Management",
};

export default function TransferManagementPage() {
  return <TransferPageContent />;
}
