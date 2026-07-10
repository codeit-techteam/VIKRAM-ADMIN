import type { Metadata } from "next";

import { UserOnboardingPage } from "@/features/user-management/components/UserOnboardingPage";

export const metadata: Metadata = {
  title: "User Onboarding",
};

export default function OnboardingPage() {
  return <UserOnboardingPage />;
}
