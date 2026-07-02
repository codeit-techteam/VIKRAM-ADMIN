import { DevModuleScreen } from "@/components/shared/DevModuleScreen";

export default function CustomerExecutivePage() {
  return (
    <DevModuleScreen
      title="Customer Executive"
      subtitle="Handle customer inquiries, order escalations, and support workflows."
      features={[
        "Ticket Queue",
        "Order Escalations",
        "Customer CRM",
        "Call Logs",
        "SLA Dashboard",
      ]}
    />
  );
}
