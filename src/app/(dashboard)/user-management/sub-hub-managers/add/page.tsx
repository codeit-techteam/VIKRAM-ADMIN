import type { Metadata } from "next";

import { ManagerOnboardingWizard } from "@/features/user-management/components/sub-hub-manager/onboarding/ManagerOnboardingWizard";

export const metadata: Metadata = {
  title: "Create Sub-Hub Manager",
};

export default function CreateManagerPage() {
  return <ManagerOnboardingWizard />;
}
