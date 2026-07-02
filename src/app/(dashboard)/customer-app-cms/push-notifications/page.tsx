import type { Metadata } from "next";

import { PushNotificationsPageContent } from "@/features/notifications/components/PushNotificationsPageContent";

export const metadata: Metadata = {
  title: "Push Notifications",
};

export default function PushNotificationsPage() {
  return <PushNotificationsPageContent />;
}
