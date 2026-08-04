import type { Metadata } from "next";

import { QuickActionsPageContent } from "@/features/cms/components/QuickActionsPageContent";

export const metadata: Metadata = {
  title: "Quick Actions",
};

export default function QuickActionsPage() {
  return <QuickActionsPageContent />;
}
