import { DevModuleScreen } from "@/components/shared/DevModuleScreen";

export default function FinancePaymentsPage() {
  return (
    <DevModuleScreen
      title="Finance & Payments"
      subtitle="Manage invoices, settlements, GST compliance, and payment reconciliation."
      features={[
        "Invoices",
        "Payment Gateway",
        "Settlements",
        "GST Reports",
        "Refund Management",
      ]}
    />
  );
}
