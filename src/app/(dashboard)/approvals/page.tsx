import type { Metadata } from "next";

import { ApprovalsCenterPage } from "@/features/approvals/components/ApprovalsCenterPage";

export const metadata: Metadata = {
  title: "Approvals Center",
};

export default function ApprovalsPage() {
  return <ApprovalsCenterPage />;
}
