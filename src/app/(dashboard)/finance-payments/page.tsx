import type { Metadata } from "next";

import { FinancePaymentsPage } from "@/features/finance/components/FinancePaymentsPage";

export const metadata: Metadata = {
  title: "Finance & Payments",
};

export default function FinancePaymentsRoute() {
  return <FinancePaymentsPage />;
}
