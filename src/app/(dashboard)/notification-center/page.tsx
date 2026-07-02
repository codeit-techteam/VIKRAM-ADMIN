import { DevModuleScreen } from "@/components/shared/DevModuleScreen";

export default function NotificationCenterPage() {
  return (
    <DevModuleScreen
      title="Notification Center"
      subtitle="Configure and broadcast SMS, email, push, and in-app notifications."
      features={[
        "Notification Templates",
        "Broadcast Campaigns",
        "Delivery Reports",
        "Audience Segments",
        "Scheduled Alerts",
      ]}
    />
  );
}
