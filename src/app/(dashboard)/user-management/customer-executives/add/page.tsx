import type { Metadata } from "next";

import { ExecutiveOnboardingWizard } from "@/features/user-management/components/customer-executive/onboarding/ExecutiveOnboardingWizard";

export const metadata: Metadata = {
  title: "Create Customer Executive",
};

export default function CreateExecutivePage() {
  return <ExecutiveOnboardingWizard />;
}
