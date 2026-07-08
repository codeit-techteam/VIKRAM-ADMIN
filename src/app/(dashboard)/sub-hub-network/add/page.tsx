import type { Metadata } from "next";

import { HubOnboardingWizard } from "@/components/sub-hub/onboarding/HubOnboardingWizard";

export const metadata: Metadata = {
  title: "Add New Hub",
};

export default function AddNewHubPage() {
  return <HubOnboardingWizard />;
}
